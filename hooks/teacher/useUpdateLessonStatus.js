import { useState } from 'react'

export const useUpdateLessonStatus = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateLessonStatus = async (lessonId, status) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/teacher/lesson/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId, status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lesson status')
      }

      return { success: true, lesson: data.lesson }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update lesson status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return { updateLessonStatus, loading, error }
}
