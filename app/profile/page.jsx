'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

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
    photoUrl: '',
  })

  // ── New: photo upload state ──
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (user) {
      fetchProfile()
    }
  }, [user, loading])

  // fetchProfile — UNTOUCHED, just added photoUrl
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
          photoUrl: data.photoUrl || '',
        })
      }
    } catch (error) {
      toast.error('Error loading profile')
    }
  }

  // handleSave — UNTOUCHED, just saves photoUrl too
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

  // handleGetLocation — UNTOUCHED
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

  // ── New: Upload photo to Cloudinary ──
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB!')
      return
    }
    setUploadingPhoto(true)
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
        const photoUrl = data.secure_url
        setProfile(prev => ({ ...prev, photoUrl }))
        await updateDoc(doc(db, 'users', user.uid), { photoUrl })
        toast.success('Profile photo updated! 🎉')
      } else {
        toast.error('Upload failed!')
      }
    } catch (error) {
      toast.error('Upload failed!')
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">👤</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  )

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
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-2xl mx-auto p-6">

        {/* ── Profile Header Card ── */}
        <div
          className="rounded-2xl p-8 mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #0d1f3a 0%, #0d1117 100%)',
            border: '1px solid rgba(47,129,247,0.3)',
            boxShadow: '0 4px 24px rgba(47,129,247,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '150px', height: '150px', borderRadius: '50%',
            background: 'rgba(47,129,247,0.07)', filter: 'blur(30px)',
          }} />

          {/* ── Profile Photo with upload ── */}
          <div className="relative inline-block mb-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto overflow-hidden"
              style={{
                background: 'var(--surface-2)',
                border: '3px solid rgba(47,129,247,0.4)',
                boxShadow: '0 0 20px rgba(47,129,247,0.2)',
                fontSize: '2.5rem',
              }}
            >
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                '👤'
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: uploadingPhoto ? 'var(--surface-3)' : 'var(--accent)',
                border: '2px solid var(--background)',
                color: '#fff',
                fontSize: '0.75rem',
                cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
              title="Change photo"
            >
              {uploadingPhoto ? '⏳' : '📷'}
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>

          {uploadingPhoto && (
            <p className="text-xs mb-2" style={{ color: 'var(--accent)' }}>
              ⏳ Uploading photo...
            </p>
          )}

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {profile.name || 'Your Name'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
          {profile.travelStyle && (
            <span
              className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(47,129,247,0.15)',
                color: '#2f81f7',
                border: '1px solid rgba(47,129,247,0.3)',
              }}
            >
              🎒 {profile.travelStyle}
            </span>
          )}

          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Click 📷 to change your profile photo
          </p>
        </div>

        {/* ── Edit Form Card ── */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            ✏️ Edit Profile
          </h3>

          <form onSubmit={handleSave} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>👤 Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})}
                placeholder="Your full name" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>📝 Bio</label>
              <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell other travelers about yourself..." rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>🏠 Home Country</label>
              <input type="text" value={profile.homeCountry} onChange={(e) => setProfile({...profile, homeCountry: e.target.value})}
                placeholder="Where are you from?" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>📍 Current Location</label>
              <input type="text" value={profile.currentLocation} onChange={(e) => setProfile({...profile, currentLocation: e.target.value})}
                placeholder="Where are you right now?" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>🎒 Travel Style</label>
              <select value={profile.travelStyle} onChange={(e) => setProfile({...profile, travelStyle: e.target.value})}
                style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
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
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>❤️ Interests</label>
              <input type="text" value={profile.interests} onChange={(e) => setProfile({...profile, interests: e.target.value})}
                placeholder="Food, hiking, photography, culture..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

            {/* GPS — UNTOUCHED */}
            <button
              type="button"
              onClick={handleGetLocation}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0d2b2b 0%, #134e4a 100%)',
                color: '#20b2aa',
                border: '1px solid rgba(32,178,170,0.4)',
                fontWeight: '700', fontSize: '0.95rem',
                padding: '0.8rem', borderRadius: '10px',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(32,178,170,0.25)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              📍 Update My GPS Location
            </button>

            {/* Save — UNTOUCHED */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background: saving ? 'var(--surface-3)' : 'var(--accent)',
                color: '#fff', fontWeight: '700', fontSize: '1rem',
                padding: '0.8rem', borderRadius: '10px',
                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {saving ? '⏳ Saving...' : '✅ Save Profile'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}