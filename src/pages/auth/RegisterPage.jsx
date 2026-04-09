// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ZodError } from 'zod'
import Icon from '../../assets/icons/Icons.jsx'
import { Card, Button, Input, Textarea, SuccessState } from '../../components/ui/UI.jsx'
import FieldError from '../../components/error/FieldErrorHandler.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { registerApi, verifyEmailApi, resendVerificationOtpApi } from '../../api/auth.js'
import { getCitiesApi, getInterestsApi } from '../../api/global.js'
import { handleApiError } from '../../utils/handleApiError.js'
import { getOptionalPushDevicePayload } from '../../utils/notificationDevice.js'
import { notifySuccess } from '../../utils/notification.js'
import { DAYS, buildDefaultDayAvail } from '../../utils/availabilitySlots.js'
import {
  registerApiPayloadSchema,
  registerAvailabilityStepSchema,
  registerGalleryStepSchema,
  registerOtpSchema,
  registerStep1Schema,
  registerStep2IndividualSchema,
} from '../../validations/auth.js'

const STEPS = [
  { n: 1, label: 'Basic Info' },
  { n: 2, label: 'Your Profile' },
  { n: 3, label: 'Availability' },
  { n: 4, label: 'Verify' },
]

/* ── Country codes list ── */
const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+1',   flag: '🇺🇸', name: 'USA' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
]

/* ── Reusable Phone Input with country code ── */
function PhoneInput({ label, value, onChange, countryCode, onCountryChange, required, placeholder = '0000000000', countryCodeError, phoneError }) {
  const [open, setOpen] = useState(false)
  const selected = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]

  return (
    <div className="form-group">
      {label && <label className={`form-label${required ? ' required' : ''}`}>{label}</label>}
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Country code selector */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '11px 10px', border: '1.5px solid var(--c-border)',
              borderRight: 'none', borderRadius: 'var(--r-md) 0 0 var(--r-md)',
              background: 'var(--c-surface)', cursor: 'pointer',
              fontSize: 14, color: 'var(--c-dark)', whiteSpace: 'nowrap',
              minWidth: 90, fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ fontSize: 18 }}>{selected.flag}</span>
            <span style={{ fontWeight: 600 }}>{selected.code}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {open && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 999,
              background: '#fff', border: '1.5px solid var(--c-border)',
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              maxHeight: 220, overflowY: 'auto', minWidth: 180,
            }}>
              {COUNTRY_CODES.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onCountryChange(c.code); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 14px', border: 'none',
                    background: c.code === countryCode ? 'var(--c-primary-lt)' : 'transparent',
                    cursor: 'pointer', fontSize: 13, color: 'var(--c-dark)',
                    textAlign: 'left', fontFamily: 'var(--font-sans)',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{c.flag}</span>
                  <span style={{ fontWeight: 600, minWidth: 36 }}>{c.code}</span>
                  <span style={{ color: 'var(--c-muted)' }}>{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Number input */}
        <input
          type="tel"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            flex: 1, padding: '11px 14px',
            border: '1.5px solid var(--c-border)', borderLeft: 'none',
            borderRadius: '0 var(--r-md) var(--r-md) 0',
            background: 'var(--c-surface)', color: 'var(--c-dark)',
            fontFamily: 'var(--font-sans)', fontSize: 14, outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--c-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,.1)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--c-border)'; e.target.style.boxShadow = 'none' }}
        />
      </div>
      <FieldError error={countryCodeError} />
      <FieldError error={phoneError} />
    </div>
  )
}

/* ── Reusable Password Input with eye toggle ── */
function PasswordInput({ label, value, onChange, placeholder, required, fieldError }) {
  const [show, setShow] = useState(false)
  return (
    <div className="form-group">
      <label className={`form-label${required ? ' required' : ''}`}>{label}</label>
      <div className="form-input-wrap">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="form-input"
          style={{ paddingRight: 44 }}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: 'var(--c-muted)', display: 'flex', alignItems: 'center',
          }}
          title={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <Icon name="eye" size={18} />
          )}
        </button>
      </div>
      <FieldError error={fieldError} />
    </div>
  )
}

export default function RegisterPage() {
  const { login } = useApp()
  const nav = useNavigate()
  const [step,     setStep]     = useState(1)
  const [complete, setComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMetaLoading, setIsMetaLoading] = useState(true)
  const [basic,    setBasic]    = useState({name:'',mobile:'',email:'',password:'',confirmPassword:'',type:'individual'})
  const [profile,  setProfile]  = useState({bio:'',rate:'',city_id:'',interests:[],age:''})
  const [cities, setCities] = useState([])
  const [interests, setInterests] = useState([])
  const [fieldErrors, setFieldErrors] = useState({})
  const [dayAvail, setDayAvail] = useState(buildDefaultDayAvail)
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpDevHint, setOtpDevHint] = useState('')
  const [accountCreated, setAccountCreated] = useState(false)

  // Country codes state
  const [mobileCC,        setMobileCC]        = useState('+91')
  const [contactMobileCC, setContactMobileCC] = useState('+91')

  useEffect(() => {
    setFieldErrors({})
  }, [step])

  useEffect(() => {
    const loadMeta = async () => {
      setIsMetaLoading(true)
      try {
        const [cityRes, interestRes] = await Promise.all([getCitiesApi(), getInterestsApi()])
        setCities(cityRes?.data?.data || [])
        setInterests(interestRes?.data?.data || [])
      } catch (err) {
        handleApiError(err)
      } finally {
        setIsMetaLoading(false)
      }
    }
    loadMeta()
  }, [])

  const bUpd = f => e => setBasic({...basic,[f]:e.target.value})
  const pUpd = f => e => setProfile({...profile,[f]:e.target.value})
  const toggleInt = i => setProfile(p=>({...p,interests:p.interests.includes(i)?p.interests.filter(x=>x!==i):[...p.interests,i]}))

  const goStep2 = () => {
    try {
      registerStep1Schema.parse({
        name: basic.name,
        phone_number: basic.mobile,
        country_code: mobileCC,
        email: basic.email,
        password: basic.password,
        confirmPassword: basic.confirmPassword,
        type: 'individual',
      })
      setStep(2)
    } catch (err) {
      handleApiError(err, setFieldErrors)
    }
  }

  /** Profile fields → availability step */
  const goStep3 = () => {
    try {
      registerStep2IndividualSchema.parse({
        type: 'individual',
        bio: profile.bio,
        rate: profile.rate,
        city_id: profile.city_id,
        interests: profile.interests,
        age: profile.age,
      })
      registerGalleryStepSchema.parse({ count: 0 })
      setStep(3)
    } catch (err) {
      handleApiError(err, setFieldErrors)
    }
  }

  const submitRegisterAndGoToVerify = async () => {
    try {
      registerAvailabilityStepSchema.parse({ days: dayAvail })
      setFieldErrors((p) => {
        const next = { ...p }
        delete next.availability
        return next
      })
    } catch (err) {
      handleApiError(err, setFieldErrors)
      return
    }

    if (accountCreated) {
      setStep(4)
      return
    }

    setIsSubmitting(true)
    setOtpDevHint('')
    try {
      registerGalleryStepSchema.parse({ count: 0 })

      const availabilityJson = JSON.stringify({ days: dayAvail })

      const payload = registerApiPayloadSchema.parse({
        name: basic.name.trim(),
        email: basic.email,
        password: basic.password,
        type: 'individual',
        country_code: mobileCC,
        phone_number: basic.mobile.replace(/\s/g, ''),
        bio: profile.bio,
        rate: Number(profile.rate),
        city_id: profile.city_id,
        age: profile.age ? Number(profile.age) : null,
        interest_ids: profile.interests,
        availability: availabilityJson,
      })

      const res = await registerApi({
        ...payload,
        ...getOptionalPushDevicePayload(),
      })
      const debug = res.data?.data?.debug_otp
      if (debug) setOtpDevHint(String(debug))
      setAccountCreated(true)
      notifySuccess(res.data?.message || 'Check your email for the verification code')
      setStep(4)
    } catch (err) {
      if (err instanceof ZodError) {
        handleApiError(err, setFieldErrors)
      } else {
        handleApiError(err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendOtpToEmail = async () => {
    setIsSendingOtp(true)
    setOtpDevHint('')
    try {
      const res = await resendVerificationOtpApi({
        email: basic.email.trim(),
        password: basic.password,
      })
      const debug = res.data?.data?.debug_otp
      if (debug) setOtpDevHint(String(debug))
      notifySuccess(res.data?.message || 'Verification code sent')
    } catch (err) {
      handleApiError(err)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyAndComplete = async () => {
    setIsSubmitting(true)
    try {
      registerOtpSchema.parse({ otp_code: otpCode.replace(/\s/g, '') })
      const availabilityJson = JSON.stringify({ days: dayAvail })
      const res = await verifyEmailApi({
        email: basic.email.trim(),
        otp_code: otpCode.replace(/\s/g, ''),
        ...getOptionalPushDevicePayload(),
      })
      const data = res.data?.data
      if (!data?.jwt_token) {
        throw new Error(res.data?.message || 'Verification failed')
      }

      login(data, {
        interests: profile.interests,
        location: cities.find((c) => c.id === profile.city_id)?.name || '',
        bio: profile.bio,
        hourlyRate: Number(profile.rate) || undefined,
        type: 'individual',
        availability: data.availability ?? availabilityJson,
      })
      notifySuccess(res.data?.message || 'Welcome to Connectly!')
      setComplete(true)
    } catch (err) {
      if (err instanceof ZodError) {
        handleApiError(err, setFieldErrors)
      } else {
        handleApiError(err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Password match check
  const passwordMismatch = basic.confirmPassword && basic.password !== basic.confirmPassword

  return (
    <div className="register-page">
      <div className="register-box">
        <div className="register-logo">
          <div className="register-logo-icon"><Icon name="users" size={28} color="#fff"/></div>
          <h1 className="serif" style={{fontSize:28,fontWeight:700,color:'var(--c-dark)'}}>Join Connectly</h1>
          <p style={{color:'var(--c-mid)',fontSize:14,marginTop:5}}>Create your verified social profile</p>
        </div>

        {/* Steps */}
        <div className="progress-steps">
          {STEPS.map(s=>{
            const done   = s.n < step
            const active = s.n === step
            return (
              <div key={s.n} className="pstep">
                <div className={`pstep-circle${done?' done':active?' active':''}`}>
                  {done ? <Icon name="check" size={14} color="#fff"/> : s.n}
                </div>
                <div className={`pstep-label${active?' active':''}`}>{s.label}</div>
              </div>
            )
          })}
        </div>

        <Card flat style={{padding:32}}>

          {/* ── Step 1 ── */}
          {step===1 && (
            <>
              <h3 style={{fontWeight:700,fontSize:18,marginBottom:20,color:'var(--c-dark)'}}>Basic Information</h3>
              <FieldError error={fieldErrors._form} />
              <Input label="Full Name" placeholder="Your full name" value={basic.name} onChange={bUpd('name')} icon="user" required />
              <FieldError error={fieldErrors.name} />

              {/* Mobile with country code */}
              <PhoneInput
                label="Mobile Number"
                value={basic.mobile}
                onChange={bUpd('mobile')}
                countryCode={mobileCC}
                onCountryChange={setMobileCC}
                countryCodeError={fieldErrors.country_code}
                phoneError={fieldErrors.phone_number}
                required
              />

              <Input label="Email Address" type="email" placeholder="your@email.com" value={basic.email} onChange={bUpd('email')} required />
              <FieldError error={fieldErrors.email} />

              {/* Password with toggle */}
              <PasswordInput
                label="Password"
                value={basic.password}
                onChange={bUpd('password')}
                placeholder="Create a strong password"
                fieldError={fieldErrors.password}
                required
              />

              {/* Confirm Password with toggle */}
              <PasswordInput
                label="Confirm Password"
                value={basic.confirmPassword}
                onChange={bUpd('confirmPassword')}
                placeholder="Re-enter your password"
                fieldError={fieldErrors.confirmPassword}
                required
              />
              {passwordMismatch && (
                <p style={{fontSize:12,color:'#ef4444',marginTop:-10,marginBottom:12,fontWeight:500}}>
                  ⚠ Passwords do not match
                </p>
              )}

              <Button
                onClick={() => { if (!passwordMismatch) goStep2() }}
                fullWidth size="lg" iconRight="arrowRight"
                disabled={passwordMismatch}
              >
                Continue
              </Button>
              <p className="auth-switch">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">Sign In</Link>
              </p>
            </>
          )}

          {/* ── Step 2 ── */}
          {step===2 && (
            <>
              <h3 style={{fontWeight:700,fontSize:18,marginBottom:20,color:'var(--c-dark)'}}>Complete Your Profile</h3>
              <FieldError error={fieldErrors._form} />

              <Input
                label="Age"
                type="number"
                placeholder="Your age"
                value={profile.age || ''}
                onChange={e => setProfile(p=>({...p, age: e.target.value}))}
                icon="user"
                required
              />
              <FieldError error={fieldErrors.age} />

              <Textarea label="Bio" placeholder="Tell others about yourself…" value={profile.bio} onChange={pUpd('bio')} rows={3} />
              <FieldError error={fieldErrors.bio} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Input label="Hourly Rate (₹)" type="number" placeholder="e.g. 1200" value={profile.rate} onChange={pUpd('rate')} icon="rupee" required />
                <div className="form-group">
                  <label className="form-label">City / Location</label>
                  <select
                    value={profile.city_id}
                    onChange={pUpd('city_id')}
                    required
                    style={{ width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc' }}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <FieldError error={fieldErrors.rate} />
              <FieldError error={fieldErrors.city_id} />
              <div style={{marginBottom:20}}>
                <p className="form-label required" style={{marginBottom:10}}>Select Interests (min. 3)</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {interests.map((i) => (
                    <button key={i.id} className={`chip${profile.interests.includes(i.id)?' active':''}`} onClick={()=>toggleInt(i.id)}>{i.name}</button>
                  ))}
                </div>
                <p style={{fontSize:11,color:'var(--c-muted)',marginTop:8}}>{profile.interests.length} / 3 minimum selected</p>
                <FieldError error={fieldErrors.interests} />
              </div>

              <div style={{display:'flex',gap:10}}>
                <Button onClick={()=>setStep(1)} variant="ghost" icon="arrowLeft">Back</Button>
                <Button onClick={goStep3} fullWidth size="lg" iconRight="arrowRight" disabled={isMetaLoading}>
                  {isMetaLoading ? "Loading..." : "Continue"}
                </Button>
              </div>
            </>
          )}

          {/* ── Step 3: Availability (same UI as profile availability tab) ── */}
          {step === 3 && !complete && (
            <>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--c-dark)' }}>Availability</h3>
              <p style={{ fontSize: 13, color: 'var(--c-mid)', marginBottom: 20 }}>
                When are you typically available? Pick days and time slots.
              </p>
              <FieldError error={fieldErrors.availability} />
              {DAYS.map((day) => (
                <div key={day} className="avail-row">
                  <div className="avail-day">{day}</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!dayAvail[day]?.on}
                      onChange={(e) =>
                        setDayAvail((p) => ({
                          ...p,
                          [day]: { ...(p[day] || { slot: 'Evening (6PM–10PM)' }), on: e.target.checked },
                        }))
                      }
                      style={{ accentColor: 'var(--c-primary)', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--c-mid)' }}>Available</span>
                  </label>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '7px 32px 7px 12px', fontSize: 13 }}
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
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <Button onClick={() => setStep(2)} variant="ghost" icon="arrowLeft">Back</Button>
                <Button
                  onClick={submitRegisterAndGoToVerify}
                  fullWidth
                  size="lg"
                  iconRight="arrowRight"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating account…' : 'Continue'}
                </Button>
              </div>
            </>
          )}

          {/* ── Step 4: Email OTP + complete registration ── */}
          {step === 4 && !complete && (
            <>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--c-dark)' }}>Verify your email</h3>
              <p style={{ fontSize: 13, color: 'var(--c-mid)', marginBottom: 16 }}>
                We emailed a 6-digit code to <strong>{basic.email}</strong> (valid for 1 hour). Enter it below to activate your account.
              </p>
              {isSendingOtp && (
                <p style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 12 }}>Sending new code…</p>
              )}
              {otpDevHint && (
                <p style={{ fontSize: 12, color: 'var(--c-warning)', marginBottom: 12, fontWeight: 600 }}>
                  {otpDevHint} (dev / SMTP not configured)
                </p>
              )}
              <div className="form-group">
                <label className="form-label required">6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-input"
                  style={{ letterSpacing: '0.25em', fontSize: 18, fontWeight: 700, textAlign: 'center' }}
                />
                <FieldError error={fieldErrors.otp_code} />
              </div>
              {['name', 'email', 'password', 'type', 'country_code', 'phone_number', 'bio', 'rate', 'city_id', 'age', 'interest_ids'].map((k) => (
                <FieldError key={k} error={fieldErrors[k]} />
              ))}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <Button type="button" variant="ghost" size="sm" onClick={sendOtpToEmail} disabled={isSendingOtp}>
                  {isSendingOtp ? 'Sending…' : 'Resend code'}
                </Button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button onClick={() => setStep(3)} variant="ghost" icon="arrowLeft">Back</Button>
                <Button
                  onClick={handleVerifyAndComplete}
                  fullWidth
                  size="lg"
                  icon="check"
                  disabled={otpCode.length !== 6 || isSubmitting}
                  style={{ opacity: otpCode.length !== 6 || isSubmitting ? 0.5 : 1 }}
                >
                  {isSubmitting ? 'Submitting…' : 'Complete registration'}
                </Button>
              </div>
            </>
          )}

          {complete && (
            <SuccessState title="Welcome to Connectly!" message="Your profile is live. Start exploring people." onClose={()=>nav('/')} btnLabel="Go to Home" />
          )}
        </Card>
      </div>
    </div>
  )
}
