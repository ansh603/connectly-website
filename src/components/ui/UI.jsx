// src/components/common/UI.jsx
import { useState } from 'react'
import Icon from '../../assets/icons/Icons.jsx'

/* ── Button ── */
export function Button({ children, onClick, variant='primary', size='md', fullWidth=false, icon, iconRight, type='button', disabled=false, className='', style:sx={} }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${fullWidth?'btn-full':''} ${className}`}
      style={{ opacity:disabled?.5:1, cursor:disabled?'not-allowed':'pointer', ...sx }}>
      {icon      && <Icon name={icon}      size={size==='sm'?14:size==='lg'?17:15} />}
      {children}
      {iconRight && <Icon name={iconRight} size={15} />}
    </button>
  )
}

/* ── Badge ── */
export function Badge({ children, variant='primary', style:sx={} }) {
  return <span className={`badge badge-${variant}`} style={sx}>{children}</span>
}

/* ── Card ── */
export function Card({ children, className='', onClick, flat=false, style:sx={} }) {
  return (
    <div className={`${flat?'card-flat':'card'} ${className}`}
      onClick={onClick} style={{ cursor:onClick?'pointer':'default', ...sx }}>
      {children}
    </div>
  )
}

/* ── Input ── */
export function Input({ label, placeholder, value, onChange, type='text', icon, required, name, min, max, step }) {
  return (
    <div className="form-group">
      {label && <label className={`form-label${required?' required':''}`}>{label}</label>}
      <div className="form-input-wrap">
        {icon && <span className="form-icon"><Icon name={icon} size={15} /></span>}
        <input type={type} name={name} placeholder={placeholder} value={value}
          onChange={onChange} min={min} max={max} step={step}
          className={`form-input${icon?' has-icon':''}`} />
      </div>
    </div>
  )
}

/* ── Textarea ── */
export function Textarea({ label, placeholder, value, onChange, rows=3, required }) {
  return (
    <div className="form-group">
      {label && <label className={`form-label${required?' required':''}`}>{label}</label>}
      <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows} className="form-textarea" />
    </div>
  )
}

/* ── Select ── */
export function Select({ label, value, onChange, options=[], required }) {
  return (
    <div className="form-group">
      {label && <label className={`form-label${required?' required':''}`}>{label}</label>}
      <select value={value} onChange={onChange} className="form-select">
        {options.map(o => (
          <option key={o.value??o} value={o.value??o}>{o.label??o}</option>
        ))}
      </select>
    </div>
  )
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, width=540 }) {
  if (!open) return null
  return (
    <div className="modal-overlay anim-fadeIn" onClick={onClose}>
      <div className="modal-box anim-scaleIn" style={{ maxWidth:width }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title serif">{title}</h2>
          <button className="modal-close" onClick={onClose}><Icon name="x" size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Star Rating ── */
export function StarRating({ rating, showCount=false, count }) {
  return (
    <div className="star-rating">
      {[1,2,3,4,5].map(i => (
        <Icon key={i} name="star" size={13} color={i<=Math.floor(rating)?'var(--c-gold)':'var(--c-border)'} />
      ))}
      <span className="rating-count">{rating}{showCount&&count?` (${count})`:''}</span>
    </div>
  )
}

/* ── Success State ── */
export function SuccessState({ title, message, onClose, btnLabel='Done' }) {
  return (
    <div className="success-state">
      <div className="success-icon"><Icon name="check" size={36} color="var(--c-success)" /></div>
      <h3 className="serif">{title}</h3>
      <p>{message}</p>
      {onClose && <Button onClick={onClose} fullWidth>{btnLabel}</Button>}
    </div>
  )
}

/* ── Empty State ── */
export function EmptyState({ icon='search', title, message, action }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={48} color="var(--c-border)" />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div style={{marginTop:16}}>{action}</div>}
    </div>
  )
}

/* ── Escrow Summary ── */
export function EscrowBox({ rate, duration, commission=0.3 }) {
  const total    = rate * duration
  const platform = Math.round(total * commission)
  const earn     = total - platform
  return (
    <div className="escrow-box">
      <div className="escrow-row">
        <span style={{color:'var(--c-mid)'}}>₹{rate} × {duration} hour{duration>1?'s':''}</span>
        <span style={{fontWeight:600,color:'var(--c-dark)'}}>₹{total.toLocaleString()}</span>
      </div>
      <div className="escrow-row">
        <span style={{color:'var(--c-muted)',fontSize:12}}>Provider receives</span>
        <span style={{color:'var(--c-success)',fontWeight:600,fontSize:13}}>₹{earn.toLocaleString()}</span>
      </div>
      <div className="escrow-row">
        <span style={{color:'var(--c-muted)',fontSize:12}}>Platform commission</span>
        <span style={{color:'var(--c-muted)',fontSize:13}}>₹{platform.toLocaleString()}</span>
      </div>
      <div className="escrow-row total">
        <span className="elabel">Total (Escrow)</span>
        <span className="evalue">₹{total.toLocaleString()}</span>
      </div>
    </div>
  )
}

/* ── OTP Modal ── */
export function OTPModal({ open, onClose, mode='enter', name, bookingId, onVerified, onGenerateOtp, onVerifyOtp }) {
  const [otp, setOtp] = useState(['','','','','',''])
  const [genOtp, setGenOtp] = useState('')
  const [generated, setGenerated] = useState(false)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e, idx) => {
    const val = e.target.value.slice(-1)
    const next = [...otp]; next[idx] = val; setOtp(next)
    if (val && idx < 5) document.getElementById(`otp-${idx+1}`)?.focus()
    setError('')
  }

  const handleGenerate = async () => {
    if (onGenerateOtp && bookingId) {
      setLoading(true)
      setError('')
      try {
        const fetchedOtp = await onGenerateOtp(bookingId)
        setGenOtp(fetchedOtp)
        setGenerated(true)
      } catch (err) {
        setError(err?.message || err?.response?.data?.message || 'Failed to generate OTP')
      } finally {
        setLoading(false)
      }
    } else {
      setGenOtp(String(Math.floor(100000 + Math.random() * 900000)))
      setGenerated(true)
    }
  }

  const handleVerify = async () => {
    const otpStr = otp.join('')
    if (otpStr.length !== 6) return
    if (onVerifyOtp && bookingId) {
      setLoading(true)
      setError('')
      try {
        await onVerifyOtp(bookingId, otpStr)
        setVerified(true)
        if (onVerified) onVerified()
      } catch (err) {
        setError(err?.message || err?.response?.data?.message || 'Invalid OTP')
      } finally {
        setLoading(false)
      }
    } else {
      setVerified(true)
      if (onVerified) onVerified()
    }
  }

  const handleClose = () => {
    setVerified(false)
    setGenerated(false)
    setGenOtp('')
    setOtp(['','','','','',''])
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Meeting Confirmation" width={420}>
      {!verified ? (
        <>
          <div style={{textAlign:'center',marginBottom:24}}>
            <div style={{width:64,height:64,background:'var(--c-primary-lt)',borderRadius:32,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
              <Icon name="shield" size={28} color="var(--c-primary)" />
            </div>
            <p style={{color:'var(--c-mid)',fontSize:14}}>Meeting with <strong>{name}</strong></p>
          </div>
          {error && (
            <div style={{background:'#FEE2E2',color:'#991B1B',padding:10,borderRadius:10,marginBottom:16,fontSize:13}}>{error}</div>
          )}
          {mode==='generate' ? (
            !generated ? (
              <Button onClick={handleGenerate} fullWidth size="lg" icon="zap" disabled={loading}>
                {loading ? 'Generating…' : 'Generate OTP'}
              </Button>
            ) : (
              <div style={{textAlign:'center'}}>
                <p style={{fontSize:13,color:'var(--c-muted)',marginBottom:12}}>Share this OTP with <strong>{name}</strong> at the meeting:</p>
                <div style={{fontSize:40,fontWeight:800,letterSpacing:14,color:'var(--c-primary)',fontFamily:'monospace',background:'var(--c-primary-lt)',padding:'16px 24px',borderRadius:14,marginBottom:14}}>
                  {genOtp}
                </div>
                <p style={{fontSize:12,color:'var(--c-muted)'}}>{name} will enter this OTP to confirm the meeting and release payment.</p>
              </div>
            )
          ) : (
            <>
              <p style={{fontSize:13,color:'var(--c-muted)',marginBottom:16,textAlign:'center'}}>Enter the OTP shown by <strong>{name}</strong>:</p>
              <div className="otp-group">
                {otp.map((v,i)=>(
                  <input key={i} id={`otp-${i}`} className="otp-input" maxLength={1} value={v} onChange={e=>handleChange(e,i)} />
                ))}
              </div>
              <Button onClick={handleVerify} fullWidth size="lg" icon="check" disabled={loading || otp.join('').length !== 6}>
                {loading ? 'Verifying…' : 'Verify OTP and Release Payment'}
              </Button>
            </>
          )}
        </>
      ) : (
        <SuccessState title="Meeting Confirmed!" message="Payment has been released from escrow to wallet." onClose={handleClose} />
      )}
    </Modal>
  )
}
