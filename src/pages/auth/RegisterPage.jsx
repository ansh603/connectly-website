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
import uploadFile from '../../utils/uploadFile.js'
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
  registerStep2GroupSchema,
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
  /** @type {Array<{ file: File, preview: string }>} */
  const [galleryItems, setGalleryItems] = useState([])
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
        type: basic.type,
      })
      setStep(2)
    } catch (err) {
      handleApiError(err, setFieldErrors)
    }
  }

  /** Profile fields + gallery (min 3 photos) → availability step */
  const goStep3 = () => {
    try {
      if (basic.type === 'individual') {
        registerStep2IndividualSchema.parse({
          type: 'individual',
          bio: profile.bio,
          rate: profile.rate,
          city_id: profile.city_id,
          interests: profile.interests,
          age: profile.age,
        })
      } else {
        registerStep2GroupSchema.parse({
          type: 'group',
          bio: profile.bio,
          rate: profile.rate,
          city_id: profile.city_id,
          interests: profile.interests,
          groupName: profile.groupName,
          members: profile.members,
          groupType: profile.groupType,
          contactName: profile.contactName,
          age: profile.age,
          contactMobile: profile.contactMobile,
          contact_country_code: contactMobileCC,
        })
      }
      registerGalleryStepSchema.parse({ count: galleryItems.length })
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
      registerGalleryStepSchema.parse({ count: galleryItems.length })

      let profilePath = null
      const primaryFile =
        profile.groupImage instanceof File ? profile.groupImage : galleryItems[0]?.file
      if (primaryFile) {
        profilePath = await uploadFile('profile', primaryFile)
      }

      const profilePhotos = []
      for (const item of galleryItems) {
        if (item?.file) {
          const path = await uploadFile('gallery', item.file)
          profilePhotos.push(path)
        }
      }

      const availabilityJson = JSON.stringify({ days: dayAvail })

      const payload = registerApiPayloadSchema.parse({
        // For group registrations, store the owner's name in `users.name`
        // and store the actual group name separately in `user_groups.group_name`.
        name: basic.name.trim(),
        email: basic.email,
        password: basic.password,
        type: basic.type,
        country_code: mobileCC,
        phone_number: basic.mobile.replace(/\s/g, ''),
        bio: profile.bio,
        rate: Number(profile.rate),
        city_id: profile.city_id,
        age: profile.age ? Number(profile.age) : null,
        interest_ids: profile.interests,
        profile_path: profilePath || null,
        profile_photos: profilePhotos,
        availability: availabilityJson,
        ...(basic.type === 'group'
          ? {
              group_name: profile.groupName || null,
              group_type: profile.groupType || null,
              members: profile.members,
              contact_name: profile.contactName || null,
              contact_mobile: profile.contactMobile || null,
              contact_country_code: contactMobileCC || null,
            }
          : {}),
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

  const removeGalleryItem = (idx) => {
    setGalleryItems((items) => {
      const next = items.filter((_, i) => i !== idx)
      const removed = items[idx]
      if (removed?.preview?.startsWith('blob:')) URL.revokeObjectURL(removed.preview)
      return next
    })
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
        galleryPhotos: galleryItems.map((g) => g.preview),
        location: cities.find((c) => c.id === profile.city_id)?.name || '',
        bio: profile.bio,
        hourlyRate: Number(profile.rate) || undefined,
        type: basic.type,
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

              <div style={{marginBottom:24}}>
                <p className="form-label">Register As</p>
                <div className="type-grid">
                  {[{v:'individual',icon:'user',l:'Individual'},{v:'group',icon:'users',l:'Group'}].map(t=>(
                    <button key={t.v} className={`type-btn${basic.type===t.v?' active':''}`} onClick={()=>setBasic({...basic,type:t.v})}>
                      <Icon name={t.icon} size={26} color={basic.type===t.v?'var(--c-primary)':'var(--c-muted)'}/>
                      <span>{t.l}</span>
                    </button>
                  ))}
                </div>
              </div>
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

              {/* GROUP-ONLY FIELDS */}
              {basic.type === 'group' && (
                <div style={{
                  background:'var(--c-primary-lt)', borderRadius:14,
                  padding:'16px', marginBottom:20,
                  border:'1.5px solid rgba(13,148,136,0.2)',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <Icon name="users" size={15} color="var(--c-primary)" />
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--c-primary)' }}>Group Details</p>
                  </div>
                  <Input
                    label="Group Name"
                    placeholder="e.g. Sunday Strikers, FunSquad Mumbai"
                    value={profile.groupName || ''}
                    onChange={e => setProfile(p=>({...p, groupName: e.target.value}))}
                    icon="users"
                    required
                  />
                  <FieldError error={fieldErrors.groupName} />
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <Input
                      label="Number of Members"
                      type="number"
                      placeholder="e.g. 5"
                      value={profile.members || ''}
                      onChange={e => setProfile(p=>({...p, members: e.target.value}))}
                      icon="users"
                      required
                    />
                    <div className="form-group">
                      <label className="form-label">Group Type</label>
                      <select
                        value={profile.groupType || ''}
                        onChange={e => setProfile(p=>({...p, groupType: e.target.value}))}
                        style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid var(--c-border)', fontFamily:'var(--font-sans)', fontSize:14, outline:'none', background:'#fff', color:'var(--c-dark)' }}
                      >
                        <option value="">Select type</option>
                        <option value="friends">Friends Group</option>
                        <option value="sports">Sports Team</option>
                        <option value="corporate">Corporate Group</option>
                        <option value="entertainment">Entertainment Group</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <FieldError error={fieldErrors.members} />
                  <FieldError error={fieldErrors.groupType} />
                  {/* Group Image Upload */}
                  <div className="form-group">
                    <label className="form-label">Group Photo</label>
                    <div
                      onClick={() => document.getElementById('group-img-input').click()}
                      style={{
                        border:'2px dashed var(--c-primary)', borderRadius:12,
                        padding:'20px', textAlign:'center', cursor:'pointer',
                        background:'rgba(13,148,136,0.04)',
                        transition:'all .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(13,148,136,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background='rgba(13,148,136,0.04)'}
                    >
                      {profile.groupImagePreview ? (
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                          <img src={profile.groupImagePreview} alt="Group" style={{ width:64, height:64, borderRadius:12, objectFit:'cover' }} />
                          <p style={{ fontSize:12, color:'var(--c-primary)', fontWeight:600 }}>Change Photo</p>
                        </div>
                      ) : (
                        <>
                          <Icon name="camera" size={28} color="var(--c-primary)" />
                          <p style={{ fontSize:13, fontWeight:600, color:'var(--c-primary)', marginTop:8 }}>Upload Group Photo</p>
                          <p style={{ fontSize:11, color:'var(--c-muted)', marginTop:4 }}>JPG, PNG up to 5MB</p>
                        </>
                      )}
                    </div>
                    <input
                      id="group-img-input"
                      type="file"
                      accept="image/*"
                      style={{ display:'none' }}
                      onChange={e => {
                        const file = e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = ev => setProfile(p=>({...p, groupImage: file, groupImagePreview: ev.target.result}))
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Individual → Age only */}
              {basic.type === 'individual' && (
                <>
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
                </>
              )}

              {/* Group → Representative Details */}
              {basic.type === 'group' && (
                <div style={{
                  background:'rgba(249,250,251,0.8)', borderRadius:14,
                  padding:'16px', marginBottom:8,
                  border:'1.5px solid rgba(13,148,136,0.15)',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <Icon name="user" size={15} color="var(--c-primary)" />
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--c-primary)' }}>Representative Details</p>
                  </div>
                  <Input
                    label="Contact Person Name"
                    placeholder="Name of group representative"
                    value={profile.contactName || ''}
                    onChange={e => setProfile(p=>({...p, contactName: e.target.value}))}
                    icon="user"
                    required
                  />
                  <FieldError error={fieldErrors.contactName} />
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <Input
                      label="Age"
                      type="number"
                      placeholder="Age"
                      value={profile.age || ''}
                      onChange={e => setProfile(p=>({...p, age: e.target.value}))}
                      icon="user"
                      required
                    />
                    {/* Contact Mobile with country code */}
                    <PhoneInput
                      label="Contact Mobile"
                      value={profile.contactMobile || ''}
                      onChange={e => setProfile(p=>({...p, contactMobile: e.target.value}))}
                      countryCode={contactMobileCC}
                      onCountryChange={setContactMobileCC}
                      countryCodeError={fieldErrors.contact_country_code}
                      phoneError={fieldErrors.contactMobile}
                      required
                    />
                  </div>
                  <FieldError error={fieldErrors.age} />
                </div>
              )}

              <Textarea label="Bio" placeholder={basic.type==='group' ? 'Describe your group, what you do, and what events you\'re available for…' : 'Tell others about yourself…'} value={profile.bio} onChange={pUpd('bio')} rows={3} />
              <FieldError error={fieldErrors.bio} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Input label={basic.type==='group' ? 'Group Rate (₹/hr)' : 'Hourly Rate (₹)'} type="number" placeholder="e.g. 1200" value={profile.rate} onChange={pUpd('rate')} icon="rupee" required />
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

              {/* Gallery photos (merged from former step 3; selfie flow removed) */}
              <div style={{ marginBottom: 24, marginTop: 8, paddingTop: 20, borderTop: '1px solid var(--c-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-dark)' }}>📸 Gallery Photos</p>
                  <span style={{ fontSize: 12, color: galleryItems.length >= 3 ? 'var(--c-success)' : 'var(--c-warning)', fontWeight: 600 }}>
                    {galleryItems.length}/5 {galleryItems.length < 3 ? '(min 3 required)' : '✓'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 12 }}>Add at least 3 photos for your profile gallery (max 5).</p>
                <FieldError error={fieldErrors.count} />
                <FieldError error={fieldErrors._form} />
                {galleryItems.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
                    {galleryItems.map((item, idx) => (
                      <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '2px solid var(--c-primary)' }}>
                        <img src={item.preview} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(idx)}
                          style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 9, background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                          <Icon name="x" size={10} color="#fff" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {galleryItems.length < 5 && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => document.getElementById('register-gallery-input').click()}
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('register-gallery-input').click()}
                    style={{
                      border: '2px dashed var(--c-primary)', borderRadius: 12,
                      padding: '16px', textAlign: 'center', cursor: 'pointer',
                      background: 'var(--c-primary-lt)', transition: 'all .15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(13,148,136,0.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-primary-lt)' }}
                  >
                    <Icon name="camera" size={24} color="var(--c-primary)" />
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-primary)', marginTop: 6 }}>
                      Add Photos ({5 - galleryItems.length} remaining)
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--c-muted)', marginTop: 2 }}>JPG, PNG up to 5MB each</p>
                  </div>
                )}
                <input
                  id="register-gallery-input"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    files.forEach((file) => {
                      setGalleryItems((prev) => {
                        if (prev.length >= 5) return prev
                        const preview = URL.createObjectURL(file)
                        return [...prev, { file, preview }]
                      })
                    })
                    setFieldErrors((p) => {
                      const next = { ...p }
                      delete next.count
                      return next
                    })
                    e.target.value = ''
                  }}
                />
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
              {['name', 'email', 'password', 'type', 'country_code', 'phone_number', 'bio', 'rate', 'city_id', 'age', 'interest_ids', 'profile_path', 'profile_photos'].map((k) => (
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
