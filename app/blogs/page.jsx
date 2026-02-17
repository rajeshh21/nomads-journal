'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function BlogsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [blogs, setBlogs] = useState([])
  const [loadingBlogs, setLoadingBlogs] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  // Fetch blogs real-time
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'blogs'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setBlogs(data)
      setLoadingBlogs(false)
    })
    return unsubscribe
  }, [user])

  const handleDelete = async (blogId, authorId) => {
    if (authorId !== user.uid) return
    if (!confirm('Delete this blog?')) return
    try {
      await deleteDoc(doc(db, 'blogs', blogId))
      toast.success('Blog deleted!')
    } catch (error) {
      toast.error('Failed to delete!')
    }
  }

  const handleLike = async (blog) => {
    const likes = blog.likes || []
    const alreadyLiked = likes.includes(user.uid)
    try {
      await updateDoc(doc(db, 'blogs', blog.id), {
        likes: alreadyLiked
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid)
      })
    } catch (error) {
      toast.error('Failed to like!')
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

      {/* Header */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📝 Travel Blogs
          </h2>
          <button
            onClick={() => router.push('/blogs/create')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold transition"
          >
            + Write Blog
          </button>
        </div>

        {/* Blogs List */}
        {loadingBlogs ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl shadow">
            <p className="text-6xl mb-4">📝</p>
            <h3 className="text-xl font-bold text-gray-700">No blogs yet!</h3>
            <p className="text-gray-500 mt-2">Be the first to share your travel story!</p>
            <button
              onClick={() => router.push('/blogs/create')}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl font-bold"
            >
              Write First Blog
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-2xl shadow overflow-hidden">
                
                {/* Blog Image */}
                {blog.imageUrl && (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                {/* Blog Content */}
                <div className="p-6">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{blog.authorName}</p>
                      <p className="text-xs text-gray-500">
                        {blog.location && `📍 ${blog.location} • `}
                        {blog.createdAt?.toDate?.()?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {blog.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.content}
                  </p>

                  {/* Tags */}
                  {blog.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.split(',').map((tag, i) => (
                        <span
                          key={i}
                          className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-4">
                      {/* Like Button */}
                      <button
                        onClick={() => handleLike(blog)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                          blog.likes?.includes(user.uid)
                            ? 'bg-red-100 text-red-500'
                            : 'bg-gray-100 text-gray-500 hover:bg-red-50'
                        }`}
                      >
                        {blog.likes?.includes(user.uid) ? '❤️' : '🤍'}
                        <span>{blog.likes?.length || 0}</span>
                      </button>

                      {/* Comments count */}
                      <span className="text-gray-500 text-sm">
                        💬 {blog.comments?.length || 0} comments
                      </span>
                    </div>

                    {/* Delete Button (only for author) */}
                    {blog.authorId === user.uid && (
                      <button
                        onClick={() => handleDelete(blog.id, blog.authorId)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}