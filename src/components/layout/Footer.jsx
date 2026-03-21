// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom'
import Icon from '../../assets/icons/Icons.jsx'
import { useApp } from '../../context/AppContext.jsx'

export default function Footer() {
  const { isLoggedIn } = useApp()

  const COLS = [
    {
      title: "Platform",
      links: [
        ...(isLoggedIn ? [
          { label: "Explore People", path: "/explore" },
        ] : [
          { label: "Sign In", path: "/login" },
          { label: "Register", path: "/register" },
        ]),
        { label: "How It Works", path: "/how-it-works" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Connectly", path: "/about" },
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Terms of Service", path: "/terms" },
        { label: "Contact Us", path: "/contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Raise a Ticket", path: "/raise-ticket" },
        { label: "Contact us", path: "/contact" },
      ],
    },
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div className="footer-logo-icon"><Icon name="users" size={17} color="#fff"/></div>
              <span className="footer-logo-text serif">Connectly</span>
            </div>
            <p className="footer-desc">A verified social booking marketplace for real social experiences. Coffee meets, parties, sports — all safe, structured & escrow-protected.</p>
            {/* <p className="footer-desc" style={{marginTop:10,color:'rgba(255,255,255,.22)'}}>🚫 Not a dating app &nbsp;|&nbsp; 🚫 Not an adult service platform</p> */}
          </div>
          {COLS.map(col=>(
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              {col.links.map(l=>(
                <Link key={l.label} to={l.path} className="footer-link">{l.label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Connectly. All rights reserved.</p>
          <p>Safe · Verified · Trusted · Escrow-Protected</p>
        </div>
      </div>
    </footer>
  )
}
