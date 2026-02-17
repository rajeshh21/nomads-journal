'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    travelStyle: '',
    interests: '',
    homeCountry: '',
    currentLocation: '',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (user) {
      fetchProfile()
    }
  }, [user, loading])

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setProfile({
          name: data.name || '',
          bio: data.bio || '',
          travelStyle: data.travelStyle || '',
          interests: data.interests || '',
          homeCountry: data.homeCountry || '',
          currentLocation: data.currentLocation || '',
        })
      }
    } catch (error) {
      toast.error('Error loading profile')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...profile,
      })
      toast.success('Profile updated! ✅')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          await updateDoc(doc(db, 'users', user.uid), {
            location: { latitude, longitude },
            currentLocation: profile.currentLocation,
          })
          toast.success('Location updated! 📍')
        },
        () => {
          toast.error('Could not get location!')
        }
      )
    }
  }

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
          ← Back to Dashboard
        </button>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            ✏️ Edit Profile
          </h3>

          <form onSubmit={handleSave} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                placeholder="Your full name"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell other travelers about yourself..."
                rows={3}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏠 Home Country
              </label>
              <input
                type="text"
                value={profile.homeCountry}
                onChange={(e) => setProfile({...profile, homeCountry: e.target.value})}
                placeholder="Where are you from?"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Current Location
              </label>
              <input
                type="text"
                value={profile.currentLocation}
                onChange={(e) => setProfile({...profile, currentLocation: e.target.value})}
                placeholder="Where are you right now?"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎒 Travel Style
              </label>
              <select
                value={profile.travelStyle}
                onChange={(e) => setProfile({...profile, travelStyle: e.target.value})}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-orange-400 bg-gray-50"
              >
                <option value="">Select travel style</option>
                <option value="budget">💰 Budget Traveler</option>
                <option value="luxury">✨ Luxury Traveler</option>
                <option value="adventure">🏔️ Adventure Seeker</option>
                <option value="cultural">🏛️ Cultural Explorer</option>
                <option value="digital-nomad">💻 Digital Nomad</option>
                <option value="backpacker">🎒 Backpacker</option>
                <option value="family">👨‍👩‍👧 Family Traveler</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ❤️ Interests
              </label>
              <input
                type="text"
                value={profile.interests}
                onChange={(e) => setProfile({...profile, interests: e.target.value})}
                placeholder="Food, hiking, photography, culture..."
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            {/* Location Button */}
            <button
              type="button"
              onClick={handleGetLocation}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition duration-200"
            >
              📍 Update My GPS Location
            </button>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition duration-200 text-lg"
            >
              {saving ? '⏳ Saving...' : '✅ Save Profile'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}