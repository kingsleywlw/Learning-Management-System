import { useState, useEffect } from 'react'

export const useGetStudentSubmissions = (studentId, courseId) => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStudentSubmissions = async () => {
    if (!studentId || !courseId) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/student/submissions?studentId=${studentId}&courseId=${courseId}`, {
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
        throw new Error(data.error || 'Failed to fetch student submissions')
      }

      console.log('Fetched submissions:', data.submissions)
      setSubmissions(data.submissions || [])

    } catch (err) {
      console.error('Error fetching student submissions:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch submissions when studentId or courseId changes
  useEffect(() => {
    fetchStudentSubmissions()
  }, [studentId, courseId])

  // Helper function to get submission for a specific assignment
  const getSubmissionForAssignment = (assignmentId) => {
    const submission = submissions.find(sub => {
      // Handle both populated and non-populated assignmentId
      const subAssignmentId = sub.assignmentId?._id || sub.assignmentId
      const subAssignmentIdStr = typeof subAssignmentId === 'object' 
        ? subAssignmentId.toString() 
        : subAssignmentId
      
      return subAssignmentIdStr === assignmentId || subAssignmentIdStr === assignmentId.toString()
    })
    console.log('Getting submission for assignment:', assignmentId, 'Found:', submission)
    return submission || null
  }

  // Helper function to get grade for a specific assignment
  const getGradeForAssignment = (assignmentId) => {
    const submission = getSubmissionForAssignment(assignmentId)
    return submission ? submission.grade : 'N' // Default to 'N' (Not graded yet)
  }

  // Helper function to get status for a specific assignment
  const getStatusForAssignment = (assignmentId) => {
    const submission = getSubmissionForAssignment(assignmentId)
    return submission ? submission.status : 'Pending' // Default to 'Pending'
  }

  // Helper function to get feedback for a specific assignment
  const getFeedbackForAssignment = (assignmentId) => {
    const submission = getSubmissionForAssignment(assignmentId)
    return submission ? submission.feedback : null
  }

  // Helper function to check if assignment has been submitted
  const hasSubmittedAssignment = (assignmentId) => {
    const submission = getSubmissionForAssignment(assignmentId)
    return submission && ['Submitted', 'Overdue', 'Graded'].includes(submission.status)
  }

  // Helper function to get file info
  const getFileInfoForAssignment = (assignmentId) => {
    const submission = getSubmissionForAssignment(assignmentId)
    if (!submission?.fileName) return null
    return {
      submissionId: submission._id,
      fileName: submission.fileName,
      fileSize: submission.fileSize,
      fileType: submission.fileType
    }
  }

  const clearError = () => {
    setError(null)
  }

  const refetch = () => {
    fetchStudentSubmissions()
  }

  return {
    submissions,
    loading,
    error,
    getSubmissionForAssignment,
    getGradeForAssignment,
    getStatusForAssignment,
    getFeedbackForAssignment,
    hasSubmittedAssignment,
    getFileInfoForAssignment,
    clearError,
    refetch
  }
}