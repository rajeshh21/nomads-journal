'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(
  () => import('@/components/Map'),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--surface)' }}
      >
        <div className="text-4xl">🗺️</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Map...</p>
      </div>
    )
  }
)

export default function MapPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  if (loading) return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--background)' }}
    >
      <div className="text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: 'var(--background)' }}
    >

      {/* ── Navbar ── */}
      <nav
        className="px-6 py-4 flex justify-between items-center flex-shrink-0"
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
          onClick={() => router.push('/dashboard')}
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
          ← Back
        </button>
      </nav>

      {/* ── Map Title Bar ── */}
      <div
        className="px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          🗺️ Travelers Around The World
        </h2>
        <button
          onClick={() => router.push('/profile')}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📍 Update My Location
        </button>
      </div>

      {/* ── Map fills remaining height exactly ── */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <MapComponent />
      </div>

    </div>
  )
}