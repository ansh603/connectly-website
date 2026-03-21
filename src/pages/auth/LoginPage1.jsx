// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../../assets/icons/Icons.jsx'
import { Card, Button, Input } from '../../components/ui/UI.jsx'
import { useApp } from '../../context/AppContext.jsx'

export default function LoginPage() {
  const { login } = useApp()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    login({ name: email?.split('@')[0] || 'User', email })
    nav('/')
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth size="lg" iconRight="arrowRight">
              Sign In
            </Button>
          </form>
          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Register</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
