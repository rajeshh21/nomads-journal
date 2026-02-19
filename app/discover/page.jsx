'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

// ── Popular countries with flags ──
const COUNTRIES = [
  { name: 'India', flag: '🇮🇳' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'UK', flag: '🇬🇧' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Greece', flag: '🇬🇷' },
  { name: 'Nepal', flag: '🇳🇵' },
  { name: 'Vietnam', flag: '🇻🇳' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Peru', flag: '🇵🇪' },
  { name: 'New Zealand', flag: '🇳🇿' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Argentina', flag: '🇦🇷' },
]

const getDistance = (loc1, loc2) => {
  const R = 6371
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
}

export default function DiscoverPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [allTravelers, setAllTravelers] = useState([])
  const [allBlogs, setAllBlogs] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Level state
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [activeTab, setActiveTab] = useState('blogs') // 'blogs' | 'travelers'

  useEffect(() => {
    if (!user) return router.push('/login')
  }, [user])

  // Get user GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }
  }, [])

  // Fetch all travelers
  useEffect(() => {
    if (!user) return
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(t => t.id !== user.uid)
      setAllTravelers(data)
    })
    return unsubscribe
  }, [user])

  // Fetch all blogs
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAllBlogs(data)
    })
    return unsubscribe
  }, [user])

  // ── Filter by selected country ──
  const countryBlogs = allBlogs.filter(b =>
    b.location?.toLowerCase().includes(selectedCountry?.name?.toLowerCase())
  )

  const countryTravelers = allTravelers
    .filter(t =>
      t.currentLocation?.toLowerCase().includes(selectedCountry?.name?.toLowerCase()) ||
      t.homeCountry?.toLowerCase().includes(selectedCountry?.name?.toLowerCase())
    )
    .map(t => ({
      ...t,
      distance: userLocation && t.location
        ? getDistance(userLocation, { lat: t.location.latitude, lng: t.location.longitude })
        : null
    }))
    .sort((a, b) => (a.distance || 999999) - (b.distance || 999999))

  // Filter countries by search
  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Styles ──
  const glassCard = {
    background: 'rgba(22, 27, 34, 0.85)',
    border: '1px solid rgba(48, 54, 61, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
  }

  return (
    <div className="min-h-screen relative">

      {/* ── Background image ── */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10" style={{ background: 'rgba(0,0,0,0.72)' }} />
      <div className="fixed inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(13,17,23,0.98) 0%, transparent 60%)' }} />

      {/* ── Content ── */}
      <div className="relative z-20">

        {/* ── Navbar ── */}
        <nav
          className="px-6 py-4 flex justify-between items-center sticky top-0 z-50"
          style={{
            background: 'rgba(13,17,23,0.85)',
            borderBottom: '1px solid rgba(48,54,61,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <h1
            onClick={() => router.push('/dashboard')}
            className="text-xl font-bold cursor-pointer tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            🌍 Nomads Journal
          </h1>
          {selectedCountry ? (
            <button
              onClick={() => { setSelectedCountry(null); setSearchQuery('') }}
              style={{
                background: 'rgba(33,38,45,0.8)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ← All Countries
            </button>
          ) : (
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: 'rgba(33,38,45,0.8)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          )}
        </nav>

        <div className="max-w-5xl mx-auto p-6">

          {/* ══════════════════════════════════════
              LEVEL 1 — Country Selection
          ══════════════════════════════════════ */}
          {!selectedCountry && (
            <>
              {/* Hero */}
              <div className="text-center py-10 mb-6">
                <h2 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  🧭 Discover the World
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Pick a country to explore blogs and travelers from there
                </p>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search country..."
                  style={{
                    background: 'rgba(33,38,45,0.9)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: '12px',
                    padding: '0.75rem 1.2rem',
                    width: '100%',
                    outline: 'none',
                    fontSize: '1rem',
                    backdropFilter: 'blur(8px)',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--accent)'
                    e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Countries Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-16">
                {filteredCountries.map(country => {
                  const blogCount = allBlogs.filter(b =>
                    b.location?.toLowerCase().includes(country.name.toLowerCase())
                  ).length
                  const travelerCount = allTravelers.filter(t =>
                    t.currentLocation?.toLowerCase().includes(country.name.toLowerCase()) ||
                    t.homeCountry?.toLowerCase().includes(country.name.toLowerCase())
                  ).length

                  return (
                    <div
                      key={country.name}
                      onClick={() => { setSelectedCountry(country); setActiveTab('blogs') }}
                      className="cursor-pointer text-center p-5 rounded-2xl transition-all duration-200"
                      style={{
                        ...glassCard,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(47,129,247,0.6)'
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(47,129,247,0.15)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div className="text-4xl mb-2">{country.flag}</div>
                      <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                        {country.name}
                      </h3>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {blogCount > 0 && (
                          <span style={{
                            background: 'var(--accent-glow)', color: 'var(--accent)',
                            fontSize: '0.7rem', padding: '1px 8px', borderRadius: '999px',
                            border: '1px solid rgba(47,129,247,0.2)',
                          }}>
                            📝 {blogCount}
                          </span>
                        )}
                        {travelerCount > 0 && (
                          <span style={{
                            background: 'rgba(32,178,170,0.1)', color: '#20b2aa',
                            fontSize: '0.7rem', padding: '1px 8px', borderRadius: '999px',
                            border: '1px solid rgba(32,178,170,0.2)',
                          }}>
                            👥 {travelerCount}
                          </span>
                        )}
                        {blogCount === 0 && travelerCount === 0 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Be first!
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════
              LEVEL 2 — Country Detail
          ══════════════════════════════════════ */}
          {selectedCountry && (
            <>
              {/* Country Header */}
              <div className="text-center py-8 mb-6">
                <div className="text-6xl mb-3">{selectedCountry.flag}</div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {selectedCountry.name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {countryBlogs.length} blogs · {countryTravelers.length} travelers
                </p>
              </div>

              {/* ── Tabs ── */}
              <div
                className="flex gap-2 mb-6 p-1 rounded-xl"
                style={{
                  background: 'rgba(22,27,34,0.85)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(8px)',
                  display: 'inline-flex',
                }}
              >
                {['blogs', 'travelers'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '0.5rem 1.4rem',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      background: activeTab === tab ? 'var(--accent)' : 'transparent',
                      color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {tab === 'blogs' ? `📝 Blogs (${countryBlogs.length})` : `👥 Travelers (${countryTravelers.length})`}
                  </button>
                ))}
              </div>

              {/* ── Blogs Tab ── */}
              {activeTab === 'blogs' && (
                <div className="space-y-5 pb-16">
                  {countryBlogs.length === 0 ? (
                    <div className="text-center py-16" style={glassCard}>
                      <div className="text-5xl mb-4">📝</div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        No blogs from {selectedCountry.name} yet!
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Be the first to write one!</p>
                      <button
                        onClick={() => router.push('/blogs/create')}
                        style={{
                          marginTop: '1rem',
                          background: 'var(--accent)', color: '#fff',
                          border: 'none', padding: '0.6rem 1.4rem',
                          borderRadius: '999px', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        ✍️ Write Blog
                      </button>
                    </div>
                  ) : (
                    countryBlogs.map(blog => (
                      <div
                        key={blog.id}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          ...glassCard,
                          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(47,129,247,0.5)'
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(47,129,247,0.12)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)'
                          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'
                        }}
                      >
                        {blog.imageUrl && (
                          <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                            >
                              👤
                            </div>
                            <div>
                              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {blog.authorName}
                              </p>
                              <p className="text-xs" style={{ color: '#20b2aa' }}>
                                📍 {blog.location}
                              </p>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            {blog.title}
                          </h3>
                          <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                            {blog.content}
                          </p>
                          {blog.tags && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {blog.tags.split(',').map((tag, i) => (
                                <span key={i} style={{
                                  background: 'var(--accent-glow)', color: 'var(--accent)',
                                  border: '1px solid rgba(47,129,247,0.2)',
                                  padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 500,
                                }}>
                                  #{tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              ❤️ {blog.likes?.length || 0} likes
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              · 💬 {blog.comments?.length || 0} comments
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Travelers Tab ── */}
              {activeTab === 'travelers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
                  {countryTravelers.length === 0 ? (
                    <div className="col-span-2 text-center py-16" style={glassCard}>
                      <div className="text-5xl mb-4">👥</div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        No travelers in {selectedCountry.name} yet!
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Update your location in Profile to appear here.</p>
                    </div>
                  ) : (
                    countryTravelers.map(t => (
                      <div
                        key={t.id}
                        className="p-5 rounded-2xl"
                        style={{
                          ...glassCard,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(32,178,170,0.5)'
                          e.currentTarget.style.transform = 'translateY(-3px)'
                          e.currentTarget.style.boxShadow = '0 8px 30px rgba(32,178,170,0.12)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)'
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                            style={{
                              background: 'var(--surface-2)',
                              border: '2px solid rgba(32,178,170,0.3)',
                              boxShadow: '0 0 12px rgba(32,178,170,0.1)',
                            }}
                          >
                            👤
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                              {t.name}
                            </h3>
                            {t.distance !== null && (
                              <p className="text-sm font-semibold mb-1" style={{ color: '#20b2aa' }}>
                                📍 {t.distance} km away
                              </p>
                            )}
                            {t.currentLocation && (
                              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                                📌 {t.currentLocation}
                              </p>
                            )}
                            {t.homeCountry && (
                              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                                🏠 From {t.homeCountry}
                              </p>
                            )}
                            {t.bio && (
                              <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                {t.bio}
                              </p>
                            )}
                            {t.travelStyle && (
                              <span style={{
                                display: 'inline-block',
                                marginTop: '8px',
                                background: 'rgba(139,92,246,0.1)',
                                color: '#8b5cf6',
                                border: '1px solid rgba(139,92,246,0.2)',
                                padding: '2px 10px',
                                borderRadius: '999px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                              }}>
                                🎒 {t.travelStyle}
                              </span>
                            )}
                            {t.interests && (
                              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                ❤️ {t.interests}
                              </p>
                            )}
                            <button
                              onClick={() => router.push('/chat')}
                              style={{
                                marginTop: '12px',
                                background: 'var(--accent)',
                                color: '#fff',
                                border: 'none',
                                padding: '0.45rem 1.1rem',
                                borderRadius: '999px',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                transition: 'box-shadow 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'}
                              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                              💬 Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}