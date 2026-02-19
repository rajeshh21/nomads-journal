'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function BlogsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [blogs, setBlogs] = useState([])
  const [loadingBlogs, setLoadingBlogs] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  // Fetch blogs real-time
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'blogs'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setBlogs(data)
      setLoadingBlogs(false)
    })
    return unsubscribe
  }, [user])

  const handleDelete = async (blogId, authorId) => {
    if (authorId !== user.uid) return
    if (!confirm('Delete this blog?')) return
    try {
      await deleteDoc(doc(db, 'blogs', blogId))
      toast.success('Blog deleted!')
    } catch (error) {
      toast.error('Failed to delete!')
    }
  }

  const handleLike = async (blog) => {
    const likes = blog.likes || []
    const alreadyLiked = likes.includes(user.uid)
    try {
      await updateDoc(doc(db, 'blogs', blog.id), {
        likes: alreadyLiked
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid)
      })
    } catch (error) {
      toast.error('Failed to like!')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">📝</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative">

      {/* ── Full screen background image ── */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ── Dark overlay ── */}
      <div
        className="fixed inset-0 z-10"
        style={{ background: 'rgba(0, 0, 0, 0.75)' }}
      />

      {/* ── Bottom gradient ── */}
      <div
        className="fixed inset-0 z-10"
        style={{
          background: 'linear-gradient(to top, rgba(13,17,23,0.98) 0%, transparent 60%)',
        }}
      />

      {/* ── All content above background ── */}
      <div className="relative z-20">

        {/* ── Navbar ── */}
        <nav
          className="px-6 py-4 flex justify-between items-center sticky top-0 z-50"
          style={{
            background: 'rgba(13, 17, 23, 0.85)',
            borderBottom: '1px solid rgba(48, 54, 61, 0.6)',
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
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'rgba(33, 38, 45, 0.8)',
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
        </nav>

        <div className="max-w-2xl mx-auto p-6">

          {/* ── Hero Header ── */}
          <div className="text-center py-10 mb-4">
            <h2 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              📝 Travel Blogs
            </h2>
            <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
              Stories from travelers around the world
            </p>
            <button
              onClick={() => router.push('/blogs/create')}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.6rem',
                borderRadius: '999px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(47,129,247,0.35)',
                transition: 'box-shadow 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 30px rgba(47,129,247,0.55)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(47,129,247,0.35)'}
            >
              ✍️ Write a Blog
            </button>
          </div>

          {/* ── Loading State ── */}
          {loadingBlogs ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📝</div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading blogs...</p>
            </div>

          ) : blogs.length === 0 ? (
            /* ── Empty State ── */
            <div
              className="text-center py-16 rounded-2xl"
              style={{
                background: 'rgba(22, 27, 34, 0.85)',
                border: '1px solid rgba(48, 54, 61, 0.8)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-6xl mb-4">📝</p>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                No blogs yet!
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Be the first to share your travel story!
              </p>
              <button
                onClick={() => router.push('/blogs/create')}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '999px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Write First Blog
              </button>
            </div>

          ) : (
            /* ── Blog Feed ── */
            <div className="space-y-5 pb-16">
              {blogs.map(blog => {
                const isLiked = blog.likes?.includes(user.uid)
                const isAuthor = blog.authorId === user.uid

                return (
                  <div
                    key={blog.id}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(22, 27, 34, 0.88)',
                      border: '1px solid rgba(48, 54, 61, 0.8)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(47,129,247,0.5)'
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(47,129,247,0.12)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(48, 54, 61, 0.8)'
                      e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'
                    }}
                  >

                    {/* Blog Image */}
                    {blog.imageUrl && (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                      />
                    )}

                    <div className="p-5">

                      {/* Author Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                          style={{
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          👤
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {blog.authorName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {blog.location && (
                              <span style={{ color: '#20b2aa' }}>📍 {blog.location} · </span>
                            )}
                            {blog.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        </div>

                        {/* Delete button */}
                        {isAuthor && (
                          <button
                            onClick={() => handleDelete(blog.id, blog.authorId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '4px',
                              borderRadius: '6px',
                              transition: 'color 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            title="Delete blog"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="text-lg font-bold mb-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {blog.title}
                      </h3>

                      {/* Content Preview */}
                      <p
                        className="text-sm mb-4 line-clamp-3"
                        style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}
                      >
                        {blog.content}
                      </p>

                      {/* Tags */}
                      {blog.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.split(',').map((tag, i) => (
                            <span
                              key={i}
                              style={{
                                background: 'var(--accent-glow)',
                                color: 'var(--accent)',
                                border: '1px solid rgba(47,129,247,0.2)',
                                padding: '2px 10px',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              }}
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* ── Actions Bar ── */}
                      <div
                        className="flex items-center gap-4 pt-4"
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(blog)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isLiked ? 'rgba(248,81,73,0.1)' : 'transparent',
                            border: isLiked ? '1px solid rgba(248,81,73,0.3)' : '1px solid var(--border)',
                            color: isLiked ? 'var(--danger)' : 'var(--text-muted)',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={e => {
                            if (!isLiked) {
                              e.currentTarget.style.borderColor = 'rgba(248,81,73,0.4)'
                              e.currentTarget.style.color = 'var(--danger)'
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isLiked) {
                              e.currentTarget.style.borderColor = 'var(--border)'
                              e.currentTarget.style.color = 'var(--text-muted)'
                            }
                          }}
                        >
                          {isLiked ? '❤️' : '🤍'}
                          <span>{blog.likes?.length || 0}</span>
                        </button>

                        {/* Comments count */}
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                          }}
                        >
                          💬 {blog.comments?.length || 0}
                        </span>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}