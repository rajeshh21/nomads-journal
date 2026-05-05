'use client'
import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Nunito:wght@400;600;700&display=swap');
        .nj-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .nj-input:focus {
          outline: none;
          border-color: #5a7a45 !important;
          box-shadow: 0 0 0 3px rgba(90,122,69,0.15) !important;
        }
        .nj-input::placeholder { color: #b0a080; }
        .nj-btn:hover { background: #4a6836 !important; transform: translateY(-1px); }
        .nj-btn:active { transform: scale(0.99); }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif" }}>

        {/* Background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center 30%',
        }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(245,238,220,0.18)' }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(245,238,220,0.55) 0%, rgba(200,185,155,0.25) 100%)',
        }} />

        {/* Leaf — bottom left */}
        <svg style={{ position:'absolute', bottom:20, left:20, zIndex:5, width:130, pointerEvents:'none', opacity:0.7 }} viewBox="0 0 120 160" fill="none">
          <path d="M20 150 C20 150 10 80 60 40 C90 20 115 30 115 30 C115 30 100 60 80 80 C60 100 40 130 20 150Z" fill="#6a8a50" opacity="0.65"/>
          <path d="M20 150 C40 120 70 85 115 30" stroke="#4a6836" strokeWidth="1.5" fill="none" opacity="0.5"/>
        </svg>

        {/* Leaf — top right */}
        <svg style={{ position:'absolute', top:20, right:20, zIndex:5, width:110, pointerEvents:'none', opacity:0.7, transform:'rotate(180deg)' }} viewBox="0 0 120 160" fill="none">
          <path d="M20 150 C20 150 10 80 60 40 C90 20 115 30 115 30 C115 30 100 60 80 80 C60 100 40 130 20 150Z" fill="#6a8a50" opacity="0.65"/>
          <path d="M20 150 C40 120 70 85 115 30" stroke="#4a6836" strokeWidth="1.5" fill="none" opacity="0.5"/>
        </svg>

        {/* Card */}
        <div style={{
          position: 'relative', zIndex: 10,
          background: 'rgba(252,247,235,0.95)',
          borderRadius: 20,
          padding: '48px 44px',
          width: '100%', maxWidth: 420,
          margin: '0 16px',
          boxShadow: '0 24px 64px rgba(60,50,20,0.28)',
          border: '1px solid rgba(180,160,110,0.3)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}>

          {/* Globe icon */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, margin: '0 auto 16px',
              background: '#5a7a45', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, boxShadow: '0 4px 16px rgba(90,122,69,0.35)',
            }}>🌍</div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32, fontWeight: 900,
              color: '#2c3a1e', letterSpacing: '1px',
              textTransform: 'uppercase',
              lineHeight: 1.1, marginBottom: 8,
            }}>
              Nomads<br />Journal
            </h1>

            <p style={{
              fontSize: 13, color: '#7a6a40',
              fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              Welcome back, Explorer
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 2, background: 'linear-gradient(to right, transparent, rgba(90,122,69,0.4), transparent)', margin: '20px 0 28px' }} />

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#4a5a38', marginBottom:8, letterSpacing:'1.5px', textTransform:'uppercase' }}>
                Email Address
              </label>
              <input
                className="nj-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'rgba(255,253,245,0.85)',
                  border: '2px solid rgba(160,145,100,0.3)',
                  borderRadius: 10, fontSize: 14,
                  fontFamily: "'Nunito', sans-serif",
                  color: '#2c3a1e',
                }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#4a5a38', marginBottom:8, letterSpacing:'1.5px', textTransform:'uppercase' }}>
                Password
              </label>
              <input
                className="nj-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'rgba(255,253,245,0.85)',
                  border: '2px solid rgba(160,145,100,0.3)',
                  borderRadius: 10, fontSize: 14,
                  fontFamily: "'Nunito', sans-serif",
                  color: '#2c3a1e',
                }}
              />
            </div>

            <button
              type="submit"
              className="nj-btn"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading ? '#8aaa75' : '#5a7a45',
                color: '#f5eddc',
                border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                letterSpacing: '2.5px', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.15s',
                boxShadow: '0 4px 16px rgba(90,122,69,0.3)',
              }}
            >
              {loading ? 'Logging in...' : '🚀 Login'}
            </button>
          </form>

          {/* Register */}
          <div style={{ textAlign:'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(160,145,100,0.2)' }}>
            <span style={{ fontSize:13, color:'#7a6a40', fontWeight:600 }}>Don't have an account? </span>
            <Link href="/register" style={{
              color: '#5a7a45', fontWeight: 800, fontSize: 13,
              textDecoration: 'none', letterSpacing: '0.5px',
              borderBottom: '2px solid rgba(90,122,69,0.4)',
            }}>
              Create Account →
            </Link>
          </div>

        </div>

        {/* Bottom tagline */}
        <div style={{
          position:'absolute', bottom:22, left:0, right:0, zIndex:10,
          textAlign:'center', fontSize:11, color:'rgba(255,252,240,0.5)',
          fontWeight:700, letterSpacing:'2px', textTransform:'uppercase',
        }}>
          🌍 Connect with travelers around the world
        </div>

      </div>
    </>
  )
}