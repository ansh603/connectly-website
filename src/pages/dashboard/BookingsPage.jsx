// src/pages/BookingsPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../assets/icons/Icons.jsx'
import { Button, Badge, OTPModal, EmptyState, Modal } from '../../components/ui/UI.jsx'
import { ProfilePreviewModal } from '../../components/shared/ProfileCard.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { generateOtpApi, verifyOtpApi } from '../../api/booking.js'
import { notifySuccess, notifyError } from '../../utils/notification.js'
import { INDIVIDUALS } from '../../data/mockData.js'
import { BASE_IMAGE_URL } from '../../utils/config.js'

function toDisplayUrl(path) {
  if (!path) return ''
  const p = String(path).trim()
  if (!p || p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p
  return `${BASE_IMAGE_URL.replace(/\/+$/, '')}/${p.replace(/^\/+/, '')}`
}

/* ─── PRD §10 Status color system ─── */
const STATUS = {
  pending:    { label:'Pending',     bg:'#FEF3C7', color:'#92400E', border:'#F59E0B' },   // Yellow
  confirmed:  { label:'Confirmed',   bg:'#DBEAFE', color:'#1E40AF', border:'#3B82F6' },   // Blue
  inprogress: { label:'In Progress', bg:'#EDE9FE', color:'#5B21B6', border:'#7C3AED' },   // Purple
  completed:  { label:'Completed',   bg:'#D1FAE5', color:'#065F46', border:'#059669' },   // Dark Green
  cancelled:  { label:'Cancelled',   bg:'#FEE2E2', color:'#991B1B', border:'#DC2626' },   // Red
  accepted:   { label:'Accepted',    bg:'#DBEAFE', color:'#1E40AF', border:'#3B82F6' },   // Blue (same as confirmed)
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function BookingsPage() {
  const {
    myBookings, incomingRequests,
    acceptRequest, declineRequest, completeBooking, cancelBooking,
    getCancelRefund,
  } = useApp()

  const nav = useNavigate()
  const [otpTarget,  setOtpTarget]  = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending').length

  return (
    <div className="page-wrap">
      <div className="container" style={{ paddingTop:36, paddingBottom:60 }}>

        <div style={{ marginBottom:32 }}>
          <h1 className="serif" style={{ fontSize:'clamp(26px,4vw,34px)', fontWeight:700, color:'var(--c-dark)' }}>
            My Activity
          </h1>
          <p style={{ color:'var(--c-muted)', marginTop:6, fontSize:14 }}>
            Manage your bookings and requests all in one place.
          </p>
        </div>

        <MyBookingTab
            myBookings={myBookings}
            incomingRequests={incomingRequests}
            onAccept={acceptRequest}
            onDecline={declineRequest}
            onCancel={(b) => setCancelTarget(b)}
            onOTP={setOtpTarget}
            getCancelRefund={getCancelRefund}
            nav={nav}
          />
      </div>

      {/* OTP Modal */}
      <OTPModal
        open={!!otpTarget}
        onClose={() => setOtpTarget(null)}
        mode={otpTarget?.mode}
        name={otpTarget?.name}
        bookingId={otpTarget?.id}
        onGenerateOtp={async (bid) => {
          const r = await generateOtpApi(bid)
          return r?.data?.data?.otp || ''
        }}
        onVerifyOtp={async (bid, otp) => {
          const r = await verifyOtpApi(bid, otp)
          if (!r?.data?.success) throw new Error(r?.data?.message || 'Invalid OTP')
        }}
        onVerified={async () => {
          if (otpTarget?.id) {
            try {
              await completeBooking(otpTarget.id)
              notifySuccess('Meeting confirmed! Payment released.')
            } catch (e) {
              notifyError(e?.message || 'Failed to complete booking')
              return
            }
          }
          setOtpTarget(null)
        }}
      />

      {/* Cancel Confirm Modal */}
      <CancelModal
        open={!!cancelTarget}
        booking={cancelTarget}
        getCancelRefund={getCancelRefund}
        onConfirm={async () => {
          if (!cancelTarget) return
          try {
            await cancelBooking(cancelTarget.id)
            notifySuccess('Booking cancelled. Refund processed.')
            setCancelTarget(null)
          } catch (e) {
            notifyError(e?.message || 'Failed to cancel')
          }
        }}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════
   MY BOOKING TAB
══════════════════════════════════════════════════ */
function MyBookingTab({ myBookings, incomingRequests, onAccept, onDecline, onCancel, onOTP, getCancelRefund, nav }) {
  const pendingCount = incomingRequests.filter(r => r.status === 'pending').length
  const [sub, setSub] = useState(pendingCount > 0 ? 'incoming' : 'sent')

  const activeSent       = myBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled')
  const historySent      = myBookings.filter(b => b.status === 'completed' || b.status === 'cancelled')
  const completedHistory = historySent.filter(b => b.status === 'completed')
  const cancelledHistory = historySent.filter(b => b.status === 'cancelled')

  const SUBS = [
    { id:'sent',     label:'Sent by Me',        count: activeSent.length  },
    { id:'incoming', label:'Incoming Requests',  count: pendingCount       },
    { id:'history',  label:'History',            count: historySent.length },
  ]

  return (
    <div>

      {/* ── Alert banner when there are pending incoming requests ── */}
      {pendingCount > 0 && sub !== 'incoming' && (
        <div style={{
          background:'#FEF3C7', border:'1.5px solid #F59E0B', borderRadius:14,
          padding:'14px 20px', marginBottom:20,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:20, background:'#F59E0B', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="bell" size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight:700, fontSize:14, color:'#92400E' }}>
                {pendingCount} new booking request{pendingCount > 1 ? 's' : ''} waiting for your response!
              </p>
              <p style={{ fontSize:12, color:'#B45309', marginTop:2 }}>
                Payment is secured in escrow — Accept or Decline below
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setSub('incoming')}>View &amp; Respond</Button>
        </div>
      )}

      <PillTabs tabs={SUBS} active={sub} onChange={setSub} color="var(--c-primary)" />

      {/* ══ SENT BY ME ══ */}
      {sub === 'sent' && (
        <>
          <StatRow items={[
            { label:'Total',     val: myBookings.length,                                   color:'var(--c-dark)'    },
            { label:'Pending',   val: myBookings.filter(b=>b.status==='pending').length,   color:'#D97706'          },
            { label:'Confirmed', val: myBookings.filter(b=>b.status==='confirmed').length, color:'#1E40AF'          },
            { label:'Done',      val: myBookings.filter(b=>b.status==='completed').length, color:'var(--c-success)' },
          ]} />
          {activeSent.length === 0
            ? <EmptyState icon="ticket" title="No active bookings"
                message="Go to Explore to find and book someone!"
                action={<Button onClick={() => nav('/explore')} icon="search">Explore People</Button>} />
            : <ColStack>{activeSent.map(b =>
                <BookingCard key={b.id} b={b} mode="sent"
                  onCancel={() => onCancel(b)}
                  onOTP={() => onOTP({ name: b.person, mode:'generate', id: b.id })}
                  getCancelRefund={getCancelRefund} />
              )}</ColStack>
          }
        </>
      )}

      {/* ══ INCOMING REQUESTS — requests others sent TO me ══ */}
      {sub === 'incoming' && (
        <>
          {/* Explanation banner */}
          <div style={{
            background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12,
            padding:'12px 16px', marginBottom:20, display:'flex', gap:10, alignItems:'flex-start',
          }}>
            <Icon name="info" size={16} color="#1E40AF" />
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:'#1E40AF', marginBottom:2 }}>
                These are booking requests sent TO you by other users
              </p>
              <p style={{ fontSize:12, color:'#3B82F6', lineHeight:1.6 }}>
                Accept → booking confirmed, escrow held until OTP at meeting.<br/>
                Decline → booker gets instant full refund.
              </p>
            </div>
          </div>

          <StatRow items={[
            { label:'Total',     val: incomingRequests.length,                                    color:'var(--c-dark)'    },
            { label:'Pending',   val: incomingRequests.filter(r=>r.status==='pending').length,    color:'#D97706'          },
            { label:'Confirmed', val: incomingRequests.filter(r=>r.status==='confirmed').length,  color:'#1E40AF'          },
            { label:'Done',      val: incomingRequests.filter(r=>r.status==='completed').length,  color:'var(--c-success)' },
          ]} />

          {incomingRequests.length === 0
            ? <EmptyState icon="users" title="No incoming requests yet"
                message="Complete your profile to 100% to go live and start receiving booking requests." />
            : <ColStack>{incomingRequests.map(b =>
                <BookingCard key={b.id} b={b} mode="incoming"
                  onAccept={async () => {
                    try {
                      await onAccept(b.id)
                      notifySuccess('Booking accepted!')
                    } catch (e) {
                      notifyError(e?.message || 'Failed to accept')
                    }
                  }}
                  onDecline={async () => {
                    try {
                      await onDecline(b.id)
                      notifySuccess('Booking declined. Refund processed.')
                    } catch (e) {
                      notifyError(e?.message || 'Failed to decline')
                    }
                  }}
                  onOTP={() => onOTP({ name: b.person, mode:'enter', id: b.id })} />
              )}</ColStack>
          }
        </>
      )}

      {/* ══ HISTORY — completed + cancelled ══ */}
      {sub === 'history' && (
        <>
          <StatRow items={[
            { label:'Completed', val: completedHistory.length, color:'var(--c-success)' },
            { label:'Cancelled', val: cancelledHistory.length, color:'var(--c-danger)'  },
          ]} />

          {historySent.length === 0 ? (
            <EmptyState icon="clock" title="No history yet"
              message="Completed and cancelled bookings will appear here." />
          ) : (
            <>
              {completedHistory.length > 0 && (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                    <span style={{ width:10, height:10, borderRadius:5, background:'var(--c-success)', display:'inline-block' }} />
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--c-dark)' }}>
                      Completed ({completedHistory.length})
                    </p>
                  </div>
                  <ColStack>{completedHistory.map(b => <BookingCard key={b.id} b={b} mode="history" />)}</ColStack>
                </>
              )}
              {cancelledHistory.length > 0 && (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, marginTop: completedHistory.length > 0 ? 28 : 0 }}>
                    <span style={{ width:10, height:10, borderRadius:5, background:'var(--c-danger)', display:'inline-block' }} />
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--c-dark)' }}>
                      Cancelled ({cancelledHistory.length})
                    </p>
                  </div>
                  <ColStack>{cancelledHistory.map(b => <BookingCard key={b.id} b={b} mode="history" />)}</ColStack>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   BOOKING CARD
══════════════════════════════════════════════════ */
function BookingCard({ b, mode, onAccept, onDecline, onCancel, onOTP }) {
  const s = STATUS[b.status] || STATUS.pending
  const [showProfile, setShowProfile] = useState(false)

  // Enrich with full INDIVIDUALS data (match by profileId or name)
  const fullProfile = INDIVIDUALS.find(p => p.id === b.profileId || p.name === b.person) || {}
  const previewProfile = {
    name:          b.person,
    photo:         toDisplayUrl(b.photo),
    location:      fullProfile.location     || b.location  || '',
    rating:        fullProfile.rating       || b.rating    || 0,
    reviews:       fullProfile.reviews      || b.reviews   || 0,
    bio:           fullProfile.bio          || b.bio       || null,
    interests:     fullProfile.interests    || b.interests || [],
    availability:  fullProfile.availability || b.availability || null,
    totalBookings: fullProfile.reviews      || 0,
    price:         fullProfile.price        || Math.round(b.amount / (b.duration || 1)),
    type:          fullProfile.type         || 'individual',
    live:          fullProfile.live         || false,
  }

  return (
    <>
    <div style={{
      background:'var(--c-card)', border:`1px solid var(--c-border)`,
      borderLeft:`5px solid ${s.border}`,
      borderRadius:16, padding:'20px 22px',
    }}>
      <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>

        <img src={toDisplayUrl(b.photo)} alt={b.person} onClick={() => setShowProfile(true)} style={{
          width:58, height:58, borderRadius:13, objectFit:'cover',
          flexShrink:0, border:'2px solid var(--c-border)',
          cursor:'pointer', transition:'opacity .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity='.8'}
        onMouseLeave={e => e.currentTarget.style.opacity='1'}
        />

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8, marginBottom:6 }}>
            <div>
              <p onClick={() => setShowProfile(true)} style={{ fontWeight:700, fontSize:16, color:'var(--c-dark)', marginBottom:2, cursor:'pointer', textDecoration:'underline dotted', textUnderlineOffset:3 }}>{b.person}</p>
              <p style={{ fontSize:12, color:'var(--c-muted)' }}>{b.purpose}</p>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <p style={{ fontSize:22, fontWeight:800, color:'var(--c-primary)', lineHeight:1 }}>
                ₹{b.amount.toLocaleString()}
              </p>
              <span style={{
                display:'inline-block', marginTop:5,
                background:s.bg, color:s.color,
                fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20,
              }}>{s.label}</span>
            </div>
          </div>

          <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontSize:12, color:'var(--c-muted)', margin:'8px 0 12px' }}>
            <MetaChip icon="calendar">{b.date}</MetaChip>
            <MetaChip icon="clock">{b.time}</MetaChip>
            <MetaChip icon="location">{b.location}</MetaChip>
            {b.createdAt && <MetaChip icon="edit">Sent {b.createdAt}</MetaChip>}
          </div>

          {/* Status notices */}
          {(b.status==='pending'||b.status==='confirmed') && (
            <InfoBox icon="shield" bg="var(--c-accent-lt)" color="var(--c-accent)">
              ₹{b.amount.toLocaleString()} locked in escrow
              {b.status==='confirmed' ? ' — Enter OTP at meeting to release payment' : ' — Awaiting acceptance'}
            </InfoBox>
          )}
          {b.status==='completed' && (
            <InfoBox icon="check" bg="#D1FAE5" color="#065F46">
              ₹{Math.round(b.amount*.7).toLocaleString()} released to wallet (₹{Math.round(b.amount*.7).toLocaleString()} after booking completed ₹{Math.round(b.amount*.3).toLocaleString()} Fee)
            </InfoBox>
          )}
          {b.status==='cancelled' && (
            <InfoBox icon="x" bg="#FEE2E2" color="#991B1B">
              Cancelled — ₹{(b.refundAmount || Math.round(b.amount*.9)).toLocaleString()} refunded
              {b.feePct ? ` (${Math.round((1-b.feePct)*100)}% refund, ${Math.round(b.feePct*100)}% cancellation fee)` : ''}
            </InfoBox>
          )}



          {/* Actions */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:4 }}>
            {mode==='incoming' && b.status==='pending' && (<>
              <Button size="sm" variant="success" icon="check" onClick={onAccept}>Accept</Button>
              <Button size="sm" variant="danger"  icon="x"     onClick={onDecline}>Decline</Button>
            </>)}
            {mode==='incoming' && b.status==='confirmed' && (<>
              <Button size="sm" icon="shield" onClick={onOTP}>Enter OTP</Button>
            </>)}
            {mode==='sent' && b.status==='pending' && (<>
              <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#92400E', background:'#FEF3C7', padding:'6px 12px', borderRadius:8 }}>
                <Icon name="clock" size={12} color="#92400E"/> Awaiting acceptance
              </span>
              <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            </>)}
            {mode==='sent' && b.status==='confirmed' && (<>
              <Button size="sm" icon="shield" onClick={onOTP}>Generate OTP</Button>
              <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            </>)}
          </div>
        </div>
      </div>
    </div>

    <ProfilePreviewModal open={showProfile} onClose={() => setShowProfile(false)} profile={previewProfile} showBook={false} />
    </>
  )
}

/* ══════════════════════════════════════════════════
   CANCEL CONFIRM MODAL (shows correct fee)
══════════════════════════════════════════════════ */
function CancelModal({ open, booking, getCancelRefund, onConfirm, onClose }) {
  if (!booking) return null
  const { refund, feePct } = getCancelRefund(booking)
  const fee = Math.round(booking.amount * feePct)

  return (
    <Modal open={open} onClose={onClose} title="Cancel Booking?" width={420}>
      <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
        <div style={{ width:64, height:64, background:'#FEF3C7', borderRadius:32, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <Icon name="info" size={28} color="#D97706" />
        </div>
        <p style={{ fontSize:15, color:'var(--c-dark)', fontWeight:600, marginBottom:8 }}>
          Cancel booking with {booking.person}?
        </p>
        <p style={{ fontSize:13, color:'var(--c-muted)', marginBottom:20 }}>
          {feePct === 0.05 ? 'More than 1 hour before' : 'Less than 1 hour before'} booking — {Math.round(feePct*100)}% cancellation fee applies
        </p>

        <div style={{ background:'var(--c-bg)', borderRadius:12, padding:16, marginBottom:20, textAlign:'left' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:13, color:'var(--c-muted)' }}>Total Paid</span>
            <span style={{ fontWeight:600, color:'var(--c-dark)' }}>₹{booking.amount.toLocaleString()}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:13, color:'var(--c-muted)' }}>Cancellation Fee ({Math.round(feePct*100)}%)</span>
            <span style={{ fontWeight:600, color:'var(--c-danger)' }}>-₹{fee.toLocaleString()}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--c-border)', paddingTop:8 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'var(--c-dark)' }}>Refund Amount</span>
            <span style={{ fontSize:16, fontWeight:800, color:'var(--c-success)' }}>₹{refund.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <Button onClick={onClose} variant="ghost" fullWidth>Keep Booking</Button>
          <Button onClick={onConfirm} variant="danger" fullWidth icon="x">Cancel & Refund</Button>
        </div>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════════
   SHARED SMALL COMPONENTS
══════════════════════════════════════════════════ */
function PillTabs({ tabs, active, onChange, color }) {
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
      {tabs.map(t => {
        const on = active === t.id
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'9px 20px', borderRadius:10, cursor:'pointer',
            border:`1.5px solid ${on ? color : 'var(--c-border)'}`,
            background: on ? color : 'var(--c-surface)',
            color: on ? '#fff' : 'var(--c-mid)',
            fontFamily:'var(--font-sans)', fontWeight:600, fontSize:13, transition:'all .15s',
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: on ? 'rgba(255,255,255,.28)' : color,
                color:'#fff', fontSize:10, fontWeight:800, padding:'1px 7px', borderRadius:8,
              }}>{t.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function StatRow({ items }) {
  return (
    <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
      {items.map(s => (
        <div key={s.label} style={{ flex:1, minWidth:80, background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
          <p style={{ fontSize:26, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</p>
          <p style={{ fontSize:11, color:'var(--c-muted)', marginTop:5, fontWeight:600 }}>{s.label}</p>
        </div>
      ))}
    </div>
  )
}

function ColStack({ children }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:14 }}>{children}</div>
}

function MetaChip({ icon, children }) {
  return (
    <span style={{ display:'flex', alignItems:'center', gap:4 }}>
      <Icon name={icon} size={12}/>{children}
    </span>
  )
}

function InfoBox({ icon, bg, color, children }) {
  return (
    <div style={{ background:bg, borderRadius:9, padding:'8px 12px', marginBottom:12, display:'flex', gap:8, alignItems:'center' }}>
      <Icon name={icon} size={13} color={color}/>
      <span style={{ fontSize:12, color, fontWeight:500 }}>{children}</span>
    </div>
  )
}
