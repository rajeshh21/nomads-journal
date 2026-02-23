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
  updateDoc,
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
  const [unreadCounts, setUnreadCounts] = useState({})
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  // Fetch all travelers — UNTOUCHED
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

  // Unread counts — UNTOUCHED
  useEffect(() => {
    if (!user || travelers.length === 0) return
    const unsubs = travelers.map(traveler => {
      const chatId = getChatId(user.uid, traveler.id)
      const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
      return onSnapshot(q, (snapshot) => {
        const unread = snapshot.docs.filter(d => {
          const msg = d.data()
          return msg.senderId !== user.uid && !msg.readBy?.includes(user.uid)
        }).length
        setUnreadCounts(prev => ({ ...prev, [traveler.id]: unread }))
      })
    })
    return () => unsubs.forEach(u => u())
  }, [user, travelers])

  // Load messages — UNTOUCHED
  useEffect(() => {
    if (!selectedUser || !user) return
    const chatId = getChatId(user.uid, selectedUser.id)
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMessages(msgs)
      scrollToBottom()
      const unreadDocs = snapshot.docs.filter(d => {
        const msg = d.data()
        return msg.senderId !== user.uid && !msg.readBy?.includes(user.uid)
      })
      for (const msgDoc of unreadDocs) {
        const existing = msgDoc.data().readBy || []
        await updateDoc(doc(db, 'chats', chatId, 'messages', msgDoc.id), {
          readBy: [...existing, user.uid]
        })
      }
    })
    return unsubscribe
  }, [selectedUser, user])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // sendMessage — UNTOUCHED
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
        readBy: [user.uid],
      })
      await setDoc(doc(db, 'chats', chatId), {
        participants: [user.uid, selectedUser.id],
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
      })
      setNewMessage('')
      scrollToBottom()
      inputRef.current?.focus()
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">💬</div>
        <p style={{ color: '#8b949e' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#0d1117' }}>

      {/* ══════════════════════════════════
          NAVBAR
      ══════════════════════════════════ */}
      <nav className="px-6 py-4 flex justify-between items-center flex-shrink-0" style={{
        background: 'linear-gradient(135deg, rgba(13,17,23,0.98), rgba(26,42,74,0.98))',
        borderBottom: '1px solid rgba(47,129,247,0.25)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
        zIndex: 50,
      }}>
        <h1
          onClick={() => router.push('/dashboard')}
          className="text-xl font-bold cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #20b2aa, #2f81f7, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 8px rgba(47,129,247,0.3))',
          }}
        >
          🌍 Nomads Journal
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'rgba(47,129,247,0.1)',
            border: '1px solid rgba(47,129,247,0.3)',
            color: '#e6edf3',
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(47,129,247,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(47,129,247,0.1)'}
        >← Back</button>
      </nav>

      {/* ══════════════════════════════════
          CHAT LAYOUT
      ══════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══════════════════════
            LEFT SIDEBAR
        ══════════════════════ */}
        <div
          className="flex flex-col flex-shrink-0"
          style={{
            width: '300px',
            background: 'linear-gradient(180deg, #1a2035 0%, #1e2640 100%)',
            borderRight: '1px solid rgba(47,129,247,0.2)',
            boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Sidebar Header */}
          <div
            className="p-4 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #252d45, #1e2640)',
              borderBottom: '1px solid rgba(47,129,247,0.2)',
            }}
          >
            <h2 className="font-bold text-lg mb-3" style={{
              background: 'linear-gradient(135deg, #20b2aa, #2f81f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              💬 Messages
            </h2>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search travelers..."
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(99,130,191,0.3)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                  width: '100%',
                  outline: 'none',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#2f81f7'
                  e.target.style.background = 'rgba(47,129,247,0.1)'
                  e.target.style.boxShadow = '0 0 0 2px rgba(47,129,247,0.2)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(99,130,191,0.3)'
                  e.target.style.background = 'rgba(255,255,255,0.08)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <span style={{
                position: 'absolute', left: '0.7rem', top: '50%',
                transform: 'translateY(-50%)', fontSize: '0.85rem',
                pointerEvents: 'none',
              }}>🔍</span>
            </div>
          </div>

          {/* Travelers List */}
          <div className="overflow-y-auto flex-1">
            {filteredTravelers.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-sm" style={{ color: '#8b949e' }}>No travelers found</p>
              </div>
            ) : (
              filteredTravelers.map(traveler => {
                const unread = unreadCounts[traveler.id] || 0
                const isSelected = selectedUser?.id === traveler.id

                return (
                  <div
                    key={traveler.id}
                    onClick={() => { setSelectedUser(traveler); setMessages([]) }}
                    className="cursor-pointer flex items-center gap-3 px-4 py-3"
                    style={{
                      borderBottom: '1px solid rgba(99,130,191,0.1)',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(47,129,247,0.2), rgba(32,178,170,0.1))'
                        : 'transparent',
                      borderLeft: isSelected ? '3px solid #2f81f7' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-lg overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #2d4a7a, #1a4a4a)',
                        border: unread > 0
                          ? '2px solid #2f81f7'
                          : '2px solid rgba(99,130,191,0.3)',
                        boxShadow: unread > 0 ? '0 0 8px rgba(47,129,247,0.4)' : 'none',
                      }}
                    >
                      {traveler.photoUrl
                        ? <img src={traveler.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '👤'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="text-sm truncate"
                          style={{
                            color: '#ffffff',
                            fontWeight: unread > 0 ? 700 : 500,
                          }}
                        >
                          {traveler.name}
                        </p>
                        {/* Unread badge */}
                        {unread > 0 && (
                          <span style={{
                            background: 'linear-gradient(135deg, #2f81f7, #20b2aa)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            minWidth: '20px',
                            height: '20px',
                            borderRadius: '999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 5px',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(47,129,247,0.4)',
                          }}>
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#8b949e' }}>
                        {traveler.currentLocation || '🌍 Somewhere on Earth'}
                      </p>
                    </div>

                    {/* Online dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        background: '#3fb950',
                        boxShadow: '0 0 6px rgba(63,185,80,0.6)',
                      }}
                    />
                  </div>
                )
              })
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
                  background: 'linear-gradient(135deg, #1a2035, #1e2640)',
                  borderBottom: '1px solid rgba(47,129,247,0.2)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                  zIndex: 10,
                }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #2d4a7a, #1a4a4a)',
                    border: '2px solid rgba(47,129,247,0.4)',
                    boxShadow: '0 0 10px rgba(47,129,247,0.2)',
                  }}
                >
                  {selectedUser.photoUrl
                    ? <img src={selectedUser.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '👤'}
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                    {selectedUser.name}
                  </p>
                  <p className="text-xs flex items-center gap-1" style={{ color: '#3fb950' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 6px rgba(63,185,80,0.8)' }} />
                    Online
                  </p>
                </div>
                {selectedUser.currentLocation && (
                  <span
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      color: '#20b2aa',
                      background: 'rgba(32,178,170,0.1)',
                      border: '1px solid rgba(32,178,170,0.2)',
                    }}
                  >
                    📍 {selectedUser.currentLocation}
                  </span>
                )}
              </div>

              {/* ── Messages Area ── */}
              <div
                className="flex-1 overflow-y-auto px-5 py-4"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=60')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundAttachment: 'local',
                  position: 'relative',
                }}
              >
                {/* Overlay */}
                <div style={{
                  position: 'fixed', inset: 0,
                  background: 'rgba(10,14,20,0.85)',
                  zIndex: 0, pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }} className="space-y-2">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
                        style={{
                          background: 'rgba(30,38,64,0.9)',
                          border: '1px solid rgba(47,129,247,0.3)',
                          boxShadow: '0 0 20px rgba(47,129,247,0.15)',
                        }}
                      >👋</div>
                      <p className="font-bold text-lg mb-1" style={{ color: '#ffffff' }}>
                        Say hello to {selectedUser.name}!
                      </p>
                      <p className="text-sm" style={{ color: '#8b949e' }}>
                        Start your travel conversation ✈️
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.senderId === user.uid
                      const isRead = msg.readBy?.includes(selectedUser.id)

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          style={{ marginBottom: '6px' }}
                        >
                          {/* Other user avatar */}
                          {!isMine && (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 mr-2 self-end overflow-hidden"
                              style={{
                                background: 'linear-gradient(135deg, #2d4a7a, #1a4a4a)',
                                border: '1px solid rgba(99,130,191,0.4)',
                              }}
                            >
                              {selectedUser.photoUrl
                                ? <img src={selectedUser.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '👤'}
                            </div>
                          )}

                          {/* Bubble */}
                          <div style={{
                            maxWidth: '65%',
                            padding: '10px 15px',
                            borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            background: isMine
                              ? 'linear-gradient(135deg, #2f81f7, #1a6fd4)'
                              : 'rgba(30,38,64,0.95)',
                            border: isMine
                              ? 'none'
                              : '1px solid rgba(99,130,191,0.25)',
                            boxShadow: isMine
                              ? '0 3px 15px rgba(47,129,247,0.35)'
                              : '0 2px 10px rgba(0,0,0,0.4)',
                          }}>
                            <p style={{
                              color: '#ffffff',
                              fontSize: '0.92rem',
                              lineHeight: '1.55',
                              wordBreak: 'break-word',
                            }}>
                              {msg.text}
                            </p>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '4px',
                              marginTop: '5px',
                            }}>
                              <span style={{
                                fontSize: '0.68rem',
                                color: isMine ? 'rgba(255,255,255,0.55)' : '#8b949e',
                              }}>
                                {formatTime(msg.createdAt)}
                              </span>
                              {/* Read / Unread ticks */}
                              {isMine && (
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: isRead ? '#60d4f7' : 'rgba(255,255,255,0.4)',
                                  letterSpacing: '-1px',
                                }}>
                                  {isRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* ══════════════════════════════════
                  COLORFUL MESSAGE INPUT BAR
              ══════════════════════════════════ */}
              <form
                onSubmit={sendMessage}
                className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #1a2035, #1e2640)',
                  borderTop: '1px solid rgba(47,129,247,0.25)',
                  boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {/* Colorful gradient input wrapper */}
                <div style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2f81f7, #20b2aa, #8b5cf6)',
                  borderRadius: '999px',
                  padding: '2px',
                  boxShadow: '0 0 16px rgba(47,129,247,0.3)',
                }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    autoComplete="off"
                    style={{
                      width: '100%',
                      background: '#1e2640',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '999px',
                      padding: '0.7rem 1.2rem',
                      outline: 'none',
                      fontSize: '0.95rem',
                      display: 'block',
                    }}
                    onFocus={e => {
                      e.target.parentElement.style.boxShadow = '0 0 24px rgba(47,129,247,0.6)'
                    }}
                    onBlur={e => {
                      e.target.parentElement.style.boxShadow = '0 0 16px rgba(47,129,247,0.3)'
                    }}
                  />
                </div>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: sending || !newMessage.trim()
                      ? 'rgba(99,130,191,0.2)'
                      : 'linear-gradient(135deg, #2f81f7, #20b2aa)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '1.1rem',
                    cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: !sending && newMessage.trim()
                      ? '0 4px 16px rgba(47,129,247,0.5)'
                      : 'none',
                  }}
                >➤</button>
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
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,14,20,0.88)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6"
                  style={{
                    background: 'rgba(30,38,64,0.9)',
                    border: '1px solid rgba(47,129,247,0.3)',
                    boxShadow: '0 0 30px rgba(47,129,247,0.2)',
                  }}
                >💬</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
                  Start Chatting!
                </h3>
                <p style={{ color: '#8b949e', maxWidth: '280px', lineHeight: '1.6' }}>
                  Select a traveler from the left sidebar to start your conversation ✈️
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}