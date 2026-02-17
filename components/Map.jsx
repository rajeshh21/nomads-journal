'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

export default function Map() {
  const [travelers, setTravelers] = useState([])
  const [isMounted, setIsMounted] = useState(false)
  const [MapComponents, setMapComponents] = useState(null)

  useEffect(() => {
    setIsMounted(true)
    // Dynamically import leaflet (fixes Next.js SSR issue)
    const loadMap = async () => {
      const L = await import('leaflet')
      const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet')
      
      // Fix leaflet marker icon issue
      delete L.default.Icon.Default.prototype._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      setMapComponents({ MapContainer, TileLayer, Marker, Popup })
    }
    loadMap()
  }, [])

  // Real-time travelers from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.location)
        setTravelers(data)
      }
    )
    return unsubscribe
  }, [])

  if (!isMounted || !MapComponents) return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-500 text-lg">🗺️ Loading Map...</p>
    </div>
  )

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {travelers.map(traveler => (
        <Marker
          key={traveler.id}
          position={[
            traveler.location.latitude,
            traveler.location.longitude
          ]}
        >
          <Popup>
            <div className="p-2 min-w-40">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{traveler.name}</h3>
                  <p className="text-xs text-gray-500">{traveler.travelStyle}</p>
                </div>
              </div>
              {traveler.bio && (
                <p className="text-sm text-gray-600 mb-2">{traveler.bio}</p>
              )}
              {traveler.currentLocation && (
                <p className="text-xs text-orange-500">
                  📍 {traveler.currentLocation}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}