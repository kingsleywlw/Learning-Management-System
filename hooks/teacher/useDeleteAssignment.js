import { useState } from 'react'

export const useDeleteAssignment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteAssignment = async (assignmentId) => {
    try {
      setLoading(true)
      setError(null)

      // Validate assignment ID
      if (!assignmentId) {
        throw new Error('Assignment ID is required')
      }

      const response = await fetch(`/api/teacher/delete-assignment?assignmentId=${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete assignment')
      }

      return {
        success: true,
        deletedAssignmentId: data.deletedAssignmentId,
        message: data.message
      }

    } catch (err) {
      console.error('Error in useDeleteAssignment:', err)
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

  const clearError = () => {
    setError(null)
  }

  return {
    deleteAssignment,
    loading,
    error,
    clearError
  }
}