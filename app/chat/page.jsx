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
  getDoc,
  getDocs,
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
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  // Fetch all travelers
  useEffect(() => {
    if (!user) return
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== user.uid)
        setTravelers(data)
      }
    )
    return unsubscribe
  }, [user])

  // Get chat ID
  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_')
  }

  // Load messages when user selected
  useEffect(() => {
    if (!selectedUser || !user) return
    const chatId = getChatId(user.uid, selectedUser.id)
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
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
      
      // Save message
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName,
        createdAt: serverTimestamp(),
      })

      // Update chat metadata
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

      {/* Chat Layout */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow overflow-hidden flex" style={{ height: 'calc(100vh - 140px)' }}>
          
          {/* Left Sidebar - Travelers List */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b bg-orange-50">
              <h2 className="font-bold text-gray-800">💬 Messages</h2>
              <p className="text-sm text-gray-500">Chat with travelers</p>
            </div>

            <div className="overflow-y-auto flex-1">
              {travelers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-4xl mb-2">👥</p>
                  <p>No travelers yet!</p>
                  <p className="text-sm">Register more users to chat</p>
                </div>
              ) : (
                travelers.map(traveler => (
                  <div
                    key={traveler.id}
                    onClick={() => setSelectedUser(traveler)}
                    className={`p-4 cursor-pointer hover:bg-orange-50 border-b transition ${
                      selectedUser?.id === traveler.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{traveler.name}</p>
                        <p className="text-xs text-gray-500">{traveler.currentLocation || 'Unknown location'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-orange-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{selectedUser.name}</p>
                    <p className="text-xs text-green-500">● Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      <p className="text-4xl mb-2">👋</p>
                      <p>Say hello to {selectedUser.name}!</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            msg.senderId === user.uid
                              ? 'bg-orange-500 text-white rounded-br-none'
                              : 'bg-gray-200 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderId === user.uid ? 'text-orange-200' : 'text-gray-500'
                          }`}>
                            {msg.createdAt?.toDate?.()?.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-2 text-gray-800 focus:outline-none focus:border-orange-400"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold transition"
                  >
                    {sending ? '...' : '➤'}
                  </button>
                </form>
              </>
            ) : (
              // No chat selected
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-6xl mb-4">💬</p>
                  <h3 className="text-xl font-bold text-gray-700">Start Chatting!</h3>
                  <p className="mt-2">Select a traveler from the left to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}