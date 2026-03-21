// src/context/AppContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { MOCK_USER, NOTIFICATIONS, BOOKINGS_MADE, BOOKINGS_RECEIVED } from '../data/mockData'
import { logoutApi } from '../api/auth.js'
import { mapAuthUserToAppUser } from '../utils/mapAuthUser.js'
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearAuthSession, persistAuthSession } from '../utils/authSession.js'
import { getOptionalPushDevicePayload } from '../utils/notificationDevice.js'
import { addWalletBalanceApi, getWalletSummaryApi } from '../api/wallet.js'
import {
  createBookingApi,
  listBookingsApi,
  acceptBookingApi,
  declineBookingApi,
  cancelBookingApi,
  completeBookingApi,
} from '../api/booking.js'
import { listNotificationsApi, markNotificationsReadApi } from '../api/notification.js'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const getInitialSession = () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      const raw = localStorage.getItem(AUTH_USER_KEY)
      if (!token || !raw) return { user: null, isLoggedIn: false }
      const parsed = JSON.parse(raw)
      return { user: { ...MOCK_USER, ...parsed }, isLoggedIn: true }
    } catch {
      clearAuthSession()
      return { user: null, isLoggedIn: false }
    }
  }

  const initial = getInitialSession()
  const [user, setUser] = useState(initial.user)
  const [isLoggedIn, setIsLoggedIn] = useState(initial.isLoggedIn)
  const [notifications, setNotifications] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  const login = (apiData = {}, extra = {}) => {
    const { jwt_token: jwtToken, ...rest } = apiData
    const merged = {
      ...MOCK_USER,
      ...mapAuthUserToAppUser(rest, MOCK_USER),
      ...extra,
    }
    setUser(merged)
    setIsLoggedIn(true)
    persistAuthSession({ token: jwtToken, user: merged })
  }

  const logout = async () => {
    const devicePayload = getOptionalPushDevicePayload()
    try {
      if (localStorage.getItem(AUTH_TOKEN_KEY)) {
        await logoutApi(devicePayload)
      }
    } catch {
      // still clear client session
    } finally {
      setIsLoggedIn(false)
      setUser(null)
      setNotifications([])
      setMyBookings([])
      setIncomingRequests([])
      clearAuthSession()
    }
  }

  const addWalletFunds = async (amt) => {
    const n = Number(amt)
    setUser((p) => (p ? { ...p, wallet: p.wallet + n } : p))
    const res = await addWalletBalanceApi(amt)
    const d = res?.data?.data
    if (d) setUser((p) => (p ? { ...p, wallet: d.wallet, escrow: d.escrow, totalEarned: d.totalEarned } : p))
    return d
  }

  const refreshWallet = useCallback(async () => {
    if (!isLoggedIn || !user?.id) return
    try {
      const res = await getWalletSummaryApi()
      const d = res?.data?.data
      if (d) setUser((p) => (p ? { ...p, wallet: d.wallet, escrow: d.escrow, totalEarned: d.totalEarned } : p))
    } catch {}
  }, [isLoggedIn, user?.id])

  const refreshBookings = useCallback(async () => {
    if (!isLoggedIn || !user?.id) return
    setBookingsLoading(true)
    try {
      const res = await listBookingsApi()
      const d = res?.data?.data
      if (d) {
        setMyBookings(d.myBookings || [])
        setIncomingRequests(d.incomingRequests || [])
      }
    } catch {
      setMyBookings([])
      setIncomingRequests([])
    } finally {
      setBookingsLoading(false)
    }
  }, [isLoggedIn, user?.id])

  const refreshNotifications = useCallback(async () => {
    if (!isLoggedIn || !user?.id) return
    setNotificationsLoading(true)
    try {
      const res = await listNotificationsApi({ limit: 20 })
      const list = res?.data?.data || []
      const unread = res?.data?.unreadCount ?? 0
      setNotifications(list.map((n) => ({ ...n, id: n.id || n.createdAt, read: n.read })))
    } catch {
      setNotifications([])
    } finally {
      setNotificationsLoading(false)
    }
  }, [isLoggedIn, user?.id])

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await getWalletSummaryApi()
        if (cancelled) return
        const d = res?.data?.data
        if (!d) return
        setUser((p) => (p ? { ...p, wallet: d.wallet, escrow: d.escrow, totalEarned: d.totalEarned } : p))
      } catch {}
    })()
    return () => { cancelled = true }
  }, [isLoggedIn, user?.id])

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return
    refreshBookings()
  }, [isLoggedIn, user?.id, refreshBookings])

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return
    refreshNotifications()
  }, [isLoggedIn, user?.id, refreshNotifications])

  const getCancelRefund = (booking) => {
    try {
      const startStr = (booking.timeStart || booking.time || '12:00').toString().split('–')[0].trim()
      const dt = new Date(`${booking.date} ${startStr}`)
      const diffHours = (dt - new Date()) / 36e5
      const feePct = diffHours > 1 ? 0.05 : 0.10
      return { refund: Math.round(booking.amount * (1 - feePct)), feePct }
    } catch {
      return { refund: Math.round(booking.amount * 0.90), feePct: 0.10 }
    }
  }

  const applyWalletFromResponse = (res) => {
    const w = res?.data?.wallet
    if (w) setUser((p) => (p ? { ...p, wallet: w.wallet, escrow: w.escrow, totalEarned: w.totalEarned } : p))
  }

  const bookPerson = async (profile, formData) => {
    const total = profile.price * Number(formData.duration)
    const payload = {
      provider_id: profile.id,
      booking_date: formData.date,
      time_start: formData.time,
      time_end: formData.endTime,
      amount: total,
      duration_hours: Number(formData.duration),
      location: formData.location || '',
      purpose: formData.purpose || 'Social meetup',
    }
    const res = await createBookingApi(payload)
    if (res?.data?.success && res?.data?.data) {
      const newBooking = res.data.data
      setMyBookings((p) => [newBooking, ...p])
      setIncomingRequests((p) => [{ ...newBooking, isMine: false }, ...p])
      applyWalletFromResponse(res)
      refreshNotifications()
      return newBooking.id
    }
    throw new Error(res?.data?.message || 'Failed to create booking')
  }

  const acceptRequest = async (bookingId) => {
    const res = await acceptBookingApi(bookingId)
    if (res?.data?.success && res?.data?.data) {
      const updated = res.data.data
      setIncomingRequests((p) => p.map((b) => (b.id === bookingId ? updated : b)))
      setMyBookings((p) => p.map((b) => (b.id === bookingId ? updated : b)))
      refreshNotifications()
      return
    }
    throw new Error(res?.data?.message || 'Failed to accept')
  }

  const declineRequest = async (bookingId) => {
    const res = await declineBookingApi(bookingId)
    if (res?.data?.success && res?.data?.data) {
      const updated = res.data.data
      setIncomingRequests((p) => p.map((b) => (b.id === bookingId ? updated : b)))
      setMyBookings((p) => p.map((b) => (b.id === bookingId ? updated : b)))
      // Wallet refund goes to booker, not current user (provider) - no wallet update needed
      refreshNotifications()
      return
    }
    throw new Error(res?.data?.message || 'Failed to decline')
  }

  const completeBooking = async (bookingId) => {
    const res = await completeBookingApi(bookingId)
    if (res?.data?.success && res?.data?.data) {
      const updated = res.data.data
      setMyBookings((p) => p.map((b) => (b.id === bookingId ? updated : b)))
      setIncomingRequests((p) => p.map((b) => (b.id === bookingId ? updated : b)))
      applyWalletFromResponse(res)
      refreshNotifications()
      refreshWallet()
      return
    }
    throw new Error(res?.data?.message || 'Failed to complete')
  }

  const cancelBooking = async (bookingId) => {
    const res = await cancelBookingApi(bookingId)
    if (res?.data?.success && res?.data?.data) {
      const updated = res.data.data
      setMyBookings((p) => p.map((b) => (b.id === bookingId ? updated : b)))
      setIncomingRequests((p) => p.map((b) => (b.id === bookingId ? updated : b)))
      applyWalletFromResponse(res)
      refreshNotifications()
      return
    }
    throw new Error(res?.data?.message || 'Failed to cancel')
  }

  const addNotification = (text, type = 'success') => {
    setNotifications((p) => [{ id: Date.now(), text, time: 'Just now', type, read: false }, ...p].slice(0, 20))
  }

  const markNotificationsRead = async () => {
    try {
      await markNotificationsReadApi()
      setNotifications((p) => p.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  return (
    <Ctx.Provider value={{
      user, setUser, isLoggedIn, setIsLoggedIn, login, logout,
      notifications, addNotification, markNotificationsRead,
      myBookings, incomingRequests, bookingsLoading,
      bookPerson, acceptRequest, declineRequest, completeBooking, cancelBooking,
      addWalletFunds, getCancelRefund,
      refreshBookings, refreshWallet, refreshNotifications,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
