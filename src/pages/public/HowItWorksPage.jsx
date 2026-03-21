// src/pages/HowItWorksPage.jsx
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'

const PRIMARY   = 'var(--c-primary)'
const GOLD      = '#F59E0B'
const SUCCESS   = '#059669'
const DANGER    = '#DC2626'
const INFO      = '#3B82F6'
const PURPLE    = '#7C3AED'

/* ── tiny helpers ── */
function Section({ children, style }) {
  return (
    <div style={{ background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:20, padding:'28px 30px', marginBottom:24, ...style }}>
      {children}
    </div>
  )
}

function SectionTitle({ emoji, text, color = PRIMARY }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
      <div style={{ width:44, height:44, borderRadius:12, background:color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
        {emoji}
      </div>
      <h2 style={{ fontSize:20, fontWeight:800, color:'var(--c-dark)', margin:0 }}>{text}</h2>
    </div>
  )
}

function Step({ num, color, title, desc, tag }) {
  return (
    <div style={{ display:'flex', gap:16, marginBottom:20 }}>
      <div style={{ width:38, height:38, borderRadius:19, background:color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, flexShrink:0 }}>
        {num}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <p style={{ fontWeight:700, fontSize:15, color:'var(--c-dark)', margin:0 }}>{title}</p>
          {tag && <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20, background:color+'20', color }}>{tag}</span>}
        </div>
        <p style={{ fontSize:13, color:'var(--c-mid)', marginTop:5, lineHeight:1.7 }}>{desc}</p>
      </div>
    </div>
  )
}

function Arrow() {
  return <div style={{ textAlign:'center', fontSize:22, color:'var(--c-muted)', margin:'0 0 16px' }}>↓</div>
}

function RoleBadge({ label, color, bg }) {
  return (
    <span style={{ background: bg || color+'18', color, fontWeight:700, fontSize:12, padding:'4px 14px', borderRadius:20 }}>
      {label}
    </span>
  )
}

function NavBtn({ label, path, color = PRIMARY, nav }) {
  return (
    <button onClick={() => nav(path)} style={{
      background: color, color:'#fff', border:'none', borderRadius:12,
      padding:'13px 28px', fontSize:14, fontWeight:700, cursor:'pointer',
      fontFamily:'var(--font-sans)', transition:'opacity .15s',
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {label}
    </button>
  )
}

export default function HowItWorksPage() {
  const { isLoggedIn } = useApp()
  const nav = useNavigate()

  return (
    <div style={{ background:'var(--c-bg)', minHeight:'100vh' }}>
      <div style={{ maxWidth:780, margin:'0 auto', padding:'40px 20px 80px' }}>

        {/* ═══ HERO ═══ */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:52, marginBottom:12 }}>📖</div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(28px,5vw,42px)', fontWeight:800, color:'var(--c-dark)', margin:'0 0 12px' }}>
            How Connectly Works
          </h1>
          <p style={{ fontSize:16, color:'var(--c-mid)', maxWidth:520, margin:'0 auto', lineHeight:1.7 }}>
            Step-by-step guide — booking karna, request accept karna, aur cancel karna — sab kuch yahan hai.
          </p>
        </div>

        {/* ═══ SECTION 1 — WHO IS WHO ═══ */}
        <Section>
          <SectionTitle emoji="👥" text="App mein kaun kaun hota hai?" color={INFO} />
          <p style={{ fontSize:14, color:'var(--c-mid)', marginBottom:20, lineHeight:1.7 }}>
            Connectly mein koi alag "client" ya "provider" nahi hai. <strong>Har user dono kaam kar sakta hai</strong> — kisi ko book bhi kar sakta hai, aur khud bhi book ho sakta hai.
          </p>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {[
              { emoji:'🙋', label:'Booker (User A)',   desc:'Jo kisi aur ko book karta hai — explore karke, "Book Now" dabaata hai, paisa deta hai.', color:INFO },
              { emoji:'🤝', label:'Provider (User B)', desc:'Jisko book kiya gaya — request aati hai, accept ya decline karta hai, meeting par OTP deta hai.', color:SUCCESS },
            ].map(r => (
              <div key={r.label} style={{ flex:1, minWidth:240, background: r.color+'10', border:`1.5px solid ${r.color}40`, borderRadius:14, padding:'18px 20px' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{r.emoji}</div>
                <p style={{ fontWeight:700, fontSize:15, color:'var(--c-dark)', marginBottom:6 }}>{r.label}</p>
                <p style={{ fontSize:13, color:'var(--c-mid)', lineHeight:1.65 }}>{r.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background:'#FEF3C7', borderRadius:12, padding:'12px 16px', marginTop:16, display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ fontSize:18 }}>💡</span>
            <p style={{ fontSize:13, color:'#92400E', lineHeight:1.6, margin:0 }}>
              <strong>Same user A aur B dono ho sakta hai</strong> — yani tum kisi ko book kar sakte ho, aur koi tumhe bhi book kar sakta hai. Dono flows ek hi account se manage hote hain.
            </p>
          </div>
        </Section>

        {/* ═══ SECTION 2 — BOOKING BHEJO ═══ */}
        <Section>
          <SectionTitle emoji="📤" text="Kisi ko Book Karna (Request Bhejna)" color={INFO} />
          <p style={{ fontSize:13, color:'var(--c-mid)', marginBottom:20, lineHeight:1.6 }}>
            Tum kisi aur ko hire karna chahte ho — coffee meetup, birthday party, travel companion, etc.
          </p>

          <Step num="1" color={INFO} title='Explore page par jao' tag="Explore"
            desc='Header mein "Explore" click karo. Wahan sab verified users ke profile cards dikhenge.' />
          <Arrow />
          <Step num="2" color={INFO} title='Kisi ka profile select karo'
            desc='Profile card par click karo. Photo, bio, interests, rate sab dekho.' />
          <Arrow />
          <Step num="3" color={INFO} title='"Book Now" button dabao' tag="Book Now"
            desc='Profile card ke neeche "Book Now" button hoga. Isko dabao.' />
          <Arrow />
          <Step num="4" color={INFO} title='Form bharo'
            desc='Date, Time, Location, Duration (ghante), aur Purpose (kisliye book kar rahe ho) — sab fill karo. Total amount auto-calculate hoga.' />
          <Arrow />
          <Step num="5" color={INFO} title='Payment karo — Escrow mein jaata hai' tag="Escrow"
            desc='Paisa tumare wallet se katta hai aur safe escrow mein lock ho jaata hai. Directly kisi ko nahi milta abhi.' />
          <Arrow />
          <Step num="6" color={GOLD} title='Wait karo — Doosra user accept kare' tag="Pending"
            desc='Ab tumhari request doosre user ke paas gayi. Status = "Pending". Tum Bookings → "Sent by Me" mein dekh sakte ho.' />

          <div style={{ background:'#EFF6FF', borderRadius:12, padding:'14px 18px', marginTop:8 }}>
            <p style={{ fontSize:13, color:INFO, fontWeight:600, marginBottom:4 }}>📍 Request track kahan karo?</p>
            <p style={{ fontSize:13, color:'#3B82F6', lineHeight:1.65 }}>
              <strong>Bookings</strong> → <strong>"My Booking"</strong> tab → <strong>"Sent by Me"</strong> subtab<br/>
              Yahan tumhare sabhi bheje gaye requests dikhenge with status: Pending / Confirmed / Completed.
            </p>
          </div>
        </Section>

        {/* ═══ SECTION 3 — REQUEST AAYE TO ACCEPT KARO ═══ */}
        <Section>
          <SectionTitle emoji="📥" text="Koi Tumhe Book Kare — Accept / Decline Karna" color={SUCCESS} />
          <p style={{ fontSize:13, color:'var(--c-mid)', marginBottom:20, lineHeight:1.6 }}>
            Kisi ne tumhara profile dekha aur tumhe book kiya. Ab tumhe decide karna hai — accept ya decline.
          </p>

          <Step num="1" color={SUCCESS} title='Notification aayega' tag="Bell 🔔"
            desc='Header mein bell icon par ek red badge dikhega. Notification mein likha hoga "New booking request from [Name]".' />
          <Arrow />
          <Step num="2" color={SUCCESS} title='Bookings page par jao' tag="Bookings"
            desc='Header mein "Bookings" click karo. Agar pending request hai, to ek Yellow Alert banner seedha top par dikhega.' />
          <Arrow />
          <Step num="3" color={SUCCESS} title='"Incoming Requests" tab click karo' tag="Incoming Requests"
            desc='"My Booking" ke andar teen subtabs hain: Sent by Me | Incoming Requests | History. "Incoming Requests" click karo.' />
          <Arrow />
          <Step num="4" color={SUCCESS} title='Request card dekho — Accept ya Decline karo'
            desc='Yahan tumhe booking details dikhegi — kaun hai, kab, kahan, kitna paisa. Do green/red buttons honge:' />

          <div style={{ display:'flex', gap:12, flexWrap:'wrap', margin:'0 0 20px 54px' }}>
            <div style={{ background:'#D1FAE5', border:'1.5px solid #059669', borderRadius:12, padding:'14px 18px', flex:1, minWidth:200 }}>
              <p style={{ fontWeight:800, fontSize:15, color:'#065F46', marginBottom:6 }}>✅ Accept karo</p>
              <p style={{ fontSize:13, color:'#047857', lineHeight:1.6 }}>
                Booking confirm ho jaati hai.<br/>
                Paisa escrow mein hi rehta hai jab tak meeting complete na ho.<br/>
                Status → <strong>Confirmed</strong>
              </p>
            </div>
            <div style={{ background:'#FEE2E2', border:'1.5px solid #DC2626', borderRadius:12, padding:'14px 18px', flex:1, minWidth:200 }}>
              <p style={{ fontWeight:800, fontSize:15, color:'#991B1B', marginBottom:6 }}>❌ Decline karo</p>
              <p style={{ fontSize:13, color:'#B91C1C', lineHeight:1.6 }}>
                Booking cancel ho jaati hai.<br/>
                Booker ko <strong>full refund</strong> turant wapas.<br/>
                Status → <strong>Cancelled</strong>
              </p>
            </div>
          </div>

          <div style={{ background:'#F0FDF4', borderRadius:12, padding:'14px 18px' }}>
            <p style={{ fontSize:13, color:SUCCESS, fontWeight:600, marginBottom:4 }}>📍 Incoming Requests kahan dikhti hain?</p>
            <p style={{ fontSize:13, color:'#047857', lineHeight:1.65 }}>
              <strong>Bookings</strong> → <strong>"My Booking"</strong> tab → <strong>"Incoming Requests"</strong> subtab<br/>
              Agar koi pending request hai, page khulte hi automatically isi tab par aayega.
            </p>
          </div>
        </Section>

        {/* ═══ SECTION 4 — MEETING COMPLETE KARO ═══ */}
        <Section>
          <SectionTitle emoji="🤝" text="Meeting Complete Karna — OTP Flow" color={PURPLE} />
          <p style={{ fontSize:13, color:'var(--c-mid)', marginBottom:20, lineHeight:1.6 }}>
            Meeting ke din, payment release hoti hai OTP ke through. Dono users ke paas alag roles hain.
          </p>

          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:8 }}>
            <div style={{ flex:1, minWidth:240, background:'#EFF6FF', borderRadius:14, padding:'18px 20px' }}>
              <RoleBadge label="👤 Provider (Jisko Book kiya)" color={INFO} />
              <div style={{ marginTop:14 }}>
                <Step num="1" color={INFO} title='Meeting time par app kholo'
                  desc='"Bookings" → "Incoming Requests" → confirmed booking card dekho.' />
                <Step num="2" color={INFO} title='"Generate OTP" dabao'
                  desc='App ek 4-6 digit OTP generate karega. Ye OTP booker ko batao verbally.' />
              </div>
            </div>
            <div style={{ flex:1, minWidth:240, background:'#F0FDF4', borderRadius:14, padding:'18px 20px' }}>
              <RoleBadge label="👤 Booker (Jisne Book kiya)" color={SUCCESS} />
              <div style={{ marginTop:14 }}>
                <Step num="1" color={SUCCESS} title='Meeting time par app kholo'
                  desc='"Bookings" → "Sent by Me" → confirmed booking card dekho.' />
                <Step num="2" color={SUCCESS} title='"Enter OTP" dabao'
                  desc='Provider ne jo OTP bataya, wo enter karo. Verify hone par payment release hogi.' />
              </div>
            </div>
          </div>

          <div style={{ background:'#EDE9FE', borderRadius:12, padding:'14px 18px', marginTop:8 }}>
            <p style={{ fontSize:13, color:PURPLE, fontWeight:700, marginBottom:4 }}>💸 Payment Release kaise hoti hai?</p>
            <p style={{ fontSize:13, color:'#6D28D9', lineHeight:1.65 }}>
              OTP verify hone ke baad escrow se payment release hoti hai.<br/>
              <strong>Provider ko milta hai: 70%</strong> (baaki 30% platform commission)<br/>
              Example: ₹10,000 booking → Provider ko ₹7,000 wallet mein.
            </p>
          </div>
        </Section>

        {/* ═══ SECTION 5 — CANCEL FLOW ═══ */}
        <Section>
          <SectionTitle emoji="❌" text="Booking Cancel Karna" color={DANGER} />

          <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:20 }}>
            <div style={{ flex:1, minWidth:220, background:'#FEF3C7', borderRadius:14, padding:'16px 18px', border:'1.5px solid #F59E0B' }}>
              <p style={{ fontWeight:800, fontSize:14, color:'#92400E', marginBottom:8 }}>⏰ 1 ghante se PEHLE cancel</p>
              <p style={{ fontSize:13, color:'#B45309', lineHeight:1.6 }}>
                Cancellation fee: <strong>5%</strong><br/>
                Refund: <strong>95%</strong> wapas milega
              </p>
            </div>
            <div style={{ flex:1, minWidth:220, background:'#FEE2E2', borderRadius:14, padding:'16px 18px', border:'1.5px solid #DC2626' }}>
              <p style={{ fontWeight:800, fontSize:14, color:'#991B1B', marginBottom:8 }}>⏰ 1 ghante ke ANDAR cancel</p>
              <p style={{ fontSize:13, color:'#B91C1C', lineHeight:1.6 }}>
                Cancellation fee: <strong>10%</strong><br/>
                Refund: <strong>90%</strong> wapas milega
              </p>
            </div>
          </div>

          <Step num="1" color={DANGER} title='"Bookings" → "Sent by Me" tab par jao'
            desc='Jo booking cancel karni hai uska card dhundho.' />
          <Arrow />
          <Step num="2" color={DANGER} title='"Cancel" button dabao'
            desc='Booking card mein neeche "Cancel" button hoga (sirf Pending status bookings par).' />
          <Arrow />
          <Step num="3" color={DANGER} title='Fee breakdown dekho aur confirm karo'
            desc='Ek popup aayega jisme pura breakdown hoga — total paid, cancellation fee, aur refund amount. "Cancel & Refund" dabao.' />
          <Arrow />
          <Step num="4" color={DANGER} title='Refund wallet mein aata hai'
            desc='Cancelled booking "History" tab mein dikhegi. Refund amount tumare Wallet mein credit ho jaayega.' />

          <div style={{ background:'#FEF3C7', borderRadius:12, padding:'14px 18px', marginTop:8 }}>
            <p style={{ fontSize:13, color:'#92400E', lineHeight:1.65 }}>
              <strong>📍 Cancelled booking kahan dikhegi?</strong><br/>
              Bookings → "My Booking" → <strong>"History"</strong> subtab → "Cancelled" section.
            </p>
          </div>
        </Section>

        {/* ═══ SECTION 6 — QUICK REFERENCE MAP ═══ */}
        <Section style={{ background:'var(--c-dark)', border:'none' }}>
          <SectionTitle emoji="🗺️" text="Quick Reference — Kya kahan milega?" color="#fff" />

          {[
            { q:'Kisi ko book karna hai',                      a:'Explore → Profile Card → Book Now',                         icon:'🔍' },
            { q:'Meri bheji request kahan hai',                a:'Bookings → My Booking → Sent by Me',                        icon:'📤' },
            { q:'Mere paas koi request aayi hai',              a:'Bookings → My Booking → Incoming Requests',                 icon:'📥' },
            { q:'Request accept ya decline karna hai',         a:'Bookings → My Booking → Incoming Requests → Accept/Decline', icon:'✅' },
            { q:'Meeting OTP generate karna hai (Provider)',   a:'Bookings → Incoming Requests → Confirmed booking → Generate OTP', icon:'🔐' },
            { q:'Meeting OTP enter karna hai (Booker)',        a:'Bookings → Sent by Me → Confirmed booking → Enter OTP',     icon:'🔑' },
            { q:'Booking cancel karni hai',                    a:'Bookings → Sent by Me → Cancel button',                     icon:'❌' },
            { q:'Cancelled booking kahan dikhti hai',          a:'Bookings → My Booking → History → Cancelled section',       icon:'📋' },
            { q:'Paisa wallet mein kab aayega',                a:'OTP verify hone ke baad automatically credit hoga',          icon:'💸' },
          ].map((row, i) => (
            <div key={i} style={{
              display:'flex', gap:14, alignItems:'flex-start',
              padding:'12px 0',
              borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <span style={{ fontSize:20, flexShrink:0, marginTop:2 }}>{row.icon}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:4 }}>{row.q}</p>
                <p style={{ fontSize:14, fontWeight:700, color:'#fff' }}>→ {row.a}</p>
              </div>
            </div>
          ))}
        </Section>

        {/* ═══ CTA BUTTONS ═══ */}
        {isLoggedIn && (
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
            <NavBtn label="🔍 Explore Karein" path="/explore" color={INFO}    nav={nav} />
            <NavBtn label="📥 Bookings Dekho" path="/bookings" color={SUCCESS} nav={nav} />
          </div>
        )}
        {!isLoggedIn && (
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
            <NavBtn label="Register Karo" path="/register" color={SUCCESS} nav={nav} />
            <NavBtn label="Login Karo"    path="/login"    color={INFO}    nav={nav} />
          </div>
        )}

      </div>
    </div>
  )
}
