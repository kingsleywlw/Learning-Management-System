import { useState } from 'react'

export const useCreateForumReply = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createReply = async (postId, content) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/forum/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, content })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create reply')
      }

      setSuccess(true)
      return {
        success: true,
        reply: data.reply,
        message: data.message || 'Reply created successfully'
      }

    } catch (err) {
      console.error('Error creating reply:', err)
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
    createReply,
    loading,
    error,
    success,
    clearError,
    clearSuccess
  }
}