'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(
  () => import('@/components/Map'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">🗺️ Loading Map...</p>
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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1
          onClick={() => router.push('/dashboard')}
          className="text-2xl font-bold text-orange-500 cursor-pointer"
        >
          🌍 Nomads Journal
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>
      </nav>

      {/* Map Title */}
      <div className="bg-white px-6 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          🗺️ Travelers Around The World
        </h2>
        <button
          onClick={() => router.push('/profile')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          📍 Update My Location
        </button>
      </div>

      {/* Map Container */}
      <div style={{ height: 'calc(100vh - 130px)' }}>
        <MapComponent />
      </div>
    </div>
  )
}