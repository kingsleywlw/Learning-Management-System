import { useState } from 'react'

export const useUpdateAssignmentStatus = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateAssignmentStatus = async (assignmentId, status) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/teacher/assignment/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentId, status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update assignment status')
      }

      return { success: true, assignment: data.assignment }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update assignment status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return { updateAssignmentStatus, loading, error }
}
