'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function CreateBlogPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [blog, setBlog] = useState({
    title: '',
    content: '',
    location: '',
    tags: '',
    imageUrl: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!blog.title || !blog.content) {
      toast.error('Title and content are required!')
      return
    }
    setSaving(true)
    try {
      await addDoc(collection(db, 'blogs'), {
        ...blog,
        authorId: user.uid,
        authorName: user.displayName,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      })
      toast.success('Blog published! 🎉')
      router.push('/blogs')
    } catch (error) {
      toast.error('Failed to publish blog!')
    } finally {
      setSaving(false)
    }
  }

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
          onClick={() => router.push('/blogs')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        >
          ← Back to Blogs
        </button>
      </nav>

      {/* Form */}
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ✍️ Write Your Travel Story
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📌 Blog Title
              </label>
              <input
                type="text"
                value={blog.title}
                onChange={(e) => setBlog({...blog, title: e.target.value})}
                placeholder="My Amazing Adventure in Bali..."
                required
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Location
              </label>
              <input
                type="text"
                value={blog.location}
                onChange={(e) => setBlog({...blog, location: e.target.value})}
                placeholder="Bali, Indonesia"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🖼️ Image URL (optional)
              </label>
              <input
                type="url"
                value={blog.imageUrl}
                onChange={(e) => setBlog({...blog, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
              {blog.imageUrl && (
                <img
                  src={blog.imageUrl}
                  alt="Preview"
                  className="mt-2 w-full h-40 object-cover rounded-xl"
                />
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Your Story
              </label>
              <textarea
                value={blog.content}
                onChange={(e) => setBlog({...blog, content: e.target.value})}
                placeholder="Share your travel experience, tips, and memories..."
                required
                rows={10}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏷️ Tags (comma separated)
              </label>
              <input
                type="text"
                value={blog.tags}
                onChange={(e) => setBlog({...blog, tags: e.target.value})}
                placeholder="travel, adventure, backpacking, asia"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-gray-50"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition duration-200 text-lg"
            >
              {saving ? '⏳ Publishing...' : '🚀 Publish Blog'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}