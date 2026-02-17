'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function DiscoverPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [travelers, setTravelers] = useState([])
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    if (!user) return router.push('/login')
  }, [user])

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        }
      )
    }
  }, [])

  // Fetch travelers
  useEffect(() => {
    if (!user) return
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(t => t.id !== user.uid && t.location)
          .map(t => ({
            ...t,
            distance: userLocation
              ? getDistance(userLocation, {
                  lat: t.location.latitude,
                  lng: t.location.longitude
                })
              : null
          }))
          .sort((a, b) => (a.distance || 999999) - (b.distance || 999999))
        setTravelers(data)
      }
    )
    return unsubscribe
  }, [user, userLocation])

  const getDistance = (loc1, loc2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 onClick={() => router.push('/dashboard')} className="text-2xl font-bold text-orange-500 cursor-pointer">
          🌍 Nomads Journal
        </h1>
        <button onClick={() => router.push('/dashboard')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
          ← Back
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🧭 Discover Travelers Nearby</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {travelers.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{t.name}</h3>
                  {t.distance && (
                    <p className="text-orange-500 text-sm font-semibold">📍 {t.distance} km away</p>
                  )}
                  {t.currentLocation && (
                    <p className="text-gray-500 text-sm">{t.currentLocation}</p>
                  )}
                  {t.bio && <p className="text-gray-600 text-sm mt-2">{t.bio}</p>}
                  {t.travelStyle && (
                    <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs mt-2">
                      {t.travelStyle}
                    </span>
                  )}
                  <button
                    onClick={() => router.push('/chat')}
                    className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600"
                  >
                    💬 Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {travelers.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl">
            <p className="text-4xl mb-2">🌍</p>
            <p className="text-gray-500">No travelers found nearby</p>
          </div>
        )}
      </div>
    </div>
  )
}