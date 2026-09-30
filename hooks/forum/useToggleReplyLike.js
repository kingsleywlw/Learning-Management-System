import { useState } from 'react'

export const useToggleReplyLike = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggleLike = async (replyId) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/forum/replies/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to toggle like')
      }

      return {
        success: true,
        liked: data.liked,
        likeCount: data.likeCount
      }

    } catch (err) {
      console.error('Error toggling reply like:', err)
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

  return {
    toggleLike,
    loading,
    error,
    clearError
  }
}