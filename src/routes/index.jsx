// src/routes/index.jsx — FRONTEND ONLY (no admin routes)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'

import LoginPage    from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'

import HomePage       from '../pages/public/HomePage.jsx'
import ExplorePage    from '../pages/public/ExplorePage.jsx'
import HowItWorksDynamicPage from '../pages/public/HowItWorksDynamicPage.jsx'
import AboutPage      from '../pages/public/AboutPage.jsx'
import PrivacyPage    from '../pages/public/PrivacyPage.jsx'
import TermsPage      from '../pages/public/TermsPage.jsx'
import ContactPage    from '../pages/public/ContactPage.jsx'
import RaiseTicketPage from '../pages/public/RaiseTicketPage.jsx'

import BookingsPage from '../pages/dashboard/BookingsPage.jsx'
import WalletPage   from '../pages/dashboard/WalletPage.jsx'
import ProfilePage  from '../pages/dashboard/ProfilePage.jsx'

function Protected({ children }) {
  const { isLoggedIn } = useApp()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function Layout({ children, showFooter = false }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  )
}

export default function AppRoutes() {
  const { isLoggedIn } = useApp()

  // If app is served from a sub-path, keep routing correct.
  // Otherwise (domain root), use `/`.
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const basename = pathname.startsWith('/AC/react/dostnow/') ? '/AC/react/dostnow/' : '/'

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Auth */}
        <Route path="/login"    element={isLoggedIn ? <Navigate to="/" replace /> : <Layout><LoginPage /></Layout>} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <Layout><RegisterPage /></Layout>} />

        {/* Public — Home accessible to all; Explore requires login */}
        <Route path="/"        element={<Layout><HomePage /></Layout>} />
        <Route path="/explore" element={isLoggedIn ? <Layout><ExplorePage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/how-it-works"element={<Layout><HowItWorksDynamicPage /></Layout>} />
        <Route path="/about"      element={<Layout><AboutPage /></Layout>} />
        <Route path="/privacy"    element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/terms"      element={<Layout><TermsPage /></Layout>} />
        <Route path="/contact"    element={<Layout><ContactPage /></Layout>} />
        <Route path="/raise-ticket" element={<Layout><RaiseTicketPage /></Layout>} />

        {/* Protected Dashboard */}
        <Route path="/bookings" element={<Protected><Layout><BookingsPage /></Layout></Protected>} />
        <Route path="/wallet"   element={<Protected><Layout><WalletPage /></Layout></Protected>} />
        <Route path="/profile"  element={<Protected><Layout><ProfilePage /></Layout></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
