// src/components/common/ProfileCard.jsx
import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../assets/icons/Icons.jsx'
import { Card, Badge, Button, Modal, Input, Textarea, StarRating, EscrowBox, SuccessState } from '../ui/UI.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { getAvailableSlotsApi } from '../../api/booking.js'
import { formatAvailabilityDisplay, parseAvailabilitySlots } from '../../utils/availabilitySlots.js'
import { notifyError } from '../../utils/notification.js'

const ALL_SLOTS = (() => {
  const slots = []
  for (let h = 6; h < 24; h++) {
    for (const m of [0, 30]) {
      if (h === 23 && m === 30) break
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      const period = h < 12 ? 'AM' : 'PM'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      slots.push({ value: `${hh}:${mm}`, label: `${h12}:${mm} ${period}` })
    }
  }
  return slots
})()

/* exported — used in BookingsPage too, showBook=false hides the Book button */
export function ProfilePreviewModal({ open, onClose, profile: p, showBook = true, onBook }) {
  if (!p) return null
  const bookings     = p.totalBookings || p.reviews || 0
  const earned       = p.totalEarned   || Math.round(bookings * (p.price || 0) * 1.5)
  const availability = formatAvailabilityDisplay(p.availability)

  return (
    <Modal open={open} onClose={onClose} title="Profile Details" width={460}>

      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', gap:16, padding:'18px 20px',
        background:'linear-gradient(135deg, var(--c-primary-lt) 0%, #F0F9FF 100%)',
        borderRadius:16, marginBottom:20,
      }}>
        <img src={p.photo} alt={p.name} style={{
          width:80, height:80, borderRadius:18, objectFit:'cover',
          border:'3px solid var(--c-primary)', flexShrink:0,
          boxShadow:'0 4px 16px rgba(13,148,136,0.25)',
        }} />
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:800, fontSize:20, color:'var(--c-dark)', marginBottom:4 }}>{p.name}</p>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
            <Icon name="location" size={12} color="var(--c-muted)" />
            <span style={{ fontSize:13, color:'var(--c-muted)' }}>{p.location}</span>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <span style={{ background:'var(--c-primary)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
             Selfie Update
            </span>
            <span style={{ background:'var(--c-primary-lt)', color:'var(--c-primary)', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>
              {p.type === 'group' ? `Group · ${p.members} members` : 'Individual'}
            </span>
            {p.live && (
              <span style={{ display:'flex', alignItems:'center', gap:4, background:'#D1FAE5', color:'#065F46', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
                <span style={{ width:6, height:6, borderRadius:3, background:'#22C55E', display:'inline-block' }} />
                Live
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          { label:'Bookings', val: bookings,                           color:'var(--c-primary)' },
          { label:'Rating',   val: p.rating + ' \u2605',              color:'#D4A017'          },
          { label:'Age',      val: p.age ? p.age + ' yrs' : '—',     color:'var(--c-accent)'  },
        ].map(s => (
          <div key={s.label} style={{
            background:'var(--c-card)', border:'1px solid var(--c-border)',
            borderRadius:14, padding:'14px 10px', textAlign:'center',
          }}>
            <p style={{ fontSize:22, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</p>
            <p style={{ fontSize:11, color:'var(--c-muted)', marginTop:5, fontWeight:600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bio */}
      {p.bio && (
        <div style={{ marginBottom:16, padding:'14px 16px', background:'var(--c-bg)', borderRadius:12, border:'1px solid var(--c-border)' }}>
          <p style={{ fontSize:13, color:'var(--c-mid)', lineHeight:1.7 }}>{p.bio}</p>
        </div>
      )}

      {/* Interests */}
      {p.interests && p.interests.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--c-muted)', textTransform:'uppercase', letterSpacing:.6, marginBottom:8 }}>Interests</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {p.interests.map(i => (
              <span key={i} style={{ background:'var(--c-primary-lt)', color:'var(--c-primary)', fontSize:12, fontWeight:600, padding:'5px 12px', borderRadius:20 }}>{i}</span>
            ))}
          </div>
        </div>
      )}

      {/* Availability + Rate */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, padding:'12px 16px', background:'var(--c-bg)', borderRadius:12, border:'1px solid var(--c-border)' }}>
        <Icon name="clock" size={14} color="var(--c-primary)" />
        <div>
          <p style={{ fontSize:11, color:'var(--c-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:.5 }}>Availability</p>
          <p style={{ fontSize:13, color:'var(--c-dark)', fontWeight:600, marginTop:2 }}>{availability}</p>
        </div>
        <div style={{ marginLeft:'auto', textAlign:'right' }}>
          <p style={{ fontSize:11, color:'var(--c-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:.5 }}>Rate</p>
          <p style={{ fontSize:16, fontWeight:800, color:'var(--c-primary)' }}>
            {'\u20b9'}{p.price}<span style={{ fontSize:12, fontWeight:500, color:'var(--c-muted)' }}>/hr</span>
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:10 }}>
        <Button onClick={onClose} variant="ghost" fullWidth={!showBook}>Close</Button>
        {showBook && (
          <Button onClick={() => { onClose(); onBook && onBook() }} fullWidth icon="calendar">
            Book Now
          </Button>
        )}
      </div>
    </Modal>
  )
}

function TimeSlotPicker({ startSlot, endSlot, onChange, bookedSlots = new Set(), visibleSlots = null }) {
  const slots = Array.isArray(visibleSlots) ? visibleSlots : ALL_SLOTS

  if (!slots.length) {
    return (
      <p style={{ fontSize: 11, color: 'var(--c-muted)', marginTop: 6 }}>
        No available slots for the selected day.
      </p>
    )
  }

  const handleSlotClick = (slot) => {
    if (bookedSlots.has(slot)) return  // blocked
    if (!startSlot) { onChange({ start: slot, end: null, duration: 0 }); return }
    if (startSlot && !endSlot) {
      if (slot <= startSlot) { onChange({ start: slot, end: null, duration: 0 }); return }
      // if any booked slot falls within range, don't allow
      const [sh, sm] = startSlot.split(':').map(Number)
      const [eh, em] = slot.split(':').map(Number)
      const hasConflict = ALL_SLOTS
        .filter(s => s.value > startSlot && s.value <= slot)
        .some(s => bookedSlots.has(s.value))
      if (hasConflict) { onChange({ start: slot, end: null, duration: 0 }); return }
      const duration = ((eh * 60 + em) - (sh * 60 + sm)) / 60
      onChange({ start: startSlot, end: slot, duration }); return
    }
    onChange({ start: slot, end: null, duration: 0 })
  }
  const isInRange = (slot) => startSlot && endSlot && slot > startSlot && slot < endSlot

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <label style={{ fontSize:12, fontWeight:700, color:'var(--c-muted)', textTransform:'uppercase', letterSpacing:.6 }}>
          Select Time Slots *
        </label>
        {startSlot && (
          <span style={{ fontSize:12, color:'var(--c-primary)', fontWeight:600 }}>
            {!endSlot
              ? 'From ' + (ALL_SLOTS.find(s=>s.value===startSlot)?.label) + ' — pick end'
              : (ALL_SLOTS.find(s=>s.value===startSlot)?.label) + ' to ' + (ALL_SLOTS.find(s=>s.value===endSlot)?.label)
            }
          </span>
        )}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:12, marginBottom:8, flexWrap:'wrap' }}>
        {[
          { color:'var(--c-primary)', label:'Selected' },
          { color:'#FEE2E2', border:'#FCA5A5', label:'Booked', text:'#DC2626' },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:l.color, border:`1.5px solid ${l.border||l.color}` }} />
            <span style={{ fontSize:11, color:'var(--c-muted)', fontWeight:600 }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:6, maxHeight:220, overflowY:'auto', padding:'2px 2px 4px' }}>
        {slots.map(s => {
          const isStart  = s.value === startSlot
          const isEnd    = s.value === endSlot
          const inRange  = isInRange(s.value)
          const active   = isStart || isEnd
          const isBooked = bookedSlots.has(s.value)
          return (
            <button
              key={s.value}
              onClick={() => handleSlotClick(s.value)}
              disabled={isBooked}
              title={isBooked ? 'Already booked' : undefined}
              style={{
                padding:'8px 4px', borderRadius:8, fontSize:12,
                fontWeight: active ? 700 : 500,
                border: isBooked
                  ? '1.5px solid #FCA5A5'
                  : active   ? '2px solid var(--c-primary)'
                  : inRange  ? '1.5px solid var(--c-primary)'
                  : '1.5px solid var(--c-border)',
                background: isBooked
                  ? '#FEE2E2'
                  : isStart  ? 'var(--c-primary)'
                  : isEnd    ? 'var(--c-primary)'
                  : inRange  ? 'var(--c-primary-lt)'
                  : 'var(--c-bg)',
                color: isBooked
                  ? '#DC2626'
                  : active   ? '#fff'
                  : inRange  ? 'var(--c-primary)'
                  : 'var(--c-mid)',
                cursor: isBooked ? 'not-allowed' : 'pointer',
                fontFamily:'var(--font-sans)', transition:'all .12s', position:'relative',
                opacity: isBooked ? 0.75 : 1,
              }}
            >
              {isBooked ? <s style={{ fontSize:11 }}>{s.label}</s> : s.label}
              {isStart && <span style={{ position:'absolute', top:-7, left:'50%', transform:'translateX(-50%)', fontSize:9, background:'var(--c-primary)', color:'#fff', padding:'1px 5px', borderRadius:6, whiteSpace:'nowrap' }}>START</span>}
              {isEnd   && <span style={{ position:'absolute', top:-7, left:'50%', transform:'translateX(-50%)', fontSize:9, background:'var(--c-accent)',  color:'#fff', padding:'1px 5px', borderRadius:6, whiteSpace:'nowrap' }}>END</span>}
            </button>
          )
        })}
      </div>
      {startSlot && !endSlot && (
        <p style={{ fontSize:11, color:'var(--c-muted)', marginTop:6 }}>Now tap an end time slot above</p>
      )}
    </div>
  )
}

export default function ProfileCard({ profile: p }) {
  const { bookPerson, user, isLoggedIn, myBookings } = useApp()
  const navigate = useNavigate()
  const [showPreview, setShowPreview] = useState(false)
  const [showBook,    setShowBook]    = useState(false)
  const [done,        setDone]        = useState(false)
  const [form, setForm] = useState({ date:'', time:'', endTime:'', duration:0, location:'', purpose:'' })
  const upd = f => e => setForm({ ...form, [f]: e.target.value })

  const visibleSlots = useMemo(() => {
    // If no availability info, allow everything.
    if (!p?.availability) return ALL_SLOTS

    const days = parseAvailabilitySlots(p.availability)
    if (!days || !form.date) return ALL_SLOTS

    const dayIndex = new Date(form.date + 'T00:00:00').getDay() // 0=Sun..6=Sat
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex] || null
    const dayData = dayName ? days[dayName] : null
    if (!dayData || !dayData.on) return []

    const label = String(dayData.slot || '').trim()
    if (!label) return ALL_SLOTS

    const ranges = [
      { match: 'morning', start: '06:00', end: '12:00' },
      { match: 'afternoon', start: '12:00', end: '18:00' },
      { match: 'evening', start: '18:00', end: '22:00' },
      // We keep it within the existing time picker range (up to 23:30)
      { match: 'night', start: '22:00', end: '23:30' },
    ]

    if (label.toLowerCase().includes('all day')) return ALL_SLOTS

    const hit = ranges.find((r) => label.toLowerCase().includes(r.match))
    if (!hit) return ALL_SLOTS

    const toMin = (hhmm) => {
      const [h, m] = String(hhmm).split(':').map(Number)
      return h * 60 + m
    }
    const startMin = toMin(hit.start)
    const endMin = toMin(hit.end)

    return ALL_SLOTS.filter((s) => {
      const sm = toMin(s.value)
      return sm >= startMin && sm <= endMin
    })
  }, [form.date, p?.availability])

  // If user picked a time that isn't allowed for this day, reset selection.
  useEffect(() => {
    if (!form.date) return
    if (!visibleSlots || visibleSlots.length === 0) {
      if (form.time || form.endTime || form.duration) {
        setForm((f) => ({ ...f, time: '', endTime: '', duration: 0 }))
      }
      return
    }

    const allowed = new Set(visibleSlots.map((s) => s.value))
    if (form.time && !allowed.has(form.time)) {
      setForm((f) => ({ ...f, time: '', endTime: '', duration: 0 }))
    }
    if (form.endTime && !allowed.has(form.endTime)) {
      setForm((f) => ({ ...f, time: '', endTime: '', duration: 0 }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, visibleSlots])

  // Fetch engaged slots from API for this provider on selected date (only for UUID provider ids)
  const [engagedSlots, setEngagedSlots] = useState(new Set())
  const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ''))
  useEffect(() => {
    if (!form.date || !p?.id || !isUuid(p.id)) {
      setEngagedSlots(new Set())
      return
    }
    let cancelled = false
    getAvailableSlotsApi({ provider_id: p.id, date: form.date })
      .then((res) => {
        if (cancelled) return
        const engaged = res?.data?.data?.engaged || []
        setEngagedSlots(new Set(engaged))
      })
      .catch(() => {
        if (!cancelled) setEngagedSlots(new Set())
      })
    return () => { cancelled = true }
  }, [form.date, p?.id])

  // Merge with local myBookings for same profile/date (in case of race)
  const bookedSlots = useMemo(() => {
    const blocked = new Set(engagedSlots)
    myBookings
      .filter(b =>
        String(b.profileId) === String(p?.id) &&
        b.date === form.date &&
        (b.status === 'pending' || b.status === 'confirmed')
      )
      .forEach(b => {
        const startVal = b.timeStart || (b.time || '').split(' to ')[0]?.trim()
        const endVal = b.timeEnd || (b.time || '').split(' to ')[1]?.trim()
        if (startVal && endVal) {
          ALL_SLOTS.forEach(s => {
            if (s.value >= startVal && s.value <= endVal) blocked.add(s.value)
          })
        }
      })
    return blocked
  }, [form.date, myBookings, p?.id, engagedSlots])

  const total     = p.price * Number(form.duration)
  const canAfford = (user?.wallet ?? 0) >= total
  const canBook   = form.date && form.time && form.endTime && form.duration > 0 && form.location && form.purpose && visibleSlots.length > 0

  const handleTimeSlot = ({ start, end, duration }) => {
    setForm(f => ({ ...f, time: start || '', endTime: end || '', duration }))
  }

  const handleBook = async () => {
    try {
      const payload = {
        ...form,
        time: (ALL_SLOTS.find(s => s.value === form.time)?.label) + ' to ' + (ALL_SLOTS.find(s => s.value === form.endTime)?.label),
      }
      await bookPerson(p, payload)
      setDone(true)
      setTimeout(() => {
        setShowBook(false)
        setDone(false)
        setForm({ date: '', time: '', endTime: '', duration: 0, location: '', purpose: '' })
      }, 2200)
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || 'Booking failed'
      notifyError(msg)
    }
  }

  const openPreview = () => isLoggedIn ? setShowPreview(true) : navigate('/login')

  return (
    <>
      <Card>
        {/* Image — click opens preview */}
        <div className="pcard-img-wrap" style={{ cursor:'pointer' }} onClick={openPreview}>
          <img src={p.photo} alt={p.name} className="pcard-img"
            style={{ transition:'transform .25s' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
          />
          <div className="pcard-type">
            <Badge variant={p.type === 'group' ? 'accent' : 'primary'}>
              {p.type === 'group' ? `Group · ${p.members}` : 'Individual'}
            </Badge>
          </div>
        </div>

        {/* Body */}
        <div className="pcard-body">
          <div className="pcard-top">
            <span className="pcard-name" style={{ cursor:'pointer', textDecoration:'underline dotted', textUnderlineOffset:3 }}
              onClick={openPreview}>{p.name}</span>
            <span className="price-big">{'\u20b9'}{p.price}<span className="unit">/hr</span></span>
          </div>
          <div className="info-row" style={{ marginBottom:8 }}>
            <Icon name="location" size={13} color="var(--c-muted)" />
            <span style={{ fontSize:12, color:'var(--c-muted)' }}>{p.location}</span>
          </div>
          <StarRating rating={p.rating} showCount count={p.reviews} />
          <p style={{ fontSize:12, color:'var(--c-mid)', marginTop:10, lineHeight:1.6 }}>
            {p.bio.length > 90 ? p.bio.slice(0,90) + '…' : p.bio}
          </p>
          <div className="pcard-tags">
            {p.interests.slice(0,3).map(i => <Badge key={i} variant="primary">{i}</Badge>)}
          </div>
          <Button onClick={() => isLoggedIn ? setShowBook(true) : navigate('/login')} fullWidth icon="calendar">
            {isLoggedIn ? 'Book Now' : 'Login to Book'}
          </Button>
        </div>
      </Card>

      {/* Profile Preview Modal — showBook=true, Book Now opens booking modal */}
      <ProfilePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        profile={p}
        showBook={true}
        onBook={() => setShowBook(true)}
      />

      {/* Booking Modal */}
      <Modal open={showBook} onClose={() => { setShowBook(false); setDone(false) }} title={'Book ' + p.name}>
        {!done ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, padding:16, background:'var(--c-bg)', borderRadius:12 }}>
              <img src={p.photo} alt={p.name} style={{ width:56, height:56, borderRadius:12, objectFit:'cover' }} />
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:16, color:'var(--c-dark)' }}>{p.name}</p>
                <p style={{ fontSize:12, color:'var(--c-muted)' }}>{'\u20b9'}{p.price}/hour · {p.location}</p>
                <StarRating rating={p.rating} />
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:11, color:'var(--c-muted)' }}>Your Wallet</p>
                <p style={{ fontSize:16, fontWeight:700, color: canAfford ? 'var(--c-success)' : 'var(--c-danger)' }}>
                  {'\u20b9'}{(user?.wallet ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            <Input label="Date" type="date" value={form.date} onChange={upd('date')} icon="calendar" required />

            <div style={{ marginBottom:16 }}>
              <TimeSlotPicker
                startSlot={form.time}
                endSlot={form.endTime}
                onChange={handleTimeSlot}
                bookedSlots={bookedSlots}
                visibleSlots={visibleSlots}
              />
              {form.duration > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, padding:'8px 14px', background:'var(--c-primary-lt)', borderRadius:10 }}>
                  <Icon name="clock" size={13} color="var(--c-primary)" />
                  <span style={{ fontSize:13, color:'var(--c-primary)', fontWeight:600 }}>
                    Duration: {form.duration % 1 === 0 ? form.duration : form.duration.toFixed(1)} hour{form.duration !== 1 ? 's' : ''}
                    {' · '} Total: {'\u20b9'}{total.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <Input label="Location / Venue" placeholder="e.g. Bandra Starbucks, Mumbai"
              value={form.location} onChange={upd('location')} icon="location" required />
            <Textarea label="Purpose of Booking" placeholder="Describe the purpose clearly (coffee meet, party, networking...)"
              value={form.purpose} onChange={upd('purpose')} rows={3} required />

            <EscrowBox rate={p.price} duration={Number(form.duration)} />

            {!canAfford && form.duration > 0 && (
              <div style={{ background:'#FEE2E2', borderRadius:10, padding:12, marginBottom:14, display:'flex', gap:8, alignItems:'center' }}>
                <Icon name="zap" size={15} color="var(--c-danger)" />
                <p style={{ fontSize:13, color:'var(--c-danger)' }}>
                  Insufficient balance.{' '}
                  <span style={{ fontWeight:600, cursor:'pointer', textDecoration:'underline' }} onClick={() => navigate('/wallet')}>Add money to wallet</span>
                </p>
              </div>
            )}

            <Button onClick={handleBook} fullWidth size="lg" icon="shield" disabled={!canAfford || !canBook}>
              Confirm Booking · Pay {'\u20b9'}{total.toLocaleString()} from Wallet
            </Button>
            <p style={{ textAlign:'center', fontSize:12, color:'var(--c-muted)', marginTop:10 }}>
              Payment locked in escrow until meeting is confirmed via OTP
            </p>
          </>
        ) : (
          <SuccessState
            title="Booking Request Sent!"
            message={'Your request has been sent to ' + p.name + '. Track it in Bookings → My Requests.'}
            onClose={() => { setShowBook(false); setDone(false); navigate('/bookings?tab=sent') }}
            btnLabel="View My Requests"
          />
        )}
      </Modal>
    </>
  )
}
