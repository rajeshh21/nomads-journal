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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-500">🌍 Nomads Journal</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hey, {user?.displayName}! 👋</span>
          <button
            onClick={handleLogout}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow p-6 col-span-full">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome to Nomads Journal! 🌍
            </h2>
            <p className="text-gray-500 mt-2">
              Connect with travelers, share your journey, explore the world!
            </p>
          </div>

          {/* Quick Links */}
          <div 
            onClick={() => router.push('/map')}
            className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-lg transition"
          >
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-xl font-bold text-gray-800">Explore Map</h3>
            <p className="text-gray-500 mt-1">See travelers around the world</p>
          </div>

          <div 
            onClick={() => router.push('/chat')}
            className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-lg transition"
          >
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-xl font-bold text-gray-800">Messages</h3>
            <p className="text-gray-500 mt-1">Chat with fellow travelers</p>
          </div>

          <div 
            onClick={() => router.push('/blogs')}
            className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-lg transition"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-bold text-gray-800">Blogs</h3>
            <p className="text-gray-500 mt-1">Read and write travel stories</p>
          </div>

          <div 
            onClick={() => router.push('/discover')}
            className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-lg transition"
          >
            <div className="text-4xl mb-3">🧭</div>
            <h3 className="text-xl font-bold text-gray-800">Discover</h3>
            <p className="text-gray-500 mt-1">Find nearby travelers</p>
          </div>

          <div 
            onClick={() => router.push('/profile')}
            className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-lg transition"
          >
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-xl font-bold text-gray-800">My Profile</h3>
            <p className="text-gray-500 mt-1">Edit your traveler profile</p>
          </div>

        </div>
      </div>
    </div>
  )
}
