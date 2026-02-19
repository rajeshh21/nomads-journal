'use client'
import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

const MAX_CHARS = 500

export default function CreateBlogPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [locating, setLocating] = useState(false)
  const fileInputRef = useRef(null)

  const [blog, setBlog] = useState({
    title: '',
    content: '',
    location: '',
    tags: '',
    imageUrl: '',
  })

  // ── Cloudinary image upload ──
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB!')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (data.secure_url) {
        setBlog({ ...blog, imageUrl: data.secure_url })
        toast.success('Photo uploaded! 📸')
      } else {
        toast.error('Upload failed, try again!')
      }
    } catch (err) {
      toast.error('Upload failed!')
    } finally {
      setUploading(false)
    }
  }

  // ── GPS location detect ──
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported!')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || ''
          const country = data.address?.country || ''
          const locationText = city && country ? `${city}, ${country}` : `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
          setBlog(prev => ({ ...prev, location: locationText }))
          toast.success('Location detected! 📍')
        } catch {
          setBlog(prev => ({ ...prev, location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` }))
          toast.success('Location detected! 📍')
        } finally {
          setLocating(false)
        }
      },
      () => {
        toast.error('Could not get location!')
        setLocating(false)
      }
    )
  }

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!blog.title || !blog.content) {
      toast.error('Title and content are required!')
      return
    }
    setSaving(true)
    try {
      await addDoc(collection(db, 'blogs'), {
        ...blog,
        authorId: user.uid,
        authorName: user.displayName,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      })
      toast.success('Blog published! 🎉')
      router.push('/blogs')
    } catch (error) {
      toast.error('Failed to publish blog!')
    } finally {
      setSaving(false)
    }
  }

  const charsLeft = MAX_CHARS - blog.content.length
  const charsColor = charsLeft < 50 ? '#f85149' : charsLeft < 100 ? '#f59e0b' : 'var(--text-muted)'

  const inputStyle = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    width: '100%',
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
  }
  const focusIn = (e) => {
    e.target.style.borderColor = 'var(--accent)'
    e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'
  }
  const focusOut = (e) => {
    e.target.style.borderColor = 'var(--border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── Navbar ── */}
      <nav
        className="px-6 py-4 flex justify-between items-center sticky top-0 z-50"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
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
          onClick={() => router.push('/blogs')}
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          ← Back to Blogs
        </button>
      </nav>

      <div className="max-w-2xl mx-auto p-6">

        {/* ── Twitter-like Compose Card ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >

          {/* Card Header */}
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              👤
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {user?.displayName}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Share your travel story
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">

              {/* Title */}
              <input
                type="text"
                value={blog.title}
                onChange={(e) => setBlog({...blog, title: e.target.value})}
                placeholder="📌 Give your story a title..."
                required
                style={{
                  ...inputStyle,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  borderRadius: '0',
                  padding: '0.5rem 0',
                }}
                onFocus={e => { e.target.style.borderBottomColor = 'var(--accent)' }}
                onBlur={e => { e.target.style.borderBottomColor = 'var(--border)' }}
              />

              {/* Content */}
              <div style={{ position: 'relative' }}>
                <textarea
                  value={blog.content}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS)
                      setBlog({...blog, content: e.target.value})
                  }}
                  placeholder="What happened on your journey? Share your experience, tips, and memories..."
                  required
                  rows={6}
                  style={{
                    ...inputStyle,
                    background: 'transparent',
                    border: 'none',
                    padding: '0.5rem 0',
                    borderRadius: '0',
                    resize: 'none',
                    fontSize: '1rem',
                    lineHeight: '1.7',
                  }}
                  onFocus={e => {}}
                  onBlur={e => {}}
                />
                {/* Character counter */}
                <div className="flex justify-end mt-1">
                  <span style={{ fontSize: '0.78rem', color: charsColor, fontWeight: charsLeft < 100 ? 600 : 400 }}>
                    {charsLeft} characters left
                  </span>
                </div>
              </div>

              {/* Image preview */}
              {blog.imageUrl && (
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                  <img
                    src={blog.imageUrl}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setBlog({...blog, imageUrl: ''})}
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: 'rgba(0,0,0,0.7)', color: '#fff',
                      border: 'none', borderRadius: '50%',
                      width: '28px', height: '28px',
                      cursor: 'pointer', fontSize: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Location field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={blog.location}
                  onChange={(e) => setBlog({...blog, location: e.target.value})}
                  placeholder="📍 Add location..."
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: locating ? 'var(--text-muted)' : '#20b2aa',
                    borderRadius: '10px',
                    padding: '0 1rem',
                    cursor: locating ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  {locating ? '⏳' : '📍 Detect'}
                </button>
              </div>

              {/* Tags */}
              <input
                type="text"
                value={blog.tags}
                onChange={(e) => setBlog({...blog, tags: e.target.value})}
                placeholder="🏷️ Tags: travel, adventure, bali..."
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />

            </div>

            {/* ── Bottom Action Bar (Twitter style) ── */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--border)' }}
            >

              {/* Left — media actions */}
              <div className="flex items-center gap-2">

                {/* Upload photo button */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  title="Upload photo"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    color: uploading ? 'var(--text-muted)' : 'var(--accent)',
                    fontSize: '1.3rem',
                    padding: '6px',
                    borderRadius: '8px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {uploading ? '⏳' : '📷'}
                </button>

                {uploading && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Uploading...
                  </span>
                )}
              </div>

              {/* Right — publish button */}
              <button
                type="submit"
                disabled={saving || !blog.title || !blog.content}
                style={{
                  background: saving || !blog.title || !blog.content ? 'var(--surface-3)' : 'var(--accent)',
                  color: saving || !blog.title || !blog.content ? 'var(--text-muted)' : '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.55rem 1.4rem',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: saving || !blog.title || !blog.content ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!saving && blog.title && blog.content)
                    e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
                }}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {saving ? '⏳ Publishing...' : '🚀 Publish'}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  )
}