import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

export const useGetAvailableCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken, isSignedIn } = useAuth()

  const fetchCourses = async () => {
    if (!isSignedIn) return

    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      
      const response = await fetch('/api/student/available-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch available courses')
      }

      setCourses(data.courses)
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Error fetching available courses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [isSignedIn])

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  }
}