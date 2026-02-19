'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out!')
      router.push('/login')
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--background)' }}
    >
      <div className="text-center">
        <div className="text-4xl mb-4">🌍</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── Navbar ── */}
      <nav
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
        className="px-6 py-4 flex justify-between items-center sticky top-0 z-50"
      >
        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          🌍 Nomads Journal
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden md:block" style={{ color: 'var(--text-secondary)' }}>
            Hey, <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.displayName}</span>! 👋
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = 'var(--danger)'
              e.target.style.color = 'var(--danger)'
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.color = 'var(--text-secondary)'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto p-6">

        {/* Welcome Banner */}
        <div
          className="rounded-2xl p-8 mb-8 mt-4"
          style={{
            background: 'linear-gradient(135deg, #1a2a4a 0%, #0d1117 100%)',
            border: '1px solid rgba(47, 129, 247, 0.25)',
            boxShadow: '0 0 40px rgba(47, 129, 247, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative blur blob */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(47, 129, 247, 0.08)',
            filter: 'blur(40px)',
          }} />
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {user?.displayName}! 🌍
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Connect with travelers, share your journey, explore the world!
          </p>
        </div>

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Map Card — Teal */}
          <div
            onClick={() => router.push('/map')}
            className="rounded-2xl p-6 cursor-pointer transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #0d2b2b 0%, #0d1117 100%)',
              border: '1px solid rgba(32, 178, 170, 0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(32, 178, 170, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(32, 178, 170, 0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(32, 178, 170, 0.3)'
            }}
          >
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#20b2aa' }}>Explore Map</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>See travelers around the world</p>
          </div>

          {/* Chat Card — Purple */}
          <div
            onClick={() => router.push('/chat')}
            className="rounded-2xl p-6 cursor-pointer transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #1e1a35 0%, #0d1117 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
            }}
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#8b5cf6' }}>Messages</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chat with fellow travelers</p>
          </div>

          {/* Blogs Card — Amber */}
          <div
            onClick={() => router.push('/blogs')}
            className="rounded-2xl p-6 cursor-pointer transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #2b1f0a 0%, #0d1117 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(245, 158, 11, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'
            }}
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#f59e0b' }}>Blogs</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Read and write travel stories</p>
          </div>

          {/* Discover Card — Rose */}
          <div
            onClick={() => router.push('/discover')}
            className="rounded-2xl p-6 cursor-pointer transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #2b0f1a 0%, #0d1117 100%)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(244, 63, 94, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)'
            }}
          >
            <div className="text-4xl mb-4">🧭</div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#f43f5e' }}>Discover</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Find nearby travelers</p>
          </div>

          {/* Profile Card — Blue */}
          <div
            onClick={() => router.push('/profile')}
            className="rounded-2xl p-6 cursor-pointer transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #091b36 0%, #0d1117 100%)',
              border: '1px solid rgba(47, 129, 247, 0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(47, 129, 247, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(47, 129, 247, 0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(47, 129, 247, 0.3)'
            }}
          >
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#2f81f7' }}>My Profile</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Edit your traveler profile</p>
          </div>

        </div>
      </div>
    </div>
  )
}