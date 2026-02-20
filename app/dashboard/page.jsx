'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // ── Live blog feed ──
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(10))
    const unsubBlogs = onSnapshot(q, snap => {
      setBlogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubBlogs()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out!')
      router.push('/login')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const navItems = [
    { label: 'Explore Map', icon: '🗺️', path: '/map', color: '#20b2aa' },
    { label: 'Messages', icon: '💬', path: '/chat', color: '#8b5cf6' },
    { label: 'Blogs', icon: '📝', path: '/blogs', color: '#f59e0b' },
    { label: 'Discover', icon: '🧭', path: '/discover', color: '#f43f5e' },
    { label: 'My Profile', icon: '👤', path: '/profile', color: '#2f81f7' },
  ]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🌍</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-x-hidden">

      {/* ── Full screen nature background ── */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-10" style={{ background: 'rgba(0,0,0,0.65)' }} />
      <div className="fixed inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(13,17,23,0.97) 0%, transparent 60%)' }} />

      {/* ── Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sliding Sidebar ── */}
      <div
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: '280px',
          background: 'rgba(13,17,23,0.97)',
          borderRight: '1px solid rgba(48,54,61,0.8)',
          backdropFilter: 'blur(20px)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: sidebarOpen ? '4px 0 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="p-6" style={{ borderBottom: '1px solid rgba(48,54,61,0.6)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold" style={{
              background: 'linear-gradient(135deg, #20b2aa, #2f81f7, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              🌍 Nomads Journal
            </span>
            <button onClick={() => setSidebarOpen(false)} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', width: '32px', height: '32px',
              borderRadius: '8px', cursor: 'pointer', fontSize: '1rem',
            }}>✕</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{
              background: 'linear-gradient(135deg, #1a2a4a, #0d2b2b)',
              border: '2px solid rgba(47,129,247,0.4)',
              boxShadow: '0 0 12px rgba(47,129,247,0.2)',
            }}>👤</div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{user?.displayName}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <div
              key={item.path}
              onClick={() => { router.push(item.path); setSidebarOpen(false) }}
              className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-all"
              style={{ borderLeft: '3px solid transparent' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderLeftColor = item.color
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderLeftColor = 'transparent'
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold text-sm" style={{ color: item.color }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="p-6" style={{ borderTop: '1px solid rgba(48,54,61,0.6)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', background: 'rgba(248,81,73,0.1)',
              border: '1px solid rgba(248,81,73,0.3)', color: 'var(--danger)',
              padding: '0.65rem', borderRadius: '10px', fontWeight: 700,
              cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,81,73,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,81,73,0.1)'}
          >🚪 Logout</button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-20">

        {/* ── Navbar ── */}
        <nav
          className="px-6 py-3 flex justify-between items-center sticky top-0 z-30"
          style={{
            background: 'linear-gradient(135deg, rgba(13,17,23,0.92), rgba(26,42,74,0.92), rgba(13,27,43,0.92))',
            borderBottom: '1px solid rgba(47,129,247,0.2)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'rgba(47,129,247,0.1)', border: '1px solid rgba(47,129,247,0.3)',
                borderRadius: '10px', padding: '8px 10px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '5px', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(47,129,247,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(47,129,247,0.1)'}
            >
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#2f81f7', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '14px', height: '2px', background: '#8b5cf6', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#20b2aa', borderRadius: '2px' }} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight" style={{
              background: 'linear-gradient(135deg, #20b2aa 0%, #2f81f7 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px rgba(47,129,247,0.4))',
            }}>🌍 Nomads Journal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden md:block" style={{ color: 'var(--text-secondary)' }}>
              Hey, <span style={{
                background: 'linear-gradient(135deg, #2f81f7, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700,
              }}>{user?.displayName}</span>! 👋
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent', border: '1px solid rgba(248,81,73,0.4)',
                color: 'var(--danger)', padding: '0.4rem 1rem', borderRadius: '8px',
                fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(248,81,73,0.1)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >Logout</button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">

          {/* ── Welcome Banner ── */}
          <div
            className="rounded-2xl p-6 mb-5 mt-4"
            style={{
              background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(47,129,247,0.2)',
              backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: '-40px', right: '-40px',
              width: '200px', height: '200px', borderRadius: '50%',
              background: 'rgba(47,129,247,0.07)', filter: 'blur(40px)',
            }} />
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Welcome back, <span style={{
                background: 'linear-gradient(135deg, #20b2aa, #2f81f7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{user?.displayName}</span>! 🌍
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Connect with travelers, share your journey, explore the world!
            </p>
          </div>

          {/* ── Compact Nav Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {[
              { label: 'Map', icon: '🗺️', path: '/map', color: '#20b2aa', bg: 'rgba(13,43,43,0.8)', border: 'rgba(32,178,170,0.3)', glow: 'rgba(32,178,170,0.25)' },
              { label: 'Chat', icon: '💬', path: '/chat', color: '#8b5cf6', bg: 'rgba(30,26,53,0.8)', border: 'rgba(139,92,246,0.3)', glow: 'rgba(139,92,246,0.25)' },
              { label: 'Blogs', icon: '📝', path: '/blogs', color: '#f59e0b', bg: 'rgba(43,31,10,0.8)', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.25)' },
              { label: 'Discover', icon: '🧭', path: '/discover', color: '#f43f5e', bg: 'rgba(43,15,26,0.8)', border: 'rgba(244,63,94,0.3)', glow: 'rgba(244,63,94,0.25)' },
              { label: 'Profile', icon: '👤', path: '/profile', color: '#2f81f7', bg: 'rgba(9,27,54,0.8)', border: 'rgba(47,129,247,0.3)', glow: 'rgba(47,129,247,0.25)' },
            ].map(card => (
              <div
                key={card.path}
                onClick={() => router.push(card.path)}
                className="rounded-xl p-4 cursor-pointer text-center transition-all duration-200"
                style={{
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = `0 8px 24px ${card.glow}`
                  e.currentTarget.style.borderColor = card.color
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = card.border
                }}
              >
                <div className="text-3xl mb-2">{card.icon}</div>
                <p className="text-xs font-bold" style={{ color: card.color }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* ── Live Blog Feed ── */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              📰 Latest Travel Stories
            </h3>
            <button
              onClick={() => router.push('/blogs')}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--accent)', padding: '0.3rem 0.9rem',
                borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              See All →
            </button>
          </div>

          {blogs.length === 0 ? (
            <div
              className="text-center py-12 rounded-2xl"
              style={{
                background: 'rgba(22,27,34,0.75)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="text-5xl mb-3">📝</div>
              <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No blogs yet!</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Be the first to share your travel story</p>
              <button
                onClick={() => router.push('/blogs/create')}
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  padding: '0.55rem 1.4rem', borderRadius: '999px',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                }}
              >✍️ Write First Blog</button>
            </div>
          ) : (
            <div className="space-y-4 pb-6">
              {blogs.map(blog => (
                <div
                  key={blog.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(22,27,34,0.82)',
                    border: '1px solid rgba(48,54,61,0.8)',
                    backdropFilter: 'blur(12px)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(47,129,247,0.4)'
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(47,129,247,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Blog image */}
                  {blog.imageUrl && (
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                    />
                  )}

                  <div className="p-4">
                    {/* Author row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      >👤</div>
                      <div className="flex-1">
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {blog.authorName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {blog.location && <span style={{ color: '#20b2aa' }}>📍 {blog.location} · </span>}
                          {blog.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      {/* Like count */}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        ❤️ {blog.likes?.length || 0}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {blog.title}
                    </h4>

                    {/* Content preview */}
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {blog.content}
                    </p>

                    {/* Tags */}
                    {blog.tags && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {blog.tags.split(',').slice(0, 3).map((tag, i) => (
                          <span key={i} style={{
                            background: 'var(--accent-glow)', color: 'var(--accent)',
                            border: '1px solid rgba(47,129,247,0.2)',
                            padding: '2px 8px', borderRadius: '999px',
                            fontSize: '0.7rem', fontWeight: 500,
                          }}>#{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* See all button at bottom */}
              <div className="text-center pt-2">
                <button
                  onClick={() => router.push('/blogs')}
                  style={{
                    background: 'rgba(47,129,247,0.1)', border: '1px solid rgba(47,129,247,0.3)',
                    color: 'var(--accent)', padding: '0.6rem 2rem',
                    borderRadius: '999px', fontWeight: 700, cursor: 'pointer',
                    fontSize: '0.9rem', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(47,129,247,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(47,129,247,0.1)'}
                >
                  📝 See All Blogs →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}