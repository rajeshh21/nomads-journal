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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold">🌍 Nomads Journal</h1>
        <p className="mt-4 text-xl">Loading...</p>
      </div>
    </div>
  )
}