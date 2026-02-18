'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">

        {/* Globe icon with glow ring */}
        <div className="flex items-center justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            🌍
          </div>
        </div>

        {/* Headline — clearly visible on dark */}
        <h1
          className="text-4xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Nomads Journal
        </h1>

        {/* Tagline */}
        <p
          className="text-base mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          Your world. Your story.
        </p>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <svg
            className="animate-spin w-4 h-4"
            style={{ color: 'var(--accent)' }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-sm">Loading...</span>
        </div>

      </div>
    </div>
  )
}