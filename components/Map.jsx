'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

// ── CRITICAL FIX: Import Leaflet CSS here ──
import 'leaflet/dist/leaflet.css'

export default function Map() {
  const [travelers, setTravelers] = useState([])
  const [isMounted, setIsMounted] = useState(false)
  const [MapComponents, setMapComponents] = useState(null)

  useEffect(() => {
    setIsMounted(true)
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
    <div
      className="h-full w-full flex flex-col items-center justify-center gap-3"
      style={{ background: 'var(--surface)' }}
    >
      <div className="text-4xl">🗺️</div>
      <p style={{ color: 'var(--text-secondary)' }}>Loading Map...</p>
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
            <div style={{ padding: '8px', minWidth: '160px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '36px', height: '36px',
                  background: '#1a2a4a',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  👤
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a2e' }}>{traveler.name}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{traveler.travelStyle}</div>
                </div>
              </div>
              {traveler.bio && (
                <p style={{ fontSize: '12px', color: '#444', marginBottom: '6px' }}>{traveler.bio}</p>
              )}
              {traveler.currentLocation && (
                <p style={{ fontSize: '11px', color: '#2f81f7', fontWeight: 600 }}>
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