import { useState, useEffect } from 'react'

export const useGetForumReplies = (postId) => {
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchReplies = async () => {
    if (!postId) {
      setReplies([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/forum/replies?postId=${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch replies')
      }

      setReplies(data.replies || [])

    } catch (err) {
      console.error('Error fetching replies:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setReplies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReplies()
  }, [postId])

  const refetch = () => {
    fetchReplies()
  }

  return {
    replies,
    loading,
    error,
    refetch,
    clearError: () => setError(null)
  }
}
