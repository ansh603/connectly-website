// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ZodError } from 'zod'
import Icon from '../../assets/icons/Icons.jsx'
import { Card, Button, Input } from '../../components/ui/UI.jsx'
import FieldError from '../../components/error/FieldErrorHandler.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { loginApi, verifyEmailApi, resendVerificationOtpApi } from '../../api/auth.js'
import { loginSchema } from '../../validations/auth.js'
import { handleApiError } from '../../utils/handleApiError.js'
import { notifySuccess } from '../../utils/notification.js'
import { getOptionalPushDevicePayload } from '../../utils/notificationDevice.js'

export default function LoginPage() {
  const { login } = useApp()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [needsEmailVerify, setNeedsEmailVerify] = useState(false)
  const [needsEmailVerifyMessage, setNeedsEmailVerifyMessage] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const body = loginSchema.parse({ email, password })
      const res = await loginApi({
        email: body.email,
        password: body.password,
        ...getOptionalPushDevicePayload(),
      })
      const data = res.data?.data
      if (!data?.jwt_token) {
        throw new Error(res.data?.message || 'Login failed')
      }
      setNeedsEmailVerify(false)
      login(data)
      notifySuccess(res.data?.message || 'Login successful')
      nav('/')
    } catch (err) {
      if (err instanceof ZodError) {
        handleApiError(err, setFieldErrors)
      } else if (err.response?.status === 403 && err.response?.data?.needs_email_verification) {
        setNeedsEmailVerify(true)
          setNeedsEmailVerifyMessage(err.response.data?.message || '')
          // Do not toast + redirect here; show OTP UI instead.
      } else {
        handleApiError(err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-page login-page">
      <div className="register-box auth-box">
        <div className="register-logo">
          <div className="register-logo-icon"><Icon name="users" size={28} color="#fff"/></div>
          <h1 className="serif" style={{fontSize:28,fontWeight:700,color:'var(--c-dark)'}}>Welcome back</h1>
          <p style={{color:'var(--c-mid)',fontSize:14,marginTop:5}}>Sign in to your Connectly account</p>
        </div>

        <Card flat style={{padding:32}}>
          <form onSubmit={handleLogin} className="auth-form">
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setFieldErrors((p) => {
                  const next = { ...p }
                  delete next.email
                  return next
                })
              }}
              required
            />
            <FieldError error={fieldErrors.email} />

            <div className="form-group">
              <label className="form-label required">Password</label>
              <div className="form-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setFieldErrors((p) => {
                      const next = { ...p }
                      delete next.password
                      return next
                    })
                  }}
                  className="form-input"
                  style={{paddingRight: 44}}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', padding:4,
                    color:'var(--c-muted)', display:'flex', alignItems:'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
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
              <FieldError error={fieldErrors.password} />
            </div>

            <Button type="submit" fullWidth size="lg" iconRight="arrowRight" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {needsEmailVerify && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--c-border)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--c-dark)' }}>
                Verify your email
              </h3>
              <p style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 12 }}>
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
              {needsEmailVerifyMessage && (
                <p style={{ fontSize: 12, color: 'var(--c-primary)', marginTop: -6, marginBottom: 12, fontWeight: 600 }}>
                  {needsEmailVerifyMessage}
                </p>
              )}
              <div className="form-group">
                <label className="form-label required">Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-input"
                  style={{ letterSpacing: '0.2em', fontWeight: 700, textAlign: 'center' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSendingOtp}
                  onClick={async () => {
                    setIsSendingOtp(true)
                    try {
                      await resendVerificationOtpApi({ email: email.trim(), password })
                      notifySuccess('Code sent')
                    } catch (e) {
                      handleApiError(e)
                    } finally {
                      setIsSendingOtp(false)
                    }
                  }}
                >
                  {isSendingOtp ? 'Sending…' : 'Resend code'}
                </Button>
              </div>
              <Button
                type="button"
                fullWidth
                size="lg"
                icon="check"
                disabled={otpCode.length !== 6 || isVerifying}
                onClick={async () => {
                  setIsVerifying(true)
                  try {
                    const res = await verifyEmailApi({
                      email: email.trim(),
                      otp_code: otpCode,
                      ...getOptionalPushDevicePayload(),
                    })
                    const data = res.data?.data
                    if (!data?.jwt_token) throw new Error(res.data?.message || 'Verification failed')
                    setNeedsEmailVerify(false)
                    login(data)
                    notifySuccess(res.data?.message || 'Verified — welcome!')
                    nav('/')
                  } catch (e) {
                    handleApiError(e)
                  } finally {
                    setIsVerifying(false)
                  }
                }}
              >
                {isVerifying ? 'Verifying…' : 'Verify & sign in'}
              </Button>
            </div>
          )}

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Register</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
