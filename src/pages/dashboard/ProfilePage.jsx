// src/pages/ProfilePage.jsx
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../assets/icons/Icons.jsx'
import { Card, Badge, Button, Input, Textarea, Select } from '../../components/ui/UI.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { MOCK_USER } from '../../data/mockData.js'
import { getProfileApi, updateProfileApi } from '../../api/userProfile.js'
import { getInterestsApi } from '../../api/global.js'
import { handleApiError } from '../../utils/handleApiError.js'
import { notifySuccess } from '../../utils/notification.js'
import { mapAuthUserToAppUser } from '../../utils/mapAuthUser.js'
import { splitMobileDisplay } from '../../utils/splitMobile.js'
import { AUTH_TOKEN_KEY, persistAuthSession } from '../../utils/authSession.js'
import { DAYS, buildDefaultDayAvail, parseAvailabilitySlots } from '../../utils/availabilitySlots.js'

const TICKETS = [
  { id:'#T001', title:'Payment not released after OTP', status:'Resolved',  date:'20 Feb 2025' },
  { id:'#T002', title:'Profile photo not updating',      status:'In Review', date:'1 Mar 2025'  },
]

function getProfileCompletion(user, interests) {
  const checks = [
    { label:'Bio',               done: !!user?.bio && user.bio.length > 10 },
    { label:'Interests (min 3)', done: interests.length >= 3 },
    { label:'Hourly Rate',       done: !!user?.hourlyRate },
    { label:'Location',          done: !!user?.location },
    { label:'Availability',      done: !!user?.availability && String(user.availability).trim().length > 0 },
    { label:'Email Verified',   done: !!user?.is_verified },
  ]
  const done = checks.filter(c => c.done).length
  return { pct: Math.round((done / checks.length) * 100), checks }
}

export default function ProfilePage() {
  const { user, setUser, logout } = useApp()
  const nav = useNavigate()
  useRef(null)

  // ── local editable state ──
  const [tab,  setTab]  = useState('profile')
  const [interestCatalog, setInterestCatalog] = useState([])
  const [selectedInterestIds, setSelectedInterestIds] = useState(user?.interestIds ?? [])
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [dayAvail, setDayAvail] = useState(buildDefaultDayAvail())

  const [formData, setFormData] = useState({
    name:         user?.name         || '',
    mobile:       user?.mobile       || '',
    email:        user?.email        || '',
    location:     user?.location     || '',
    hourlyRate:   user?.hourlyRate   ?? '',
    bio:          user?.bio          || '',
  })

  const mergeServerUser = useCallback((apiData) => {
    setUser((prev) => {
      const next = {
        ...prev,
        ...mapAuthUserToAppUser(apiData, { ...MOCK_USER, ...prev }),
      }
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (token) persistAuthSession({ token, user: next })
      return next
    })
  }, [setUser])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setProfileLoading(true)
      try {
        const [profRes, intRes] = await Promise.all([
          getProfileApi(),
          getInterestsApi().catch(() => ({ data: { data: [] } })),
        ])
        if (cancelled) return
        const catalog = intRes.data?.data || []
        const rawCat = Array.isArray(catalog) ? catalog : []
        setInterestCatalog(rawCat)

        const p = profRes.data?.data
        if (p) {
          mergeServerUser(p)
          setFormData({
            name: p.name || '',
            mobile: [p.country_code, p.phone_number].filter(Boolean).join(' ').trim(),
            email: p.email || '',
            location: p.location || p.city?.name || '',
            hourlyRate: p.rate != null ? p.rate : '',
            bio: p.bio || '',
          })
          setSelectedInterestIds((p.interests || []).map((i) => i.id).filter(Boolean))
          const slots = parseAvailabilitySlots(p.availability)
          if (slots) setDayAvail((prev) => ({ ...prev, ...slots }))
        }
      } catch (e) {
        if (!cancelled) handleApiError(e)
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [mergeServerUser])

  const resolvedInterestNames = useMemo(
    () =>
      selectedInterestIds
        .map((id) => interestCatalog.find((o) => o.id === id)?.name)
        .filter(Boolean),
    [interestCatalog, selectedInterestIds]
  )

  const upd = (f) => (e) => setFormData(p => ({ ...p, [f]: e.target.value }))
  const toggleInterestId = (id) =>
    setSelectedInterestIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    )

  const flashSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleSaveProfile = async () => {
    setSaveError('')
    try {
      const { country_code, phone_number } = splitMobileDisplay(formData.mobile)
      const res = await updateProfileApi({
        name: formData.name.trim(),
        email: formData.email.trim(),
        country_code,
        phone_number,
        bio: formData.bio,
        rate: formData.hourlyRate === '' ? null : Number(formData.hourlyRate),
        location: formData.location,
      })
      const data = res.data?.data
      if (data) mergeServerUser(data)
      notifySuccess(res.data?.message || 'Profile updated')
      flashSaved()
    } catch (e) {
      handleApiError(e)
    }
  }

  const handleSave = async () => {
    await handleSaveProfile()
  }

  const handleLogout = async () => {
    await logout()
    nav('/login')
  }

  const handleSaveInterests = async () => {
    if (selectedInterestIds.length < 3) {
      setSaveError('Select at least 3 interests')
      return
    }
    setSaveError('')
    try {
      const res = await updateProfileApi({ interest_ids: selectedInterestIds })
      const data = res.data?.data
      if (data) mergeServerUser(data)
      notifySuccess('Interests saved')
      flashSaved()
    } catch (e) {
      handleApiError(e)
    }
  }

  const { pct, checks } = getProfileCompletion(
    { ...user, ...formData, photo: user?.photo },
    resolvedInterestNames
  )
  const isComplete = pct === 100

  const TABS = ['profile', 'interests', 'availability', 'bank', 'support']

  const TAB_LABELS = {
    profile:      'Edit Profile',
    interests:    'Interests',
    availability: 'Availability',
    bank:         'Bank',
    support:      'Support',
  }

  return (
    <div className="page-wrap">
      <div className="container-sm" style={{ paddingTop:36, paddingBottom:48 }}>

        {profileLoading && (
          <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--c-muted)' }}>Loading profile…</p>
        )}

        {/* ── Profile Completion Bar ── */}
        <div style={{
          background:'var(--c-card)', border:'1px solid var(--c-border)',
          borderLeft:`5px solid ${isComplete ? 'var(--c-success)' : 'var(--c-gold)'}`,
          borderRadius:16, padding:'18px 22px', marginBottom:24,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div>
              <p style={{ fontWeight:700, fontSize:15, color:'var(--c-dark)' }}>
                {isComplete ? '🎉 Profile Complete & Live!' : 'Profile Completion'}
              </p>
              <p style={{ fontSize:12, color:'var(--c-muted)', marginTop:2 }}>
                {isComplete ? 'You are discoverable and can receive bookings.' : 'Complete all fields to go live and accept bookings.'}
              </p>
            </div>
            <span style={{ fontSize:30, fontWeight:800, color: isComplete ? 'var(--c-success)' : pct >= 60 ? 'var(--c-gold)' : 'var(--c-danger)', lineHeight:1 }}>
              {pct}%
            </span>
          </div>
          <div style={{ height:8, background:'var(--c-border)', borderRadius:10, overflow:'hidden', marginBottom:12 }}>
            <div style={{
              height:'100%', width:`${pct}%`,
              background: isComplete ? 'var(--c-success)' : pct >= 60 ? 'var(--c-gold)' : 'var(--c-danger)',
              borderRadius:10, transition:'width .5s ease',
            }} />
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {checks.map(c => (
              <span key={c.label} style={{
                display:'inline-flex', alignItems:'center', gap:4,
                fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20,
                background: c.done ? '#D1FAE5' : '#FEE2E2',
                color:      c.done ? '#065F46' : '#991B1B',
              }}>
                {c.done ? '✓' : '✗'} {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Header card ── */}
        <Card flat style={{ padding:32, marginBottom:24 }}>
          <div className="profile-header">
            {/* Avatar with click-to-change */}
            <div className="avatar-wrap" style={{ position:'relative' }}>
              <img src={user?.photo} alt={user?.name}
                style={{ width:96, height:96, borderRadius:20, objectFit:'cover', border:'3px solid var(--c-primary)' }} />
              <div className="avatar-online" />
            </div>

            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                <div>
                  <h2 className="serif" style={{ fontSize:26, fontWeight:700, color:'var(--c-dark)' }}>
                    {formData.name || user?.name}
                  </h2>
                  <p style={{ fontSize:14, color:'var(--c-muted)', marginTop:2 }}>{formData.location || user?.location}</p>
                  <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                    <Badge variant="accent">Individual</Badge>
                    {isComplete ? <Badge variant="primary">🟢 Live</Badge> : <Badge variant="muted">⚠ Incomplete</Badge>}
                  </div>
                </div>
                <Button onClick={() => setTab('profile')} variant="ghost" icon="edit" size="sm">Edit Profile</Button>
              </div>
              <div className="profile-stats">
                {[
                  { v: user?.totalBookings ?? 24,                                     l:'Bookings'      },
                  { v: `${user?.rating ?? 4.8} ★`,                                   l:'Rating'        },
                  { v: `₹${((user?.totalEarned ?? 18290)/1000).toFixed(1)}K`,        l:'Earned'        },
                  // { v: `${user?.responseRate ?? 94}%`,                               l:'Response Rate' },
                ].map(s => (
                  <div key={s.l} className="profile-stat">
                    <p className="pstat-val">{s.v}</p>
                    <p className="pstat-label">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Tab bar ── */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:24 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'9px 16px', borderRadius:10, cursor:'pointer',
              fontFamily:'var(--font-sans)', fontWeight:600, fontSize:13, transition:'all .15s',
              background: tab === t ? 'var(--c-primary)' : 'var(--c-card)',
              color:      tab === t ? '#fff'              : 'var(--c-mid)',
              boxShadow:  tab === t ? 'var(--shadow-sm)'  : 'none',
              border:     tab === t ? 'none'              : '1px solid var(--c-border)',
            }}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════
            TAB: EDIT PROFILE
        ════════════════════════════════════ */}
        {tab === 'profile' && (
          <Card flat style={{ padding:28 }}>
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:20, color:'var(--c-dark)' }}>
              Edit Profile Information
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Input label="Full Name"       value={formData.name}         onChange={upd('name')}         icon="user"     required />
              <Input label="Mobile Number"   value={formData.mobile}       onChange={upd('mobile')}                       required />
              <Input label="Email Address"   value={formData.email}        onChange={upd('email')}        type="email"    required />
              <Input label="City / Location" value={formData.location}     onChange={upd('location')}     icon="location" required />
              <Input label="Hourly Rate (₹)" value={formData.hourlyRate}   onChange={upd('hourlyRate')}   icon="rupee"    type="number" required />
            </div>
            <Textarea label="Bio" value={formData.bio} onChange={upd('bio')} rows={4}
              placeholder="Tell people about yourself — your personality, what you enjoy, and what kind of activities you're available for…" />

            <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:4 }}>
              <Button onClick={handleSave} icon="check" size="lg">Save All Changes</Button>
              {saved && (
                <span style={{ display:'flex', alignItems:'center', gap:6, color:'var(--c-success)', fontSize:13, fontWeight:600 }}>
                  <Icon name="check" size={14} color="var(--c-success)" /> Saved successfully!
                </span>
              )}
            </div>
          </Card>
        )}

        {/* ════════════════════════════════════
            TAB: INTERESTS
        ════════════════════════════════════ */}
        {tab === 'interests' && (
          <Card flat style={{ padding:28 }}>
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:6, color:'var(--c-dark)' }}>My Interests</h3>
            <p style={{ fontSize:13, color:'var(--c-muted)', marginBottom:20 }}>
              Select at least 3 interests. These determine which searches you appear in.
            </p>
            {profileLoading ? (
              <p style={{ fontSize: 14, color: 'var(--c-muted)' }}>Loading interests…</p>
            ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
              {interestCatalog.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`chip${selectedInterestIds.includes(opt.id) ? ' active' : ''}`}
                  onClick={() => toggleInterestId(opt.id)}
                >
                  {selectedInterestIds.includes(opt.id) && '✓ '}{opt.name}
                </button>
              ))}
            </div>
            )}
            {saveError && tab === 'interests' && (
              <p style={{ fontSize:12, color:'var(--c-danger)', marginBottom:8 }}>{saveError}</p>
            )}
            <p style={{ fontSize:12, marginBottom:20, fontWeight:600, color: selectedInterestIds.length >= 3 ? 'var(--c-success)' : 'var(--c-danger)' }}>
              {selectedInterestIds.length} selected {selectedInterestIds.length < 3 ? `— need ${3 - selectedInterestIds.length} more` : '— minimum met ✓'}
            </p>
            <Button onClick={handleSaveInterests} icon="check" disabled={selectedInterestIds.length < 3 || profileLoading}>Save Interests</Button>
          </Card>
        )}

        {/* ════════════════════════════════════
            TAB: AVAILABILITY
        ════════════════════════════════════ */}
        {tab === 'availability' && (
          <Card flat style={{ padding:28 }}>
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:20, color:'var(--c-dark)' }}>
              Availability Slots
            </h3>
            {DAYS.map(day => (
              <div key={day} className="avail-row">
                <div className="avail-day">{day}</div>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!dayAvail[day]?.on}
                    onChange={(e) =>
                      setDayAvail((p) => ({
                        ...p,
                        [day]: { ...(p[day] || { slot: 'Evening (6PM–10PM)' }), on: e.target.checked },
                      }))
                    }
                    style={{ accentColor:'var(--c-primary)', width:16, height:16 }}
                  />
                  <span style={{ fontSize:13, color:'var(--c-mid)' }}>Available</span>
                </label>
                <select
                  className="form-select"
                  style={{ width:'auto', padding:'7px 32px 7px 12px', fontSize:13 }}
                  value={dayAvail[day]?.slot || 'Evening (6PM–10PM)'}
                  onChange={(e) =>
                    setDayAvail((p) => ({
                      ...p,
                      [day]: { ...(p[day] || { on: false }), slot: e.target.value },
                    }))
                  }
                >
                  <option>Morning (6AM–12PM)</option>
                  <option>Afternoon (12PM–6PM)</option>
                  <option>Evening (6PM–10PM)</option>
                  <option>Night (10PM–2AM)</option>
                  <option>All Day</option>
                </select>
              </div>
            ))}
            <div style={{ marginTop:20 }}>
              <Button
                onClick={async () => {
                  setSaveError('')
                  try {
                    // backend stores availability as JSON string: { days: { [day]: {on, slot} } }
                    const availability = JSON.stringify({ days: dayAvail })
                    const res = await updateProfileApi({ availability })
                    const data = res.data?.data
                    if (data) mergeServerUser(data)
                    notifySuccess('Availability saved')
                    flashSaved()
                  } catch (e) {
                    handleApiError(e)
                  }
                }}
                icon="check"
              >
                Save Availability
              </Button>
            </div>
          </Card>
        )}

        {/* ════════════════════════════════════
            TAB: BANK
        ════════════════════════════════════ */}
        {tab === 'bank' && (
          <Card flat style={{ padding:28 }}>
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:20, color:'var(--c-dark)' }}>Bank Details</h3>
            <Input label="Account Holder Name" value={formData.name} onChange={() => {}} />
            <Input label="Bank Name" placeholder="e.g. HDFC Bank" onChange={() => {}} />
            <Input label="Account Number" placeholder="Enter account number" icon="eye" onChange={() => {}} />
            <Input label="Confirm Account Number" placeholder="Re-enter to confirm" onChange={() => {}} />
            <Input label="IFSC Code" placeholder="e.g. HDFC0001234" onChange={() => {}} />
            <Input label="Branch Name" placeholder="e.g. Bandra West" onChange={() => {}} />
            <div style={{ background:'#FEF3C7', padding:14, borderRadius:10, marginBottom:18, display:'flex', gap:10, alignItems:'flex-start' }}>
              <Icon name="shield" size={16} color="var(--c-warning)" />
              <p style={{ fontSize:12, color:'#92400E', lineHeight:1.6 }}>Your bank details are 256-bit encrypted and never shared with third parties.</p>
            </div>
            <Button onClick={handleSave} icon="check">Save Bank Details</Button>
          </Card>
        )}

        {/* ════════════════════════════════════
            TAB: SUPPORT
        ════════════════════════════════════ */}
        {tab === 'support' && (
          <Card flat style={{ padding:28 }}>
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:20, color:'var(--c-dark)' }}>Raise a Support Ticket</h3>
            <Select label="Issue Category" onChange={() => {}} options={[
              'Payment Issue','Booking Problem','Profile Verification',
              'Account Access','Refund Request','Safety Concern','Other',
            ]} />
            <Textarea label="Describe Your Issue" placeholder="Provide as much detail as possible…" rows={4} required />
            <div style={{ marginBottom:20 }}>
              <label className="form-label">Attach Screenshot (optional)</label>
              <div style={{ border:`2px dashed var(--c-border)`, borderRadius:10, padding:'20px', textAlign:'center', cursor:'pointer', color:'var(--c-muted)' }}>
                <Icon name="upload" size={24} color="var(--c-muted)" />
                <p style={{ fontSize:13, marginTop:8 }}>Click or drag file here</p>
              </div>
            </div>
            <Button icon="plus">Submit Ticket</Button>
            <div style={{ marginTop:32 }}>
              <h4 style={{ fontWeight:600, fontSize:15, color:'var(--c-dark)', marginBottom:14 }}>Previous Tickets</h4>
              {TICKETS.map(t => (
                <div key={t.id} className="ticket-card">
                  <div>
                    <p style={{ fontSize:14, fontWeight:500, color:'var(--c-dark)' }}>{t.id} – {t.title}</p>
                    <p style={{ fontSize:12, color:'var(--c-muted)', marginTop:2 }}>{t.date}</p>
                  </div>
                  <span className={`badge ${t.status==='Resolved' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Sign out ── */}
        <div style={{ marginTop:28 }}>
          <button onClick={handleLogout} style={{
            display:'flex', alignItems:'center', gap:9,
            background:'transparent', border:'1.5px solid #FEE2E2', color:'var(--c-danger)',
            padding:'11px 22px', borderRadius:9, fontSize:14, fontWeight:500,
            cursor:'pointer', fontFamily:'var(--font-sans)',
          }}>
            <Icon name="logout" size={16} color="var(--c-danger)" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
