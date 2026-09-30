'use client'

import React, { useState } from 'react'
import { MessageSquare, Plus, Send, User, Clock, ThumbsUp, MessageCircle, Filter } from 'lucide-react'
import { useGetForumPosts } from '@/hooks/forum/useGetForumPosts'
import { useCreateForumPost } from '@/hooks/forum/useCreateForumPost'
import { useTogglePostLike } from '@/hooks/forum/useTogglePostLike'
import { useGetForumReplies } from '@/hooks/forum/useGetForumReplies'
import { useCreateForumReply } from '@/hooks/forum/useCreateForumReply'
import { useUser } from '@clerk/nextjs'

export default function ForumPage() {
  const { user } = useUser()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const { posts, loading: postsLoading, refetch: refetchPosts } = useGetForumPosts(selectedCategory, sortBy)
  const { createPost, loading: createLoading } = useCreateForumPost()
  const { toggleLike } = useTogglePostLike()
  const { replies, loading: repliesLoading, refetch: refetchReplies } = useGetForumReplies(selectedPostId)
  const { createReply, loading: replyLoading } = useCreateForumReply()

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General'
  })

  const categories = ['all', 'General', 'Teaching Strategies', 'Assessment', 'Course Design', 'Technology', 'Student Engagement', 'Help & Support', 'Announcements']

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createPost(newPost.title, newPost.content, newPost.category)
    if (result.success) {
      setNewPost({ title: '', content: '', category: 'General' })
      setShowNewPostForm(false)
      refetchPosts()
    }
  }

  const handleLike = async (postId: string) => {
    await toggleLike(postId)
    refetchPosts()
  }

  const handleReplySubmit = async (postId: string) => {
    if (!replyText.trim()) return
    
    const result = await createReply(postId, replyText)
    if (result.success) {
      setReplyText('')
      refetchReplies()
      refetchPosts() // Refresh posts to update reply count
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const posted = new Date(timestamp)
    const diffMs = now.getTime() - posted.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forum</h1>
              <p className="text-gray-600">Connect and collaborate with the community</p>
            </div>
            <button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Discussion
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* New Post Form */}
        {showNewPostForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Start a New Discussion</h2>
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.filter(cat => cat !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Enter discussion title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewPostForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:bg-gray-400"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createLoading ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        {postsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading discussions...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Discussions Yet</h3>
            <p className="text-gray-600 mb-4">Start the conversation by creating a new discussion.</p>
            <button
              onClick={() => setShowNewPostForm(true)}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Discussion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{post.authorId?.name || 'Anonymous'}</h3>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {getTimeAgo(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>

                {/* Post Content */}
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Post Actions */}
                <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                  </button>
                  <button 
                    onClick={() => setSelectedPostId(selectedPostId === post._id ? null : post._id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.replyCount || 0} Replies</span>
                  </button>
                </div>

                {/* Replies Section */}
                {selectedPostId === post._id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Replies</h3>
                    
                    {repliesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : replies.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No replies yet. Be the first to reply!</p>
                    ) : (
                      <div className="space-y-4 mb-4">
                        {replies.map((reply) => (
                          <div key={reply._id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start space-x-3 mb-2">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">{reply.authorId?.name || 'Anonymous'}</h4>
                                  <span className="text-xs text-gray-500">{getTimeAgo(reply.createdAt)}</span>
                                </div>
                                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{reply.content}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors text-sm">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{reply.likes?.length || 0}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply Input */}
                    <div className="flex space-x-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleReplySubmit(post._id)}
                        disabled={replyLoading || !replyText.trim()}
                        className="self-end bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:bg-gray-400"
                      >
                        {replyLoading ? 'Sending...' : 'Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}