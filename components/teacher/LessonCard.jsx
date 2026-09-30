'use client'

import { useState } from 'react'
import { useDeleteLesson } from '../../hooks/teacher/useDeleteLesson'
import { useUpdateLessonStatus } from '../../hooks/teacher/useUpdateLessonStatus'

const LessonCard = ({ lesson, index, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { deleteLesson, loading: isDeleting, error: deleteError } = useDeleteLesson()
  const { updateLessonStatus, loading: isUpdatingStatus } = useUpdateLessonStatus()
  const [currentStatus, setCurrentStatus] = useState(lesson.status || 'active')

  const handleDelete = async () => {
    try {
      const result = await deleteLesson(lesson._id || lesson.id)
      if (result.success) {
        // Notify parent component that lesson was deleted (for UI updates)
        if (onDelete) {
          onDelete(lesson._id || lesson.id)
        }
        setShowDeleteModal(false)
      } else {
        console.error('Error deleting lesson:', result.error)
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const result = await updateLessonStatus(lesson._id || lesson.id, newStatus)
    if (result.success) {
      setCurrentStatus(newStatus)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
        <div className="flex items-center gap-3">
          <div className="badge badge-outline">{index + 1}</div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">{lesson.title || `Lesson ${index + 1}`}</span>
              <span className={`badge badge-sm ${currentStatus === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {currentStatus}
              </span>
            </div>
            {lesson.description && (
              <span className="text-sm text-gray-600 mt-1">{lesson.description}</span>
            )}
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
              Are you sure you want to delete the lesson "{lesson.title || `Lesson ${index + 1}`}"? 
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

export default LessonCard