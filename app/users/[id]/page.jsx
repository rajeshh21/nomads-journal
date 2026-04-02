'use client'
import { useState, useEffect, use } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore'

export default function UserHistoryPage({ params }) {
  const { id } = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [activeTab, setActiveTab] = useState('blogs')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  // Fetch user profile — reads from Firestore users collection
  useEffect(() => {
    if (!user || !id) return
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'users', id))
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() })
      }
      setLoadingProfile(false)
    }
    fetchProfile()
  }, [user, id])

  // Fetch all blogs by this user — UNTOUCHED logic
  useEffect(() => {
    if (!user || !id) return
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(blog => blog.authorId === id)
      setBlogs(data)
    })
    return unsubscribe
  }, [user, id])

  // Extract unique places from blogs
  const placesVisited = [...new Set(
    blogs
      .filter(b => b.location && b.location.trim() !== '')
      .map(b => b.location.trim())
  )]

  if (loading || loadingProfile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">👤</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">😕</div>
        <p style={{ color: 'var(--text-secondary)' }}>User not found</p>
        <button onClick={() => router.back()} style={{
          marginTop: '1rem', background: 'var(--accent)', color: '#fff',
          border: 'none', padding: '0.5rem 1.2rem', borderRadius: '999px',
          cursor: 'pointer', fontWeight: 700,
        }}>← Go Back</button>
      </div>
    </div>
  )

  const isOwnProfile = user?.uid === id

  return (
    <div className="min-h-screen relative">

      {/* ── Background ── */}
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      <div className="fixed inset-0 z-10" style={{ background: 'rgba(0,0,0,0.75)' }} />
      <div className="fixed inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(13,17,23,0.98) 0%, transparent 60%)' }} />

      <div className="relative z-20">

        {/* ── Navbar ── */}
        <nav className="px-6 py-4 flex justify-between items-center sticky top-0 z-50" style={{
          background: 'rgba(13,17,23,0.85)', borderBottom: '1px solid rgba(48,54,61,0.6)',
          backdropFilter: 'blur(12px)',
        }}>
          <h1 onClick={() => router.push('/dashboard')} className="text-xl font-bold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            🌍 Nomads Journal
          </h1>
          <button onClick={() => router.back()} style={{
            background: 'rgba(33,38,45,0.8)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', padding: '0.4rem 1rem',
            borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer',
          }}>← Back</button>
        </nav>

        <div className="max-w-3xl mx-auto p-6">

          {/* ── Profile Hero Card ── */}
          <div className="rounded-2xl overflow-hidden mb-6" style={{
            background: 'rgba(22,27,34,0.92)', border: '1px solid rgba(48,54,61,0.8)',
            backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}>
            {/* Top banner */}
            <div style={{
              height: '100px',
              background: 'linear-gradient(135deg, #1a2a4a, #0d2b2b, #1a1040)',
            }} />

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div style={{ marginTop: '-40px', marginBottom: '12px' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl overflow-hidden" style={{
                  background: 'linear-gradient(135deg, #1a2a4a, #0d2b2b)',
                  border: '3px solid rgba(47,129,247,0.5)',
                  boxShadow: '0 0 20px rgba(47,129,247,0.2)',
                }}>
                  {profile.photoUrl
                    ? <img src={profile.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '👤'}
                </div>
              </div>

              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>{profile.name}</h2>
                  {profile.currentLocation && (
                    <p className="text-sm mb-1" style={{ color: '#20b2aa' }}>📍 {profile.currentLocation}</p>
                  )}
                  {profile.homeCountry && (
                    <p className="text-sm mb-1" style={{ color: '#8b949e' }}>🏠 From {profile.homeCountry}</p>
                  )}
                  {profile.travelStyle && (
                    <span style={{
                      display: 'inline-block', marginTop: '4px',
                      background: 'rgba(139,92,246,0.1)', color: '#8b5cf6',
                      border: '1px solid rgba(139,92,246,0.2)',
                      padding: '2px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                    }}>🎒 {profile.travelStyle}</span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(47,129,247,0.1)', border: '1px solid rgba(47,129,247,0.2)' }}>
                    <p className="text-xl font-bold" style={{ color: '#2f81f7' }}>{blogs.length}</p>
                    <p className="text-xs" style={{ color: '#8b949e' }}>Blogs</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(32,178,170,0.1)', border: '1px solid rgba(32,178,170,0.2)' }}>
                    <p className="text-xl font-bold" style={{ color: '#20b2aa' }}>{placesVisited.length}</p>
                    <p className="text-xs" style={{ color: '#8b949e' }}>Places</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>
                      {blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0)}
                    </p>
                    <p className="text-xs" style={{ color: '#8b949e' }}>Likes</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-sm" style={{ color: '#8b949e', lineHeight: '1.7' }}>
                  {profile.bio}
                </p>
              )}

              {/* Interests */}
              {profile.interests && (
                <p className="mt-2 text-sm" style={{ color: '#8b949e' }}>
                  ❤️ Interests: {profile.interests}
                </p>
              )}

              {/* Action buttons */}
              {!isOwnProfile && (
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => router.push('/chat')}
                    style={{
                      background: 'var(--accent)', color: '#fff', border: 'none',
                      padding: '0.55rem 1.4rem', borderRadius: '999px',
                      fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(47,129,247,0.3)',
                    }}
                  >💬 Send Message</button>
                </div>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => router.push('/profile')}
                  style={{
                    marginTop: '1rem',
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', padding: '0.5rem 1.2rem',
                    borderRadius: '999px', fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >✏️ Edit Profile</button>
              )}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{
            background: 'rgba(22,27,34,0.85)', border: '1px solid rgba(48,54,61,0.6)',
            backdropFilter: 'blur(8px)', display: 'inline-flex',
          }}>
            <button
              onClick={() => setActiveTab('blogs')}
              style={{
                padding: '0.5rem 1.4rem', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                background: activeTab === 'blogs' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'blogs' ? '#fff' : 'var(--text-muted)',
              }}
            >📝 Blogs ({blogs.length})</button>
            <button
              onClick={() => setActiveTab('places')}
              style={{
                padding: '0.5rem 1.4rem', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                background: activeTab === 'places' ? '#20b2aa' : 'transparent',
                color: activeTab === 'places' ? '#fff' : 'var(--text-muted)',
              }}
            >📍 Places ({placesVisited.length})</button>
          </div>

          {/* ── Blogs Tab ── */}
          {activeTab === 'blogs' && (
            <div className="space-y-5 pb-16">
              {blogs.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{
                  background: 'rgba(22,27,34,0.85)', border: '1px solid rgba(48,54,61,0.8)', backdropFilter: 'blur(12px)',
                }}>
                  <p className="text-5xl mb-3">📝</p>
                  <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No blogs yet!</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {isOwnProfile ? 'Share your first travel story!' : `${profile.name} hasn't written any blogs yet.`}
                  </p>
                  {isOwnProfile && (
                    <button onClick={() => router.push('/blogs/create')} style={{
                      marginTop: '1rem', background: 'var(--accent)', color: '#fff',
                      border: 'none', padding: '0.55rem 1.4rem', borderRadius: '999px',
                      fontWeight: 700, cursor: 'pointer',
                    }}>✍️ Write Blog</button>
                  )}
                </div>
              ) : (
                blogs.map(blog => (
                  <div
                    key={blog.id}
                    className="rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/blogs/${blog.id}`)}
                    style={{
                      background: 'rgba(22,27,34,0.88)', border: '1px solid rgba(48,54,61,0.8)',
                      backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
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
                      <img src={blog.imageUrl} alt={blog.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        {blog.location && (
                          <span className="text-xs" style={{ color: '#20b2aa' }}>📍 {blog.location}</span>
                        )}
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {blog.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{blog.title}</h3>
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                        {blog.content}
                      </p>
                      {blog.tags && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {blog.tags.split(',').slice(0, 3).map((tag, i) => (
                            <span key={i} style={{
                              background: 'var(--accent-glow)', color: 'var(--accent)',
                              border: '1px solid rgba(47,129,247,0.2)',
                              padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 500,
                            }}>#{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>❤️ {blog.likes?.length || 0} likes</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>💬 {blog.comments?.length || 0} comments</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Places Tab ── */}
          {activeTab === 'places' && (
            <div className="pb-16">
              {placesVisited.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{
                  background: 'rgba(22,27,34,0.85)', border: '1px solid rgba(48,54,61,0.8)', backdropFilter: 'blur(12px)',
                }}>
                  <p className="text-5xl mb-3">📍</p>
                  <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No places yet!</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Places are collected from blog locations.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {placesVisited.map((place, idx) => {
                    const blogsFromPlace = blogs.filter(b => b.location?.trim() === place)
                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl"
                        style={{
                          background: 'rgba(22,27,34,0.88)', border: '1px solid rgba(48,54,61,0.8)',
                          backdropFilter: 'blur(12px)', transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(32,178,170,0.5)'
                          e.currentTarget.style.transform = 'translateY(-3px)'
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(32,178,170,0.12)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)'
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{
                            background: 'rgba(32,178,170,0.1)', border: '1px solid rgba(32,178,170,0.3)',
                          }}>📍</div>
                          <div>
                            <h3 className="font-bold" style={{ color: '#ffffff' }}>{place}</h3>
                            <p className="text-xs" style={{ color: '#8b949e' }}>{blogsFromPlace.length} blog{blogsFromPlace.length !== 1 ? 's' : ''} written here</p>
                          </div>
                        </div>

                        {/* Show blog titles from this place */}
                        <div className="space-y-2">
                          {blogsFromPlace.slice(0, 2).map(b => (
                            <div
                              key={b.id}
                              onClick={() => router.push(`/blogs/${b.id}`)}
                              className="text-sm cursor-pointer px-3 py-2 rounded-lg"
                              style={{
                                background: 'rgba(33,38,45,0.6)', color: 'var(--text-secondary)',
                                border: '1px solid rgba(48,54,61,0.5)',
                                transition: 'color 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                              📝 {b.title}
                            </div>
                          ))}
                          {blogsFromPlace.length > 2 && (
                            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                              +{blogsFromPlace.length - 2} more blogs
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}