import { useState } from 'react'

export const useCreateAssignment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createAssignment = async (assignmentData) => {
    try {
      setLoading(true)
      setError(null)

      // Validate required fields
      if (!assignmentData.title || !assignmentData.description || !assignmentData.dueDate || !assignmentData.courseId) {
        throw new Error('All fields are required')
      }

      // Validate title length
      if (assignmentData.title.trim().length < 3) {
        throw new Error('Assignment title must be at least 3 characters long')
      }

      // Validate description length
      if (assignmentData.description.trim().length < 10) {
        throw new Error('Assignment description must be at least 10 characters long')
      }

      // Validate due date is in the future
      const dueDate = new Date(assignmentData.dueDate)
      const now = new Date()
      
      if (dueDate <= now) {
        throw new Error('Due date must be in the future')
      }

      const response = await fetch('/api/teacher/create-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: assignmentData.title.trim(),
          description: assignmentData.description.trim(),
          dueDate: assignmentData.dueDate,
          courseId: assignmentData.courseId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create assignment')
      }

      return {
        success: true,
        assignment: data.assignment,
        message: data.message
      }

    } catch (err) {
      console.error('Error in useCreateAssignment:', err)
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
    createAssignment,
    loading,
    error,
    clearError
  }
}