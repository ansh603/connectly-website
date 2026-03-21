// src/pages/ProfilePage.jsx
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../assets/icons/Icons.jsx'
import { Card, Badge, Button, Input, Textarea, Select } from '../../components/ui/UI.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { MOCK_USER } from '../../data/mockData.js'
import { getProfileApi, updateProfileApi } from '../../api/userProfile.js'
import { getInterestsApi, deleteFileApi } from '../../api/global.js'
import uploadFile from '../../utils/uploadFile.js'
import { handleApiError } from '../../utils/handleApiError.js'
import { notifySuccess } from '../../utils/notification.js'
import { mapAuthUserToAppUser } from '../../utils/mapAuthUser.js'
import { splitMobileDisplay } from '../../utils/splitMobile.js'
import { BASE_IMAGE_URL } from '../../utils/config.js'
import { AUTH_TOKEN_KEY, persistAuthSession } from '../../utils/authSession.js'
import { DAYS, buildDefaultDayAvail, parseAvailabilitySlots } from '../../utils/availabilitySlots.js'
function toDisplayUrl(path) {
  if (!path) return ''
  const p = String(path)
  if (p.startsWith('http') || p.startsWith('https://') || p.startsWith('data:')) return p
  return `${BASE_IMAGE_URL.replace(/\/+$/, '')}/${p.replace(/^\/+/, '')}`
}

const TICKETS = [
  { id:'#T001', title:'Payment not released after OTP', status:'Resolved',  date:'20 Feb 2025' },
  { id:'#T002', title:'Profile photo not updating',      status:'In Review', date:'1 Mar 2025'  },
]

function getProfileCompletion(user, interests) {
  const checks = [
    { label:'Profile Photo',     done: !!user?.photo },
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
  const fileRef  = useRef(null)

  // ── local editable state ──
  const [tab,  setTab]  = useState('profile')
  const [interestCatalog, setInterestCatalog] = useState([])
  const [selectedInterestIds, setSelectedInterestIds] = useState(user?.interestIds ?? [])
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [photoPreview, setPhotoPreview] = useState(user?.photo || '')
  const [pendingProfileFile, setPendingProfileFile] = useState(null)
  const [galleryDraftItems, setGalleryDraftItems] = useState([])
  const [savedGalleryPaths, setSavedGalleryPaths] = useState([])
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
          setPhotoPreview(
            p.profile_path ? toDisplayUrl(p.profile_path) : user?.photo || ''
          )
          const paths = Array.isArray(p.gallery_paths) ? p.gallery_paths : []
          setGalleryDraftItems(paths.map((path) => ({ kind: 'existing', path })))
          setSavedGalleryPaths(paths)
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

  const galleryDisplayUrls = useMemo(
    () =>
      galleryDraftItems.map((item) =>
        item.kind === 'existing' ? toDisplayUrl(item.path) : item.preview
      ),
    [galleryDraftItems]
  )

  const resolvedInterestNames = useMemo(
    () =>
      selectedInterestIds
        .map((id) => interestCatalog.find((o) => o.id === id)?.name)
        .filter(Boolean),
    [interestCatalog, selectedInterestIds]
  )

  const [groupMembers, setGroupMembers] = useState([
    { id:1, name:'Rahul Verma',  role:'Admin',  photo: user?.photo },
    { id:2, name:'Priya Mehta',  role:'Member', photo:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&crop=face' },
    { id:3, name:'Dev Malhotra', role:'Member', photo:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face' },
  ])
  const [newMember, setNewMember] = useState('')

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

  // ── Photo upload (profile picture) ──
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingProfileFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSavePhoto = async () => {
    if (!pendingProfileFile) {
      notifySuccess('Select a new photo first, then save.')
      return
    }
    setSaveError('')
    try {
      const profile_path = await uploadFile('profile', pendingProfileFile)
      const res = await updateProfileApi({ profile_path })
      const data = res.data?.data
      if (data) mergeServerUser(data)
      setPendingProfileFile(null)
      setPhotoPreview(toDisplayUrl(profile_path))
      notifySuccess('Photo saved')
      flashSaved()
    } catch (e) {
      handleApiError(e)
    }
  }

  const handleSaveGallery = async () => {
    setSaveError('')
    try {
      const existingNow = galleryDraftItems
        .filter((it) => it.kind === 'existing')
        .map((it) => it.path)

      const removedPaths = savedGalleryPaths.filter(
        (p) => !new Set(existingNow).has(p)
      )

      const finalPaths = []
      for (const item of galleryDraftItems) {
        if (item.kind === 'existing') {
          finalPaths.push(item.path)
        } else {
          const uploadedPath = await uploadFile('gallery', item.file)
          finalPaths.push(uploadedPath)
        }
      }

      const res = await updateProfileApi({ gallery_paths: finalPaths })
      const data = res.data?.data
      if (data) {
        mergeServerUser(data)
        const nextPaths = Array.isArray(data.gallery_paths) ? data.gallery_paths : finalPaths
        // Revoke previews after we successfully saved and switched to server URLs.
        galleryDraftItems.forEach((it) => {
          if (it?.kind === 'new' && it.preview?.startsWith('blob:')) URL.revokeObjectURL(it.preview)
        })
        setSavedGalleryPaths(nextPaths)
        setGalleryDraftItems(nextPaths.map((path) => ({ kind: 'existing', path })))
      }

      // Delete removed existing files AFTER profile update succeeds.
      if (removedPaths.length) {
        const results = await Promise.allSettled(
          removedPaths.map((p) => deleteFileApi(p))
        )
        const failed = results.filter((r) => r.status === 'rejected')
        if (failed.length) {
          // Don't block UI; file delete failure shouldn't break profile save.
          console.warn('Some gallery files could not be deleted:', failed.length)
        }
      }

      notifySuccess('Gallery saved')
      flashSaved()
    } catch (e) {
      handleApiError(e)
    }
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
    { ...user, ...formData, photo: photoPreview },
    resolvedInterestNames
  )
  const isComplete = pct === 100

  const TABS = user?.type === 'group'
    ? ['profile', 'photo', 'interests', 'availability', 'group', 'bank', 'support']
    : ['profile', 'photo', 'interests', 'availability', 'bank', 'support']

  const TAB_LABELS = {
    profile:      'Edit Profile',
    photo:        'Profile Photo',
    interests:    'Interests',
    availability: 'Availability',
    group:        'Group',
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
            <div className="avatar-wrap" style={{ position:'relative', cursor:'pointer' }}
              onClick={() => setTab('photo')}>
              <img src={photoPreview || user?.photo} alt={user?.name}
                style={{ width:96, height:96, borderRadius:20, objectFit:'cover', border:'3px solid var(--c-primary)' }} />
              <div style={{
                position:'absolute', bottom:-4, right:-4,
                width:28, height:28, borderRadius:14,
                background:'var(--c-primary)', border:'2px solid #fff',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Icon name="camera" size={13} color="#fff" />
              </div>
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
                    <Badge variant="accent">{user?.type === 'group' ? 'Group' : 'Individual'}</Badge>
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
              padding:'9px 16px', borderRadius:10, border:'none', cursor:'pointer',
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
            TAB: PROFILE PHOTO
        ════════════════════════════════════ */}
        {tab === 'photo' && (
          <Card flat style={{ padding:28 }}>
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:6, color:'var(--c-dark)' }}>Profile Photo</h3>
            <p style={{ fontSize:13, color:'var(--c-muted)', marginBottom:24 }}>
              Your profile photo is the first thing people see. Use a clear, recent photo.
            </p>

            {/* Current photo + upload area */}
            <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap', marginBottom:28 }}>
              {/* Preview */}
              <div style={{ textAlign:'center' }}>
                <div style={{ position:'relative', display:'inline-block' }}>
                  <img src={photoPreview || user?.photo} alt="Profile"
                    style={{ width:120, height:120, borderRadius:20, objectFit:'cover', border:'3px solid var(--c-primary)', display:'block' }} />
                  <div style={{
                    position:'absolute', bottom:-6, right:-6,
                    width:32, height:32, borderRadius:16,
                    background:'var(--c-primary)', border:'2px solid #fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer',
                  }} onClick={() => fileRef.current?.click()}>
                    <Icon name="camera" size={15} color="#fff" />
                  </div>
                </div>
                <p style={{ fontSize:11, color:'var(--c-muted)', marginTop:10 }}>Current photo</p>
              </div>

              {/* Upload instructions */}
              <div style={{ flex:1, minWidth:220 }}>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border:'2px dashed var(--c-primary)', borderRadius:16, padding:'32px 20px',
                    textAlign:'center', cursor:'pointer', background:'var(--c-primary-lt)',
                    transition:'all .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--c-primary-lt)'}
                >
                  <div style={{ width:52, height:52, borderRadius:14, background:'var(--c-primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                    <Icon name="upload" size={24} color="#fff" />
                  </div>
                  <p style={{ fontWeight:700, fontSize:15, color:'var(--c-primary)', marginBottom:4 }}>Click to Upload Photo</p>
                  <p style={{ fontSize:12, color:'var(--c-muted)' }}>JPG, PNG or WEBP · Max 5MB</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange}
                  style={{ display:'none' }} />
              </div>
            </div>

            {/* Tips */}
            <div style={{ background:'var(--c-bg)', borderRadius:12, padding:16, marginBottom:20 }}>
              <p style={{ fontWeight:600, fontSize:13, color:'var(--c-dark)', marginBottom:8 }}>📸 Photo Tips</p>
              {[
                'Use a clear face photo with good lighting',
                'Avoid sunglasses or heavy filters',
                'Plain or simple background works best',
                'Recent photo preferred (within 1 year)',
              ].map(t => (
                <p key={t} style={{ fontSize:12, color:'var(--c-mid)', marginBottom:4 }}>✓ {t}</p>
              ))}
            </div>

            <Button onClick={handleSavePhoto} icon="check">Save Photo</Button>

            {/* Point 2: Profile Gallery Photos */}
            <div style={{marginTop:32,borderTop:'1px solid var(--c-border)',paddingTop:28}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                <h3 style={{fontWeight:700,fontSize:17,color:'var(--c-dark)'}}>Gallery Photos</h3>
                <span style={{fontSize:12,color: galleryDraftItems.length >= 3 ? 'var(--c-success)' : 'var(--c-warning)',fontWeight:600}}>
                  {galleryDraftItems.length}/5 {galleryDraftItems.length < 3 ? '(min 3)' : '✓'}
                </span>
              </div>
              <p style={{fontSize:13,color:'var(--c-muted)',marginBottom:18}}>
                These photos appear on your public profile. Upload minimum 3, maximum 5.
              </p>

              {/* Gallery grid */}
              {galleryDraftItems.length > 0 ? (
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:16}}>
                  {galleryDisplayUrls.map((img, idx) => (
                    <div key={galleryDraftItems[idx]?.kind === 'existing' ? galleryDraftItems[idx]?.path : idx} style={{position:'relative',aspectRatio:'1',borderRadius:12,overflow:'hidden',border:'2px solid var(--c-border)'}}>
                      <img src={img} alt={`Photo ${idx+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      <button
                        type="button"
                        onClick={() => {
                          const item = galleryDraftItems[idx]
                          if (item?.kind === 'new' && item.preview?.startsWith('blob:')) {
                            URL.revokeObjectURL(item.preview)
                          }
                          setGalleryDraftItems((p) => p.filter((_, i) => i !== idx))
                        }}
                        style={{position:'absolute',top:4,right:4,width:22,height:22,borderRadius:11,background:'rgba(0,0,0,0.65)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}
                      >
                        <Icon name="x" size={11} color="#fff"/>
                      </button>
                    </div>
                  ))}
                  {/* Add more slot */}
                  {galleryDraftItems.length < 5 && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={()=>document.getElementById('profile-gallery-input').click()}
                      onKeyDown={(e) => e.key === 'Enter' && document.getElementById('profile-gallery-input').click()}
                      style={{aspectRatio:'1',borderRadius:12,border:'2px dashed var(--c-primary)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'var(--c-primary-lt)',gap:4}}
                    >
                      <Icon name="camera" size={20} color="var(--c-primary)"/>
                      <p style={{fontSize:10,color:'var(--c-primary)',fontWeight:600}}>Add</p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={()=>document.getElementById('profile-gallery-input').click()}
                  onKeyDown={(e) => e.key === 'Enter' && document.getElementById('profile-gallery-input').click()}
                  style={{border:'2px dashed var(--c-primary)',borderRadius:14,padding:'28px 20px',textAlign:'center',cursor:'pointer',background:'var(--c-primary-lt)',marginBottom:16,transition:'all .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(13,148,136,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.background='var(--c-primary-lt)'}
                >
                  <Icon name="camera" size={28} color="var(--c-primary)"/>
                  <p style={{fontWeight:700,fontSize:14,color:'var(--c-primary)',marginTop:8}}>Upload Gallery Photos</p>
                  <p style={{fontSize:12,color:'var(--c-muted)',marginTop:4}}>Min 3, Max 5 photos · JPG, PNG up to 5MB</p>
                </div>
              )}

              <input
                id="profile-gallery-input"
                type="file"
                accept="image/*"
                multiple
                style={{display:'none'}}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || [])
                  e.target.value = ''
                  if (files.length === 0) return

                  setGalleryDraftItems((prev) => {
                    const next = [...prev]
                    for (const file of files) {
                      if (next.length >= 5) break
                      const preview = URL.createObjectURL(file)
                      next.push({ kind: 'new', file, preview })
                    }
                    return next
                  })
                }}
              />
              <Button onClick={handleSaveGallery} icon="check" variant="ghost" size="sm">Save Gallery</Button>
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
            TAB: GROUP MANAGEMENT
        ════════════════════════════════════ */}
        {tab === 'group' && (
          <Card flat style={{ padding:28 }}>
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:6, color:'var(--c-dark)' }}>Group Management</h3>
            <p style={{ fontSize:13, color:'var(--c-muted)', marginBottom:24 }}>
              Add or remove members. All members can participate in bookings.
            </p>
            <div style={{ display:'flex', gap:10, marginBottom:20 }}>
              <input value={newMember} onChange={e => setNewMember(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addGroupMember()}
                placeholder="Enter member name…"
                style={{ flex:1, padding:'11px 14px', borderRadius:10, border:'1px solid var(--c-border)', fontFamily:'var(--font-sans)', fontSize:14, outline:'none' }} />
              <Button onClick={() => {
                if (!newMember.trim()) return
                setGroupMembers(p => [...p, { id:Date.now(), name:newMember, role:'Member', photo:`https://i.pravatar.cc/60?img=${Math.floor(Math.random()*50)+1}` }])
                setNewMember('')
              }} icon="plus">Add</Button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {groupMembers.map(m => (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:14, background:'var(--c-bg)', borderRadius:12, padding:'12px 16px', border:'1px solid var(--c-border)' }}>
                  <img src={m.photo} alt={m.name} style={{ width:44, height:44, borderRadius:11, objectFit:'cover', flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, fontSize:14, color:'var(--c-dark)' }}>{m.name}</p>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background: m.role==='Admin' ? 'var(--c-primary-lt)' : 'var(--c-border)', color: m.role==='Admin' ? 'var(--c-primary)' : 'var(--c-muted)' }}>{m.role}</span>
                  </div>
                  {m.role !== 'Admin' && (
                    <button onClick={() => setGroupMembers(p => p.filter(x => x.id !== m.id))}
                      style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--c-danger)', padding:6 }}>
                      <Icon name="x" size={16} color="var(--c-danger)" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontSize:12, color:'var(--c-muted)', marginTop:14 }}>{groupMembers.length} members total</p>
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
