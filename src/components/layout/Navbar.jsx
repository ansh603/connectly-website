// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../../assets/icons/Icons.jsx'
import { useApp } from '../../context/AppContext.jsx'

// ── Nav shown when LOGGED IN ──
const NAV_AUTH = [
  { path:'/',         label:'Home'     },
  { path:'/explore',  label:'Explore'  },
  { path:'/bookings', label:'Bookings' },
  { path:'/wallet',   label:'Wallet'   },
]

// ── Nav shown when NOT logged in — only Login/Register (no Home/Explore) ──
const NAV_GUEST = []

const BOTTOM_NAV = [
  { path:'/',         icon:'home',     label:'Home'     },
  { path:'/explore',  icon:'search',   label:'Explore'  },
  { path:'/bookings', icon:'ticket',   label:'Bookings' },
  { path:'/wallet',   icon:'wallet',   label:'Wallet'   },
  { path:'/profile',  icon:'user',     label:'Profile'  },
]

export default function Navbar() {
  const { user, isLoggedIn, notifications, incomingRequests, markNotificationsRead } = useApp()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [notifOpen,  setNotifOpen]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const notifRef = useRef(null)

  const pendingCount = (incomingRequests || []).filter(r => r.status === 'pending').length
  const unreadCount  = (notifications    || []).filter(n => !n.read).length
  const NAV          = isLoggedIn ? NAV_AUTH : NAV_GUEST

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const notifColor = (type) => {
    if (type === 'payment') return 'var(--c-success)'
    if (type === 'booking') return 'var(--c-gold)'
    return 'var(--c-primary)'
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">

          {/* ── Logo ── */}
          <Link to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
            <div className="nav-logo-icon">
              <Icon name="users" size={20} color="#fff" />
            </div>
            <span className="nav-logo-text serif">Connect<span>ly</span></span>
          </Link>

          {/* ── Desktop nav links (always shown, content changes by auth state) ── */}
          <div className="nav-links hide-mobile">
            {NAV.map(n => (
              <Link key={n.path} to={n.path}
                className={`nav-link${isActive(n.path) ? ' active' : ''}`}
                style={{ position:'relative' }}>
                {n.label}
                {n.path === '/bookings' && pendingCount > 0 && (
                  <span style={{
                    position:'absolute', top:-4, right:-4,
                    background:'var(--c-danger)', color:'#fff',
                    fontSize:10, fontWeight:700, borderRadius:10,
                    padding:'1px 5px', lineHeight:1.4,
                  }}>{pendingCount}</span>
                )}
              </Link>
            ))}
          </div>

          {/* ── Right side ── */}
          <div className="nav-right">

            {/* Notification bell — only when logged in */}
            {isLoggedIn && (
              <div style={{ position:'relative' }} ref={notifRef}>
                <button className="notif-btn"
                  onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markNotificationsRead() }}>
                  <Icon name="bell" size={19} />
                  {unreadCount > 0 && (
                    <span style={{
                      position:'absolute', top:2, right:2,
                      background:'var(--c-danger)', color:'#fff',
                      fontSize:9, fontWeight:800, borderRadius:9,
                      padding:'1px 4px', lineHeight:1.4, minWidth:14, textAlign:'center',
                    }}>{unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="notif-dropdown anim-slideDown">
                    <div className="notif-header">
                      <span style={{ fontWeight:600, fontSize:15, color:'var(--c-dark)' }}>Notifications</span>
                      <span style={{ fontSize:12, color:'var(--c-muted)', cursor:'pointer' }}
                        onClick={markNotificationsRead}>Mark all read</span>
                    </div>
                    {notifications.length === 0 && (
                      <div style={{ padding:24, textAlign:'center', color:'var(--c-muted)', fontSize:13 }}>
                        No notifications yet
                      </div>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} className="notif-item">
                        <div className="notif-dot" style={{ background: notifColor(n.type) }} />
                        <div>
                          <p style={{ fontSize:13, color:'var(--c-dark)', lineHeight:1.45 }}>{n.text}</p>
                          <p style={{ fontSize:11, color:'var(--c-muted)', marginTop:3 }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── USER PILL (logged in) or LOGIN/REGISTER buttons (guest) ── */}
            {isLoggedIn ? (
              /* Logged-in: avatar + name + wallet balance */
              <div className="nav-user hide-mobile"
                onClick={() => navigate('/profile')}
                style={{ cursor:'pointer' }}>
                <img src={user?.photo} alt={user?.name}
                  style={{ width:36, height:36, borderRadius:10, objectFit:'cover', border:'2px solid var(--c-primary)' }} />
                <div className="nav-user-info">
                  <span className="nav-user-name">{user?.name?.split(' ')[0]}</span>
                  <span className="nav-user-wallet">₹{(user?.wallet || 0).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              /* Guest: Login + Register buttons */
              <div className="hide-mobile" style={{ display:'flex', gap:8, alignItems:'center' }}>
                <Link to="/login"
                  className="btn btn-sm btn-ghost"
                  style={{ color:'rgba(255,255,255,.85)', borderColor:'rgba(255,255,255,.25)' }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary">
                  Register
                </Link>
              </div>
            )}

            {/* Hamburger (mobile) */}
            <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
              <Icon name={mobileOpen ? 'x' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="mobile-drawer anim-slideDown">
            {/* Nav links */}
            {NAV.map(n => (
              <Link key={n.path} to={n.path}
                className={`mobile-link${isActive(n.path) ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                {n.label}
                {n.path === '/bookings' && pendingCount > 0 && (
                  <span style={{ background:'var(--c-danger)', color:'#fff', fontSize:11, fontWeight:700, borderRadius:10, padding:'2px 8px' }}>
                    {pendingCount} new
                  </span>
                )}
              </Link>
            ))}

            {/* Profile link — only when logged in */}
            {isLoggedIn && (
              <Link to="/profile" className={`mobile-link${isActive('/profile') ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}>
                Profile
              </Link>
            )}

            {/* Divider + auth buttons for guests */}
            {!isLoggedIn && (
              <div style={{ borderTop:'1px solid rgba(255,255,255,.12)', marginTop:8, paddingTop:12, display:'flex', gap:10 }}>
                <Link to="/login"    className="btn btn-sm btn-ghost"    onClick={() => setMobileOpen(false)}
                  style={{ flex:1, textAlign:'center', color:'rgba(255,255,255,.85)', borderColor:'rgba(255,255,255,.25)' }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary"  onClick={() => setMobileOpen(false)}
                  style={{ flex:1, textAlign:'center' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── Bottom nav (mobile, only when logged in) ── */}
      {isLoggedIn && (
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            {BOTTOM_NAV.map(item => (
              <Link key={item.path} to={item.path}
                className={`bnav-btn${isActive(item.path) ? ' active' : ''}`}
                style={{ position:'relative' }}>
                <Icon name={item.icon} size={21}
                  color={isActive(item.path) ? 'var(--c-primary)' : 'rgba(255,255,255,0.42)'} />
                <span>{item.label}</span>
                {item.path === '/bookings' && pendingCount > 0 && (
                  <span style={{
                    position:'absolute', top:0, right:8,
                    background:'var(--c-danger)', color:'#fff',
                    fontSize:9, fontWeight:700, borderRadius:9, padding:'1px 4px',
                  }}>{pendingCount}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  )
}
