'use client'
import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gap-16 relative overflow-hidden">

      {/* ── Full screen background image ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ── Dark overlay so card is readable ── */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: 'rgba(0, 0, 0, 0.62)' }}
      />

      {/* ── Bottom gradient fade for depth ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to top, rgba(13,17,23,0.95) 0%, transparent 60%)',
        }}
      />
      {/* ── Left side text ── */}
<div className="relative z-20 max-w-sm hidden md:block">
  <h2 className="text-5xl font-bold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
    Explore the world, your way.
  </h2>
  <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
    Connect with solo travelers, share your journey, and discover people who wander like you do.
  </p>
</div>

      {/* ── Login Card ── */}
      <div
        className="relative z-20 rounded-2xl p-8 w-full max-w-md mx-4"
        style={{
          background: 'rgba(22, 27, 34, 0.85)',
          border: '1px solid rgba(48, 54, 61, 0.8)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            🌍
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Nomads Journal
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Welcome back, traveler!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                background: 'rgba(33, 38, 45, 0.9)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                width: '100%',
                outline: 'none',
                fontSize: '0.95rem',
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

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              🔒 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                background: 'rgba(33, 38, 45, 0.9)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                width: '100%',
                outline: 'none',
                fontSize: '0.95rem',
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'var(--surface-3)' : 'var(--accent)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '1rem',
              padding: '0.8rem',
              borderRadius: '10px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease, box-shadow 0.2s ease',
              marginTop: '0.5rem',
            }}
            onMouseEnter={e => {
              if (!loading) e.target.style.boxShadow = 'var(--shadow-glow)'
            }}
            onMouseLeave={e => {
              e.target.style.boxShadow = 'none'
            }}
          >
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1" style={{ borderTop: '1px solid var(--border)' }}></div>
          <span className="px-4 text-sm" style={{ color: 'var(--text-muted)' }}>or</span>
          <div className="flex-1" style={{ borderTop: '1px solid var(--border)' }}></div>
        </div>

        {/* Register Link */}
        <div
          className="text-center rounded-xl p-4"
          style={{
            background: 'rgba(33, 38, 45, 0.6)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?
          </p>
          <Link
            href="/register"
            className="font-bold text-base"
            style={{ color: 'var(--accent)' }}
          >
            Create Account →
          </Link>
        </div>

      </div>

      {/* ── Bottom tagline over image ── */}
      <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          🌍 Connect with travelers around the world
        </p>
      </div>

    </div>
  )
}