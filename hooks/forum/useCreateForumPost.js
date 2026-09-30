import { useState } from 'react'

export const useCreateForumPost = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createPost = async (title, content, category = 'General') => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, category })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create post')
      }

      setSuccess(true)
      return {
        success: true,
        post: data.post,
        message: data.message || 'Post created successfully'
      }

    } catch (err) {
      console.error('Error creating forum post:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)
  const clearSuccess = () => setSuccess(false)

  return {
    createPost,
    loading,
    error,
    success,
    clearError,
    clearSuccess
  }
}
