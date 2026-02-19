'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [travelers, setTravelers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  // Fetch all travelers
  useEffect(() => {
    if (!user) return
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.uid)
      setTravelers(data)
    })
    return unsubscribe
  }, [user])

  const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_')

  // Load messages
  useEffect(() => {
    if (!selectedUser || !user) return
    const chatId = getChatId(user.uid, selectedUser.id)
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMessages(msgs)
      scrollToBottom()
    })
    return unsubscribe
  }, [selectedUser, user])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return
    setSending(true)
    try {
      const chatId = getChatId(user.uid, selectedUser.id)
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName,
        createdAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'chats', chatId), {
        participants: [user.uid, selectedUser.id],
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
      })
      setNewMessage('')
      scrollToBottom()
    } catch (error) {
      toast.error('Failed to send message!')
    } finally {
      setSending(false)
    }
  }

  const filteredTravelers = travelers.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.currentLocation?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (timestamp) => {
    return timestamp?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">💬</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--background)' }}>

      {/* ── Navbar ── */}
      <nav
        className="px-6 py-4 flex justify-between items-center flex-shrink-0"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 50,
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
          ← Back
        </button>
      </nav>

      {/* ── Chat Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══════════════════════
            LEFT SIDEBAR
        ══════════════════════ */}
        <div
          className="flex flex-col flex-shrink-0"
          style={{
            width: '300px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
          }}
        >
          {/* Sidebar Header */}
          <div
            className="p-4 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2 className="font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              💬 Messages
            </h2>
            {/* Search travelers */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔍 Search travelers..."
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                borderRadius: '10px',
                padding: '0.5rem 0.85rem',
                width: '100%',
                outline: 'none',
                fontSize: '0.85rem',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent)'
                e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Travelers List */}
          <div className="overflow-y-auto flex-1">
            {filteredTravelers.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No travelers found</p>
              </div>
            ) : (
              filteredTravelers.map(traveler => (
                <div
                  key={traveler.id}
                  onClick={() => { setSelectedUser(traveler); setMessages([]) }}
                  className="cursor-pointer flex items-center gap-3 px-4 py-3"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: selectedUser?.id === traveler.id
                      ? 'var(--surface-2)'
                      : 'transparent',
                    borderLeft: selectedUser?.id === traveler.id
                      ? '3px solid var(--accent)'
                      : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (selectedUser?.id !== traveler.id)
                      e.currentTarget.style.background = 'var(--surface-2)'
                  }}
                  onMouseLeave={e => {
                    if (selectedUser?.id !== traveler.id)
                      e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-lg"
                    style={{
                      background: 'linear-gradient(135deg, #1a2a4a, #0d2b2b)',
                      border: '2px solid var(--border)',
                    }}
                  >
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {traveler.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {traveler.currentLocation || '🌍 Somewhere on Earth'}
                    </p>
                  </div>
                  {/* Online dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: 'var(--success)' }}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ══════════════════════
            RIGHT CHAT AREA
        ══════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative' }}>

          {selectedUser ? (
            <>
              {/* ── Chat Header ── */}
              <div
                className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
                style={{
                  background: 'var(--surface)',
                  borderBottom: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  zIndex: 10,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #1a2a4a, #0d2b2b)',
                    border: '2px solid var(--border)',
                  }}
                >
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {selectedUser.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--success)' }}>
                    ● Online
                  </p>
                </div>
                {selectedUser.currentLocation && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    📍 {selectedUser.currentLocation}
                  </span>
                )}
              </div>

              {/* ── Messages Area with background ── */}
              <div
                className="flex-1 overflow-y-auto px-5 py-4 space-y-2"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=60')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundAttachment: 'local',
                  position: 'relative',
                }}
              >
                {/* Dark overlay on chat background */}
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(13, 17, 23, 0.82)',
                    zIndex: 0,
                    pointerEvents: 'none',
                  }}
                />

                {/* Messages */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
                        style={{
                          background: 'rgba(22,27,34,0.9)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        👋
                      </div>
                      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Say hello to {selectedUser.name}!
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Start your travel conversation
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user.uid
                      const prevMsg = messages[idx - 1]
                      const showName = !isMine && prevMsg?.senderId !== msg.senderId

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          style={{ marginBottom: '4px' }}
                        >
                          {/* Other user avatar */}
                          {!isMine && (
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mr-2 self-end"
                              style={{
                                background: 'var(--surface-2)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              👤
                            </div>
                          )}

                          {/* Bubble */}
                          <div
                            style={{
                              maxWidth: '65%',
                              padding: '8px 14px',
                              borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              background: isMine
                                ? 'linear-gradient(135deg, #2f81f7, #1a6fd4)'
                                : 'rgba(33, 38, 45, 0.95)',
                              border: isMine
                                ? 'none'
                                : '1px solid rgba(48,54,61,0.8)',
                              boxShadow: isMine
                                ? '0 2px 12px rgba(47,129,247,0.3)'
                                : '0 2px 8px rgba(0,0,0,0.3)',
                              backdropFilter: !isMine ? 'blur(8px)' : 'none',
                            }}
                          >
                            <p
                              style={{
                                color: isMine ? '#fff' : 'var(--text-primary)',
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                                wordBreak: 'break-word',
                              }}
                            >
                              {msg.text}
                            </p>
                            <p
                              style={{
                                fontSize: '0.68rem',
                                marginTop: '4px',
                                textAlign: 'right',
                                color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                              }}
                            >
                              {formatTime(msg.createdAt)}
                              {isMine && ' ✓✓'}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* ── Message Input ── */}
              <form
                onSubmit={sendMessage}
                className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                style={{
                  background: 'var(--surface)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: '999px',
                    padding: '0.65rem 1.2rem',
                    outline: 'none',
                    fontSize: '0.9rem',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--accent)'
                    e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: sending || !newMessage.trim() ? 'var(--surface-3)' : 'var(--accent)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '1.1rem',
                    cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: !sending && newMessage.trim() ? '0 2px 12px rgba(47,129,247,0.4)' : 'none',
                  }}
                >
                  ➤
                </button>
              </form>
            </>
          ) : (
            /* ── No chat selected ── */
            <div
              className="flex-1 flex flex-col items-center justify-center text-center p-8"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=60')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(13,17,23,0.88)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-5"
                  style={{
                    background: 'rgba(22,27,34,0.9)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  💬
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Start Chatting!
                </h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '280px' }}>
                  Select a traveler from the left sidebar to start your conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}