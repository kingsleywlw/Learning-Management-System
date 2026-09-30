import { useState } from 'react'

export const useSubmitAssignment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const submitAssignment = async (assignmentId, pdfFile) => {
    // Validation
    if (!assignmentId) {
      setError('Assignment ID is required.')
      return { success: false, error: 'Assignment ID is required.' }
    }

    if (!pdfFile) {
      setError('PDF file is required.')
      return { success: false, error: 'PDF file is required.' }
    }

    // Validate file type
    if (pdfFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed.')
      return { success: false, error: 'Only PDF files are allowed.' }
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (pdfFile.size > maxSize) {
      setError('PDF file size must not exceed 10MB.')
      return { success: false, error: 'PDF file size must not exceed 10MB.' }
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Create form data
      const formData = new FormData()
      formData.append('assignmentId', assignmentId)
      formData.append('pdfFile', pdfFile)

      // Send the request
      const response = await fetch('/api/student/submit-assignment', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit assignment')
      }

      setSuccess(true)
      return { 
        success: true, 
        submission: data.submission,
        message: data.message 
      }

    } catch (err) {
      console.error('Error submitting assignment:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setSuccess(false)
      return { success: false, error: errorMessage }

    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const clearSuccess = () => {
    setSuccess(false)
  }

  return {
    submitAssignment,
    loading,
    error,
    success,
    clearError,
    clearSuccess
  }
}
