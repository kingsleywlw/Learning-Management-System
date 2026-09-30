import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'

export const useEnrollCourse = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()

  const enrollInCourse = async (courseId) => {
    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll in course')
      }

      return data
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    enrollInCourse,
    loading,
    error,
    setError
  }
}