import { useState, useEffect } from 'react'

export const useGetForumPosts = (category = 'all', sortBy = 'recent') => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (category !== 'all') params.append('category', category)
      if (sortBy) params.append('sortBy', sortBy)

      const response = await fetch(`/api/forum/posts?${params.toString()}`, {
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
        throw new Error(data.error || 'Failed to fetch forum posts')
      }

      setPosts(data.posts || [])

    } catch (err) {
      console.error('Error fetching forum posts:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [category, sortBy])

  const refetch = () => {
    fetchPosts()
  }

  return {
    posts,
    loading,
    error,
    refetch,
    clearError: () => setError(null)
  }
}