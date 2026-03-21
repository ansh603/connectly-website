// src/pages/HomePage.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../../assets/icons/Icons.jsx'
import { Button, Badge, Card } from '../../components/ui/UI.jsx'
import ProfileCard from '../../components/shared/ProfileCard.jsx'
import Footer from '../../components/layout/Footer.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { INDIVIDUALS } from '../../data/mockData.js'
import { exploreProfilesApi } from '../../api/explore.js'
import { BASE_IMAGE_URL } from '../../utils/config.js'
import { getInterestsApi } from '../../api/global.js'

function toDisplayUrl(path) {
  if (!path) return ''
  const p = String(path).trim()
  if (!p) return ''
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p
  return `${BASE_IMAGE_URL.replace(/\/+$/, '')}/${p.replace(/^\/+/, '')}`
}

const FALLBACK_USE_CASES = [
  { icon:'coffee',   label:'Coffee Meetup',     color:'#C84B31', bg:'#F2E8E5' },
  { icon:'sport',    label:'Cricket Match',      color:'#2C5F8A', bg:'#E4EEF6' },
  { icon:'users',    label:'Birthday Party',     color:'#D4A017', bg:'#FDF6E3' },
  { icon:'music',    label:'Club Night',         color:'#7C3AED', bg:'#EDE9FE' },
  { icon:'globe',    label:'Travel Companion',   color:'#2D7A4F', bg:'#D1FAE5' },
  { icon:'trending', label:'Networking',         color:'#C84B31', bg:'#F2E8E5' },
  { icon:'zap',      label:'Seminar Crowd',      color:'#2C5F8A', bg:'#E4EEF6' },
  { icon:'heart',    label:'Wedding Guest',      color:'#BE185D', bg:'#FCE7F3' },
]

const HOW = [
  { n:'01', title:'Complete Your Profile', desc:'Register, verify with Face Scan, set interests and hourly rate.', icon:'user',   color:'var(--c-primary)' },
  { n:'02', title:'Explore and Book',      desc:'Browse verified individuals and groups for social activities.',   icon:'search', color:'var(--c-accent)'  },
  { n:'03', title:'Escrow Payment',        desc:'Pay securely — funds locked until meeting is confirmed.',         icon:'shield', color:'var(--c-gold)'    },
  { n:'04', title:'OTP and Get Paid',      desc:'Verify meeting via OTP. Payment released instantly to wallet.',  icon:'zap',    color:'var(--c-success)' },
]

const SAFETY = [
  { icon:'camera', title:'Selfie Upload', desc:'Biometric selfie  for profile goes live.' },
  { icon:'shield', title:'Escrow Protection', desc:'100% payment locked safely until both parties confirm the meeting.'   },
  { icon:'check',  title:'OTP Confirmation',  desc:'In-person OTP system ensures the actual meeting happened before payout.' },
]

/* ──────────────────────────────────────────
   Hero Vector Illustration (single SVG)
   Replaces the old stacked photo cards
────────────────────────────────────────── */
function HeroIllustration() {
  return (
    <div style={{ position:'relative', width:'100%', maxWidth:480, margin:'0 auto', height:420 }}>

      {/* ── Large soft circle ── */}
      <div style={{
        position:'absolute',
        top:'50%', left:'50%',
        transform:'translate(-46%,-50%)',
        width:400, height:400, borderRadius:'50%',
        background:'linear-gradient(145deg, #C7D2FE 0%, #A5B4FC 50%, #818CF8 100%)',
        opacity:.75,
        zIndex:0,
      }} />

      {/* ── Person image — no border, natural cutout style ── */}
      <div style={{
        position:'absolute',
        bottom:0, left:'50%',
        transform:'translateX(-46%)',
        zIndex:2,
        width:390,
        height:390,
        overflow:'hidden',
        borderRadius: '50%',
        top: 15
        /* Clip only bottom — person fades into circle */
      }}>
        <img
          src="https://img.freepik.com/premium-photo/handsome-adult-blond-man-feeling-proud-carefree-confident-happy-smiling-positively-with-thumbs-up_1194-235869.jpg"
          alt="Person"
          style={{
            width:'100%',
            height:'100%',
            objectFit:'cover',
            objectPosition:'top center',
            display:'block',
          }}
        />
        {/* Soft fade at bottom to blend into bg */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:60,
          background:'linear-gradient(to top, var(--c-surface) 0%, transparent 100%)',
        }} />
      </div>

      {/* ── SVG dashed curved paths ── */}
      <svg
        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none' }}
        viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        {/* Path: top-left card to circle edge */}
        <path d="M 105 95 Q 155 120 195 155" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
        {/* Path: bottom-right card to circle edge */}
        <path d="M 355 320 Q 315 290 280 270" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
        {/* Dot anchors */}
        <circle cx="105" cy="95"  r="3" fill="#9CA3AF" opacity=".6" />
        <circle cx="355" cy="320" r="3" fill="#9CA3AF" opacity=".6" />
        <circle cx="388" cy="165" r="3" fill="#9CA3AF" opacity=".5" />
      </svg>

      {/* ── Floating card: TOP LEFT — "Verified 500+" ── */}
      <div style={{
        position:'absolute', top:55, left:8, zIndex:10,
        background:'#fff', borderRadius:50,
        padding:'10px 16px 10px 10px',
        boxShadow:'0 4px 24px rgba(0,0,0,0.11)',
        display:'flex', alignItems:'center', gap:10,
        animation:'floatA 3.2s ease-in-out infinite',
      }}>
        <div style={{
          width:38, height:38, borderRadius:'50%',
          background:'#DCFCE7',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          <Icon name="shield" size={17} color="var(--c-success)" />
        </div>
        <div>
          <p style={{ fontSize:11, color:'var(--c-muted)', lineHeight:1.2 }}>Verified</p>
          <p style={{ fontSize:14, fontWeight:800, color:'var(--c-dark)', lineHeight:1.2 }}>500+ People</p>
        </div>
      </div>

      {/* ── Floating icon badge: TOP RIGHT (blue square like reference) ── */}
      <div style={{
        position:'absolute', top:130, right:28, zIndex:10,
        width:46, height:46, borderRadius:14,
        background:'linear-gradient(135deg, var(--c-primary) 0%, var(--c-accent) 100%)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 6px 20px rgba(99,102,241,0.4)',
        animation:'floatB 3.8s ease-in-out infinite',
      }}>
        <Icon name="zap" size={20} color="#fff" />
      </div>

      {/* ── Floating icon badge: MID LEFT (dark circle like reference) ── */}
      <div style={{
        position:'absolute', top:225, left:22, zIndex:10,
        width:42, height:42, borderRadius:'50%',
        background:'#1E293B',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 6px 18px rgba(0,0,0,0.28)',
        animation:'floatA 4.2s ease-in-out infinite',
      }}>
        <Icon name="trending" size={18} color="#fff" />
      </div>

      {/* ── Floating card: BOTTOM RIGHT — "Escrow ₹12L+" ── */}
      <div style={{
        position:'absolute', bottom:42, right:10, zIndex:10,
        background:'#fff', borderRadius:50,
        padding:'10px 14px 10px 10px',
        boxShadow:'0 4px 24px rgba(0,0,0,0.11)',
        display:'flex', alignItems:'center', gap:10,
        animation:'floatB 3.5s ease-in-out infinite',
      }}>
        <div>
          <p style={{ fontSize:11, color:'var(--c-muted)', lineHeight:1.2 }}>Escrow Paid</p>
          <p style={{ fontSize:14, fontWeight:800, color:'var(--c-primary)', lineHeight:1.2 }}>₹12L+</p>
        </div>
        <div style={{
          width:38, height:38, borderRadius:'50%',
          background:'var(--c-primary-lt)',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          <Icon name="rupee" size={17} color="var(--c-primary)" />
        </div>
      </div>

      <style>{`
        @keyframes floatA {
          0%,100% { transform:translateY(0px) }
          50%      { transform:translateY(-9px) }
        }
        @keyframes floatB {
          0%,100% { transform:translateY(0px) }
          50%      { transform:translateY(-12px) }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────
   Use-Case Infinite Marquee Slider
   Pure CSS/rAF — no external deps needed
────────────────────────────────────────── */
function UseCaseSwiper() {
  const nav      = useNavigate()
  const trackRef = useRef(null)
  const timerRef = useRef(null)
  const posRef   = useRef(0)
  const pausedRef = useRef(false)

  const [useCases, setUseCases] = useState([])

  const palette = [
    { color: '#C84B31', bg: '#F2E8E5' },
    { color: '#2C5F8A', bg: '#E4EEF6' },
    { color: '#D4A017', bg: '#FDF6E3' },
    { color: '#7C3AED', bg: '#EDE9FE' },
    { color: '#2D7A4F', bg: '#D1FAE5' },
    { color: '#C84B31', bg: '#F2E8E5' },
    { color: '#2C5F8A', bg: '#E4EEF6' },
    { color: '#BE185D', bg: '#FCE7F3' },
  ]

  const fallbackIconName = (rawName) => {
    const name = String(rawName || '').toLowerCase()
    if (name.includes('coffee')) return 'coffee'
    if (name.includes('cricket')) return 'sport'
    if (name.includes('birthday')) return 'users'
    if (name.includes('movie') || name.includes('club') || name.includes('music')) return 'music'
    if (name.includes('travel')) return 'globe'
    if (name.includes('network')) return 'trending'
    if (name.includes('seminar') || name.includes('gym') || name.includes('gaming') || name.includes('startup')) return 'zap'
    if (name.includes('wedding')) return 'heart'
    if (name.includes('photo')) return 'camera'
    if (name.includes('yoga') || name.includes('wellness')) return 'check'
    return 'users'
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getInterestsApi()
        if (cancelled) return

        const data = Array.isArray(res?.data?.data) ? res.data.data : []
        const mapped = data
          .map((i) => ({
            id: i?.id,
            label: i?.name || '',
            icon_path: i?.icon_path || null,
          }))
          .filter((u) => u.label)

        // Keep it compact for the marquee.
        setUseCases(mapped.slice(0, 8))
      } catch (e) {
        if (!cancelled) setUseCases([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const SPEED = 0.55 // px per frame

    const animate = () => {
      if (!pausedRef.current) {
        posRef.current += SPEED
        const totalW = track.scrollWidth / 2
        if (posRef.current >= totalW) posRef.current = 0
        track.style.transform = `translateX(-${posRef.current}px)`
      }
      timerRef.current = requestAnimationFrame(animate)
    }

    timerRef.current = requestAnimationFrame(animate)

    const pause  = () => { pausedRef.current = true }
    const resume = () => { pausedRef.current = false }

    track.addEventListener('mouseenter', pause)
    track.addEventListener('mouseleave', resume)
    track.addEventListener('touchstart',  pause, { passive:true })
    track.addEventListener('touchend',    resume)

    return () => {
      cancelAnimationFrame(timerRef.current)
      track.removeEventListener('mouseenter', pause)
      track.removeEventListener('mouseleave', resume)
      track.removeEventListener('touchstart',  pause)
      track.removeEventListener('touchend',    resume)
    }
  }, [])

  // Theme + duplicate for seamless loop
  const themedItems = (useCases && useCases.length > 0 ? useCases : FALLBACK_USE_CASES).map((u, idx) => {
    const p = palette[idx % palette.length]
    return {
      ...u,
      color: p.color,
      bg: p.bg,
      icon: u.icon || fallbackIconName(u.label),
    }
  })

  const tiles = [...themedItems, ...themedItems]

  return (
    <div className='container' style={{ overflow:'hidden', paddingTop: '10px', width:'100%', cursor:'grab' }}>
      <div ref={trackRef} style={{ display:'flex', gap:16, width:'max-content', willChange:'transform' }}>
        {tiles.map((u, i) => (
          <div
            key={i}
            onClick={() => nav('/explore')}
            style={{
              background: u.bg,
              border: `1.5px solid ${u.color}28`,
              borderRadius: 22,
              padding: '26px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.22s ease, box-shadow 0.22s ease',
              minWidth: 158,
              userSelect: 'none',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-7px)'
              e.currentTarget.style.boxShadow = `0 14px 36px ${u.color}30`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
            }}
          >
            {/* Large icon container — 72px so users can clearly see it */}
            <div style={{
              width: 76, height: 76,
              borderRadius: 22,
              background: `${u.color}16`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              border: `1.5px solid ${u.color}28`,
            }}>
              {u.icon_path ? (
                <img
                  src={toDisplayUrl(u.icon_path)}
                  alt={u.label}
                  style={{ width: 42, height: 42, objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <Icon name={u.icon || fallbackIconName(u.label)} size={38} color={u.color} />
              )}
            </div>
            <p style={{ color: u.color, fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Featured Profiles — login-gated
────────────────────────────────────────── */
function ProfilesSection() {
  const { isLoggedIn, user } = useApp()
  const nav = useNavigate()

  const [topProfiles, setTopProfiles] = useState([])
  const [loadingTopProfiles, setLoadingTopProfiles] = useState(false)
  const [topProfilesError, setTopProfilesError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!isLoggedIn) return
      setLoadingTopProfiles(true)
      setTopProfilesError(null)

      try {
        const res = await exploreProfilesApi({
          page: 1,
          pageSize: 4,
          type: 'all',
          sortBy: 'rating',
          maxPrice: 1000000,
        })

        const list = res?.data?.data || []
        const normalized = Array.isArray(list)
          ? list.map((p) => ({
              ...p,
              photo: toDisplayUrl(p.photo),
              bio: typeof p.bio === 'string' ? p.bio : '',
              interests: Array.isArray(p.interests) ? p.interests : [],
            }))
          : []

        const filtered = user?.id
          ? normalized.filter((p) => String(p.id) !== String(user.id))
          : normalized

        if (!cancelled) setTopProfiles(filtered)
      } catch (err) {
        if (!cancelled) {
          setTopProfiles([])
          setTopProfilesError(err?.response?.data?.message || err?.message || 'Failed to load profiles')
        }
      } finally {
        if (!cancelled) setLoadingTopProfiles(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [isLoggedIn, user?.id])

  if (!isLoggedIn) {
    return (
      <section style={{ padding:'72px 24px', background:'var(--c-bg)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom:48 }}>
            <Badge variant="primary">Featured</Badge>
            <h2>Top Rated Profiles</h2>
            <p>Join Connectly to browse verified individuals and book real social experiences.</p>
          </div>

          {/* Blurred preview + overlay CTA */}
          <div style={{ position:'relative' }}>
            <div className="profiles-grid" style={{
              filter:'blur(7px)', pointerEvents:'none',
              userSelect:'none', opacity:0.5,
            }}>
              {INDIVIDUALS.slice(0,4).map(p => <ProfileCard key={p.id} profile={p} />)}
            </div>

            <div style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <div style={{
                background:'#fff',
                borderRadius:24,
                padding:'40px 48px',
                textAlign:'center',
                boxShadow:'0 20px 60px rgba(0,0,0,0.16)',
                maxWidth:420, width:'90%',
                border:'1px solid var(--c-border)',
              }}>
                <div style={{
                  width:68, height:68,
                  background:'var(--c-primary-lt)',
                  borderRadius:20,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 18px',
                }}>
                  <Icon name="users" size={32} color="var(--c-primary)" />
                </div>
                <h3 style={{
                  fontFamily:'var(--font-serif)', fontSize:24,
                  fontWeight:700, color:'var(--c-dark)', marginBottom:10,
                }}>
                  Unlock All Profiles
                </h3>
                <p style={{ fontSize:14, color:'var(--c-mid)', marginBottom:28, lineHeight:1.7 }}>
                  Create a free account to explore verified individuals, groups, and book real social experiences.
                </p>
                <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                  <Link to="/register"
                    className="btn btn-primary btn-lg"
                    style={{ textDecoration:'none' }}>
                    <Icon name="users" size={16} color="#fff" />
                    Create Account
                  </Link>
                  <Link to="/login"
                    className="btn btn-ghost btn-lg"
                    style={{ textDecoration:'none', color:'var(--c-mid)', borderColor:'var(--c-border)' }}>
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding:'72px 24px', background:'var(--c-bg)' }}>
      <div className="container">
        <div className="flex-between mb-8">
          <div>
            <Badge variant="primary">Featured</Badge>
            <h2 className="serif" style={{ fontSize:34, fontWeight:700, marginTop:8, color:'var(--c-dark)' }}>
              Top Rated Profiles
            </h2>
          </div>
          <Button onClick={() => nav('/explore')} variant="secondary" iconRight="arrowRight">View All</Button>
        </div>
        <div className="profiles-grid">
          {loadingTopProfiles ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 16,
                  border: '1.5px solid var(--c-border)',
                  padding: 16,
                  background: 'var(--c-card)',
                }}
              >
                Loading...
              </div>
            ))
          ) : topProfilesError ? (
            <div style={{ gridColumn: '1 / -1', color: 'var(--c-mid)' }}>{topProfilesError}</div>
          ) : topProfiles.length > 0 ? (
            topProfiles.map((p) => <ProfileCard key={p.id} profile={p} />)
          ) : (
            <div style={{ gridColumn: '1 / -1', color: 'var(--c-mid)' }}>No profiles found.</div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── Main Page ── */
export default function HomePage() {
  const nav = useNavigate()

  return (
    <div className="page-wrap">

      {/* HERO */}
      <section className="hero-section">
        <div style={{ position:'absolute', top:-120, right:-120, width:450, height:450, background:'var(--c-primary)', borderRadius:'50%', opacity:.05, pointerEvents:'none' }} />
        <div className="container">
          <div className="hero-grid">
            <div className="anim-fadeInUp">
              <div className="hero-eyebrow">
                <div className="hero-eyebrow-dot" />
                <span>Verified Social Marketplace</span>
              </div>
              <h1 className="hero-title">Book Real People for<br /><span>Real Experiences</span></h1>
              <p className="hero-sub">Connectly connects you with verified individuals and groups for social activities — coffee meetups, parties, sports, and more. Safe, structured, escrow-protected.</p>
              <div className="hero-actions">
                <Button onClick={() => nav('/explore')} size="lg" icon="search">Explore People</Button>
              </div>
            </div>

            {/* Single vector illustration */}
            <div className="hero-card-stack"
              style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — icons bumped to 40 px */}
      <section style={{ padding:'72px 24px', background:'var(--c-bg)' }}>
        <div className="container">
          <div className="section-header">
            <Badge variant="accent">How It Works</Badge>
            <h2>Book in 4 Simple Steps</h2>
            <p>Safe, verified, and escrow-protected every step of the way.</p>
          </div>
          <div className="how-grid">
            {HOW.map(s => (
              <Card key={s.n} className="how-card">
                <div style={{
                  width:80, height:80, borderRadius:22,
                  background: s.color + '18',
                  border: `1.5px solid ${s.color}30`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 18px',
                }}> 
                  <Icon name={s.icon} size={40} color={s.color} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES — Infinite autoplay marquee swiper */}
      <section style={{ padding:'64px 0 56px', background:'var(--c-surface)', overflow:'hidden' }}>
        <div className="container" style={{ marginBottom:40 }}>
          <div className="section-header" style={{ marginBottom:0 }}>
            <Badge variant="primary">Social Experiences</Badge>
            <h2>What Can You Book?</h2>
            <p>From coffee meetups to cricket matches — every social occasion covered.</p>
          </div>
        </div>
        <div style={{ paddingLeft:24 }}>
          <UseCaseSwiper />
        </div>
      </section>

      {/* FEATURED PROFILES — shows login/register gate if not logged in */}
      <ProfilesSection />

      {/* SAFETY */}
      <section style={{ padding:'72px 24px', background:'var(--c-surface)' }}>
        <div className="container-sm">
          <div className="section-header">
            <Badge variant="success">Trust and Safety</Badge>
            <h2>Your Safety is Our Priority</h2>
            <p>Every user is face-verified. Every payment is escrowed. Every meeting is OTP-confirmed. This is NOT a dating or adult platform.</p>
          </div>
          <div className="safety-grid">
            {SAFETY.map(f => (
              <Card key={f.title} className="safety-card">
                <div className="safety-icon" style={{ background:'#D1FAE520', border:'2px solid #2D7A4F30' }}>
                  <Icon name={f.icon} size={28} color="var(--c-success)" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
