// src/pages/ExplorePage.jsx
import { useState, useRef, useEffect } from 'react'
import Icon from '../../assets/icons/Icons.jsx'
import { EmptyState } from '../../components/ui/UI.jsx'
import ProfileCard from '../../components/shared/ProfileCard.jsx'
import { getCitiesApi, getInterestsApi } from '../../api/global.js'
import { exploreProfilesApi } from '../../api/explore.js'
import { BASE_IMAGE_URL } from '../../utils/config.js'
import { handleApiError } from '../../utils/handleApiError.js'
import { useApp } from '../../context/AppContext.jsx'

function toDisplayUrl(path) {
  if (!path) return ''
  const p = String(path).trim()
  if (!p) return ''
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p
  return `${BASE_IMAGE_URL.replace(/\/+$/, '')}/${p.replace(/^\/+/, '')}`
}

function ShimmerProfiles({ count = 6 }) {
  return (
    <div className="profiles-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            borderRadius: 16,
            background: 'var(--c-card)',
            border: '1.5px solid var(--c-border)',
            padding: 16,
          }}
        >
          <div
            style={{
              height: 120,
              borderRadius: 12,
              background:
                'linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 35%, #E5E7EB 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.15s ease-in-out infinite',
              marginBottom: 14,
            }}
          />
          <div
            style={{
              height: 14,
              borderRadius: 999,
              background:
                'linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 35%, #E5E7EB 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.15s ease-in-out infinite',
              marginBottom: 10,
              width: '70%',
            }}
          />
          <div
            style={{
              height: 12,
              borderRadius: 999,
              background:
                'linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 35%, #E5E7EB 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.15s ease-in-out infinite',
              marginBottom: 10,
              width: '85%',
            }}
          />
          <div
            style={{
              height: 34,
              borderRadius: 12,
              background:
                'linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 35%, #E5E7EB 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.15s ease-in-out infinite',
            }}
          />
        </div>
      ))}
    </div>
  )
}

/* ── Custom Multi-Select Dropdown ── */
function MultiSelect({ label, options, selected, onChange, placeholder = 'All' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val))
    else onChange([...selected, val])
  }

  const displayLabel = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--c-muted)', letterSpacing:.8, textTransform:'uppercase', marginBottom:6 }}>{label}</label>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 14px', borderRadius:10,
          border:`1.5px solid ${open ? 'var(--c-primary)' : selected.length > 0 ? 'var(--c-primary)' : 'var(--c-border)'}`,
          background: selected.length > 0 ? 'var(--c-primary-lt)' : 'var(--c-bg)',
          color: selected.length > 0 ? 'var(--c-primary)' : 'var(--c-mid)',
          fontFamily:'var(--font-sans)', fontSize:14, fontWeight: selected.length > 0 ? 600 : 400,
          cursor:'pointer', outline:'none', transition:'all .15s',
        }}
      >
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayLabel}</span>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0, marginLeft:8 }}>
          {selected.length > 0 && (
            <span
              onClick={e => { e.stopPropagation(); onChange([]) }}
              style={{
                width:18, height:18, borderRadius:9, background:'var(--c-primary)',
                color:'#fff', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer',
              }}
            >×</span>
          )}
          <span style={{ fontSize:11, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform .2s', display:'inline-block', color:'var(--c-muted)' }}>▾</span>
        </div>
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:999,
          background:'#fff', border:'1.5px solid var(--c-border)', borderRadius:12,
          boxShadow:'0 8px 24px rgba(0,0,0,0.12)', overflow:'hidden',
          maxHeight:260, overflowY:'auto',
        }}>
          {/* Select All */}
          <div
            onClick={() => onChange(selected.length === options.length ? [] : [...options])}
            style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
              cursor:'pointer', borderBottom:'1px solid var(--c-border)',
              background: selected.length === options.length ? 'var(--c-primary-lt)' : '#fff',
              transition:'background .1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = selected.length === options.length ? 'var(--c-primary-lt)' : '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = selected.length === options.length ? 'var(--c-primary-lt)' : '#fff'}
          >
            <div style={{
              width:18, height:18, borderRadius:5, flexShrink:0,
              border:`2px solid ${selected.length === options.length ? 'var(--c-primary)' : 'var(--c-border)'}`,
              background: selected.length === options.length ? 'var(--c-primary)' : '#fff',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {selected.length === options.length && <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>✓</span>}
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--c-dark)' }}>Select All</span>
          </div>

          {options.map(opt => {
            const checked = selected.includes(opt)
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  cursor:'pointer', background: checked ? 'var(--c-primary-lt)' : '#fff',
                  transition:'background .1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = checked ? 'var(--c-primary-lt)' : '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = checked ? 'var(--c-primary-lt)' : '#fff'}
              >
                <div style={{
                  width:18, height:18, borderRadius:5, flexShrink:0,
                  border:`2px solid ${checked ? 'var(--c-primary)' : 'var(--c-border)'}`,
                  background: checked ? 'var(--c-primary)' : '#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all .15s',
                }}>
                  {checked && <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>✓</span>}
                </div>
                <span style={{ fontSize:13, color:'var(--c-dark)', fontWeight: checked ? 600 : 400 }}>{opt}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ExplorePage() {
  const { user } = useApp()
  const [search,    setSearch]    = useState('')
  const [type,      setType]      = useState('all')
  const [interests, setInterests] = useState([])
  const [maxPrice,  setMaxPrice]  = useState(10000)
  const [sortBy,    setSortBy]    = useState('rating')
  const [ageMin,    setAgeMin]    = useState('')
  const [ageMax,    setAgeMax]    = useState('')
  const [city,      setCity]      = useState('')
  const [location,  setLocation]  = useState('')

  const [profiles, setProfiles] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [interestOptions, setInterestOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])

  const pageSize = 12
  const [page, setPage] = useState(1)
  const sentinelRef = useRef(null)
  const requestIdRef = useRef(0)
  const sentinelWasIntersectingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [citiesRes, interestsRes] = await Promise.all([
          getCitiesApi(),
          getInterestsApi(),
        ])
        if (cancelled) return

        setCityOptions(
          (citiesRes?.data?.data || []).map((c) => c?.name).filter(Boolean)
        )
        setInterestOptions(
          (interestsRes?.data?.data || []).map((i) => i?.name).filter(Boolean)
        )
      } catch (e) {
        if (!cancelled) handleApiError(e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtersKey = `${search}|${type}|${interests.join(",")}|${maxPrice}|${sortBy}|${ageMin}|${ageMax}|${city}|${location}`

  const fetchPage = async (pageNum, append) => {
    const reqId = ++requestIdRef.current
    const nextParams = {
      search: search || undefined,
      type,
      interests: interests.length ? interests.join(",") : undefined,
      maxPrice,
      sortBy,
      ageMin: ageMin || undefined,
      ageMax: ageMax || undefined,
      city: city || undefined,
      location: location || undefined,
      page: pageNum,
      pageSize,
    }

    if (append) setLoadingMore(true)
    else setLoadingInitial(true)

    try {
      const res = await exploreProfilesApi(nextParams)
      if (reqId !== requestIdRef.current) return // stale request

      const list = res?.data?.data || []
      const normalized = list.map((p) => ({
        ...p,
        photo: toDisplayUrl(p.photo),
        availability: p.availability ?? null,
        interests: Array.isArray(p.interests) ? p.interests : [],
        bio: typeof p.bio === "string" ? p.bio : "",
      }))

      const filtered = user?.id
        ? normalized.filter((p) => String(p.id) !== String(user.id))
        : normalized

      setProfiles((prev) => (append ? [...prev, ...filtered] : filtered))
      setHasMore(Boolean(res?.data?.hasMore))
      setPage(pageNum)
    } catch (e) {
      handleApiError(e)
    } finally {
      if (append) setLoadingMore(false)
      else setLoadingInitial(false)
    }
  }

  useEffect(() => {
    // Reset pagination on filter changes
    requestIdRef.current += 1
    setProfiles([])
    setHasMore(true)
    setPage(1)

    const t = setTimeout(() => {
      fetchPage(1, false)
    }, 250)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (!first) return

        // Prevent repeated fetches when the sentinel stays visible.
        if (!first.isIntersecting) {
          sentinelWasIntersectingRef.current = false
          return
        }

        if (sentinelWasIntersectingRef.current) return
        sentinelWasIntersectingRef.current = true

        if (!hasMore) return
        if (loadingInitial || loadingMore) return

        // Only load when user is near bottom.
        // This avoids auto-fetch loops when the sentinel remains visible.
        const distanceFromBottom =
          document.documentElement.scrollHeight -
          (window.innerHeight + window.scrollY)
        if (distanceFromBottom > 300) return

        fetchPage(page + 1, true)
      },
      // Negative bottom margin prevents triggering again immediately
      // when the sentinel stays visible (common on short pages).
      { root: null, rootMargin: '0px 0px -200px 0px', threshold: 0.01 }
    )

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingInitial, loadingMore, page, filtersKey])

  const clearAll = () => {
    setType('all')
    setInterests([])
    setSearch('')
    setMaxPrice(10000)
    setAgeMin('')
    setAgeMax('')
    setCity('')
    setLocation('')
  }

  return (
    <div className="page-wrap">
      <div className="container" style={{ paddingTop:36, paddingBottom:36 }}>

        <div style={{ marginBottom:24 }}>
          <h1 className="serif" style={{ fontSize:'clamp(26px,4vw,36px)', fontWeight:700, color:'var(--c-dark)' }}>Explore People</h1>
          <p style={{ color:'var(--c-mid)', marginTop:6 }}>Find verified individuals for your next social experience.</p>
        </div>

        {/* ── Filter Bar ── */}
        <div className="filter-bar">
          <div className="filter-grid">

            {/* Search */}
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">SEARCH</label>
              <div className="form-input-wrap">
                <span className="form-icon"><Icon name="search" size={15}/></span>
                <input type="text" placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)}
                  className="form-input has-icon" style={{ background:'var(--c-bg)' }} />
              </div>
            </div>

            {/* Type — plain single select (unchanged) */}
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">TYPE</label>
              <select value={type} onChange={e => setType(e.target.value)} className="form-select" style={{ background:'var(--c-bg)' }}>
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            {/* Interest — multi-select */}
            <MultiSelect
              label="INTEREST"
              options={interestOptions}
              selected={interests}
              onChange={setInterests}
              placeholder="All Interests"
            />

            {/* Price range */}
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">MAX PRICE: ₹{maxPrice.toLocaleString()}/hr</label>
              <input type="range" min={500} max={10000} step={100} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width:'100%', accentColor:'var(--c-primary)', marginTop:8 }} />
            </div>

            {/* Age Range — dual slider */}
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">
                AGE RANGE: {ageMin || 18} – {ageMax || 60} yrs
              </label>
              <div style={{ position:'relative', height:36, marginTop:10 }}>
                {/* Track background */}
                <div style={{
                  position:'absolute', top:'50%', left:0, right:0,
                  height:4, background:'var(--c-border)', borderRadius:4,
                  transform:'translateY(-50%)',
                }} />
                {/* Filled track */}
                <div style={{
                  position:'absolute', top:'50%',
                  left:`${((Number(ageMin||18) - 18) / (60 - 18)) * 100}%`,
                  right:`${100 - ((Number(ageMax||60) - 18) / (60 - 18)) * 100}%`,
                  height:4, background:'var(--c-primary)', borderRadius:4,
                  transform:'translateY(-50%)',
                }} />
                {/* Min slider */}
                <input
                  type="range" min={18} max={60} step={1}
                  value={ageMin || 18}
                  onChange={e => {
                    const v = Number(e.target.value)
                    setAgeMin(v === 18 ? '' : String(v))
                    if (ageMax && v >= Number(ageMax)) setAgeMax(String(Math.min(v + 1, 60)))
                  }}
                  style={{
                    position:'absolute', width:'100%', top:'50%', transform:'translateY(-50%)',
                    appearance:'none', background:'transparent', outline:'none',
                    accentColor:'var(--c-primary)', cursor:'pointer', margin:0,
                    pointerEvents:'auto', zIndex: Number(ageMin||18) > 50 ? 5 : 3,
                  }}
                />
                {/* Max slider */}
                <input
                  type="range" min={18} max={60} step={1}
                  value={ageMax || 60}
                  onChange={e => {
                    const v = Number(e.target.value)
                    setAgeMax(v === 60 ? '' : String(v))
                    if (ageMin && v <= Number(ageMin)) setAgeMin(String(Math.max(v - 1, 18)))
                  }}
                  style={{
                    position:'absolute', width:'100%', top:'50%', transform:'translateY(-50%)',
                    appearance:'none', background:'transparent', outline:'none',
                    accentColor:'var(--c-primary)', cursor:'pointer', margin:0,
                    pointerEvents:'auto', zIndex: 4,
                  }}
                />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:11, color:'var(--c-muted)' }}>18</span>
                <span style={{ fontSize:11, color:'var(--c-muted)' }}>60</span>
              </div>
              <style>{`
                input[type=range]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  width: 18px; height: 18px;
                  border-radius: 50%;
                  background: var(--c-primary);
                  border: 2px solid #fff;
                  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                  cursor: pointer;
                }
                input[type=range]::-moz-range-thumb {
                  width: 18px; height: 18px;
                  border-radius: 50%;
                  background: var(--c-primary);
                  border: 2px solid #fff;
                  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                  cursor: pointer;
                }
              `}</style>
            </div>

            {/* City */}
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">CITY</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="form-select"
                style={{
                  background: city ? 'var(--c-primary-lt)' : 'var(--c-bg)',
                  border:`1.5px solid ${city ? 'var(--c-primary)' : 'var(--c-border)'}`,
                  color: city ? 'var(--c-primary)' : 'var(--c-mid)',
                  fontWeight: city ? 600 : 400,
                }}
              >
                <option value="">All Cities</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">LOCATION / AREA</label>
              <div className="form-input-wrap">
                <span className="form-icon"><Icon name="location" size={15}/></span>
                <input
                  type="text"
                  placeholder="e.g. Bandra, Andheri…"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="form-input has-icon"
                  style={{
                    background: location ? 'var(--c-primary-lt)' : 'var(--c-bg)',
                    border:`1.5px solid ${location ? 'var(--c-primary)' : 'var(--c-border)'}`,
                    color: location ? 'var(--c-primary)' : undefined,
                    fontWeight: location ? 600 : 400,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(interests.length > 0 || ageMin || ageMax || city || location) && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:14, alignItems:'center' }}>
              <span style={{ fontSize:12, color:'var(--c-muted)', fontWeight:600 }}>Active:</span>

              {interests.map(i => (
                <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--c-primary)', color:'#fff', fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:20 }}>
                  {i}
                  <span onClick={() => setInterests(interests.filter(v => v !== i))} style={{ cursor:'pointer', fontSize:14, fontWeight:800, lineHeight:1, opacity:.8 }}>×</span>
                </span>
              ))}

              {(ageMin || ageMax) && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--c-accent)', color:'#fff', fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:20 }}>
                  Age: {ageMin || '?'} – {ageMax || '?'}
                  <span onClick={() => { setAgeMin(''); setAgeMax('') }} style={{ cursor:'pointer', fontSize:14, fontWeight:800, lineHeight:1, opacity:.8 }}>×</span>
                </span>
              )}

              {city && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--c-gold)', color:'#fff', fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:20 }}>
                  {city}
                  <span onClick={() => setCity('')} style={{ cursor:'pointer', fontSize:14, fontWeight:800, lineHeight:1, opacity:.8 }}>×</span>
                </span>
              )}

              {location && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--c-success)', color:'#fff', fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:20 }}>
                  📍 {location}
                  <span onClick={() => setLocation('')} style={{ cursor:'pointer', fontSize:14, fontWeight:800, lineHeight:1, opacity:.8 }}>×</span>
                </span>
              )}

              <button onClick={clearAll} style={{ fontSize:12, color:'var(--c-danger)', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-sans)', padding:'4px 8px' }}>
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <p style={{ color:'var(--c-mid)', fontSize:14 }}>
            <strong style={{ color:'var(--c-dark)' }}>{profiles.length}</strong> profiles found
          </p>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            {[['all','All'],['individual','Individuals']].map(([v, l]) => (
              <button key={v} onClick={() => setType(v)} style={{
                padding:'6px 14px', borderRadius:20, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)',
                border:`1.5px solid ${type===v ? 'var(--c-primary)' : 'var(--c-border)'}`,
                background: type===v ? 'var(--c-primary)' : 'transparent',
                color: type===v ? '#fff' : 'var(--c-mid)',
              }}>{l}</button>
            ))}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-select" style={{ width:'auto', padding:'7px 32px 7px 12px', fontSize:13 }}>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loadingInitial ? (
          <>
            <style>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
            <ShimmerProfiles count={pageSize} />
          </>
        ) : profiles.length > 0 ? (
          <div className="profiles-grid">
            {profiles.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        ) : (
          <EmptyState icon="search" title="No profiles found" message="Try adjusting your filters or search term." />
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 24 }} />

        {loadingMore && !loadingInitial && (
          <>
            <style>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
            <ShimmerProfiles count={pageSize} />
          </>
        )}
      </div>
    </div>
  )
}
