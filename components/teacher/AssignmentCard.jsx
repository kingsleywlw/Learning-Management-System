'use client'

import { useState } from 'react'
import { useUpdateAssignmentStatus } from '../../hooks/teacher/useUpdateAssignmentStatus'

const AssignmentCard = ({ assignment, index, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const { updateAssignmentStatus, loading: isUpdatingStatus } = useUpdateAssignmentStatus()
  const [currentStatus, setCurrentStatus] = useState(assignment.status || 'active')

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setDeleteError(null)
      
      // TODO: Implement delete assignment API call
      console.log('Deleting assignment with ID:', assignment._id || assignment.id)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Notify parent component that assignment was deleted
      if (onDelete) {
        onDelete(assignment._id || assignment.id)
      }
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting assignment:', error)
      setDeleteError('Failed to delete assignment. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const result = await updateAssignmentStatus(assignment._id || assignment.id, newStatus)
    if (result.success) {
      setCurrentStatus(newStatus)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDueDateClass = (dueDate) => {
    if (!dueDate) return 'text-gray-500'
    
    const today = new Date()
    const due = new Date(dueDate)
    const timeDiff = due.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (daysDiff < 0) return 'text-red-600' // Overdue
    if (daysDiff <= 3) return 'text-yellow-600' // Due soon
    return 'text-green-600' // Not due yet
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
        <div className="flex items-center gap-3">
          <div className="badge badge-outline">{index + 1}</div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">{assignment.title || `Assignment ${index + 1}`}</span>
              <span className={`badge badge-sm ${currentStatus === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {currentStatus}
              </span>
            </div>
            {assignment.description && (
              <span className="text-sm text-gray-600 mt-1">{assignment.description}</span>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className={`text-xs ${getDueDateClass(assignment.dueDate)}`}>
                Due: {formatDate(assignment.dueDate)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            className={`btn btn-sm ${currentStatus === 'active' ? 'btn-warning' : 'btn-success'}`}
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            title={currentStatus === 'active' ? 'Set as Inactive' : 'Set as Active'}
          >
            {isUpdatingStatus ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {currentStatus === 'active' ? 'Inactive' : 'Active'}
              </>
            )}
          </button>
          <button 
            className="btn btn-sm btn-error"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete the assignment "{assignment.title || `Assignment ${index + 1}`}"? 
              This action cannot be undone.
            </p>
            {deleteError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{deleteError}</span>
              </div>
            )}
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AssignmentCard