export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const DEFAULT_ON_DAYS = ['Tuesday', 'Thursday', 'Saturday', 'Sunday']

export function buildDefaultDayAvail() {
  return Object.fromEntries(
    DAYS.map((d) => [d, { on: DEFAULT_ON_DAYS.includes(d), slot: 'Evening (6PM–10PM)' }])
  )
}

/** @param {string|null|undefined} raw */
export function parseAvailabilitySlots(raw) {
  if (!raw || typeof raw !== 'string') return null
  const t = raw.trim()
  if (!t.startsWith('{')) return null
  try {
    const j = JSON.parse(t)
    if (j && typeof j.days === 'object') return j.days
  } catch {
    /* ignore */
  }
  return null
}

/** Human-readable label for profile cards (handles JSON from registration). */
export function formatAvailabilityDisplay(raw) {
  if (raw == null || raw === '') return 'Flexible'
  const s = String(raw).trim()
  if (!s.startsWith('{')) return s
  const days = parseAvailabilitySlots(s)
  if (!days) return 'Scheduled'
  const on = Object.entries(days)
    .filter(([, v]) => v && v.on)
    .map(([d]) => d.slice(0, 3))
  return on.length ? on.join(', ') : 'Flexible'
}
