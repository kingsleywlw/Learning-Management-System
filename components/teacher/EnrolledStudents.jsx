'use client'

import { useState, useMemo } from 'react'
import { useEnrollStudents } from '@/hooks/teacher/useEnrollStudents'

const EnrolledStudents = ({ course, students, onCourseUpdate }) => {
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [searchEmail, setSearchEmail] = useState('')
  const { enrollStudents, loading, error, success, resetState } = useEnrollStudents()

  // Filter out students who are already enrolled in the course and apply search filter
  const availableStudents = useMemo(() => {
    if (!students || !course?.enrolledStudentIds) return []
    
    const enrolledClerkIds = course.enrolledStudentIds.map(student => student.clerkId || student._id)
    
    let filtered = students.filter(student => 
      !enrolledClerkIds.includes(student.id)
    )

    // Apply email search filter
    if (searchEmail.trim()) {
      filtered = filtered.filter(student => 
        student.emailAddress?.toLowerCase().includes(searchEmail.toLowerCase())
      )
    }

    return filtered
  }, [students, course, searchEmail])

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) return
    
    const result = await enrollStudents(course.courseId, selectedStudents)
    
    if (result.success) {
      setShowEnrollModal(false)
      setSelectedStudents([])
      onCourseUpdate(result.data) // Update the course data in parent
    }
  }

  const handleCloseModal = () => {
    setShowEnrollModal(false)
    setSelectedStudents([])
    setSearchEmail('')
    resetState()
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Enrolled Students ({course.enrolledStudentIds?.length || 0})</h2>
          <div className="flex items-center gap-3">
            {availableStudents.length > 0 && (
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                onClick={() => setShowEnrollModal(true)}
              >
                Enroll Students
              </button>
            )}
          </div>
        </div>
        
        {course.enrolledStudentIds && course.enrolledStudentIds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.enrolledStudentIds.map((student, index) => (
              <div key={student._id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full">
                  <span className="text-sm font-medium">{student.name?.split(' ').map(n => n[0]).join('') || '?'}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{student.name || 'Unknown Student'}</h4>
                  <p className="text-sm text-gray-600">{student.email || 'No email'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No students enrolled in this course yet.
            {availableStudents.length > 0 && (
              <div className="mt-2">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowEnrollModal(true)}
                >
                  Enroll Your First Students
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enroll Students Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Enroll Students in Course</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Students enrolled successfully!</span>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Select students to enroll in "{course.title}":
              </p>
              
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students by email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    disabled={loading}
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {availableStudents.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableStudents.map((student, index) => (
                    <label key={student.id || `student-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelect(student.id)}
                        disabled={loading}
                      />
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                        <span className="text-xs font-medium">{`${student.firstName || ''}${student.lastName || ''}`.split(' ').map(n => n[0]).join('') || '?'}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{`${student.firstName || ''} ${student.lastName || ''}`.trim()}</h4>
                        <p className="text-sm text-gray-600">{student.emailAddress}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  All available students are already enrolled in this course.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                onClick={handleEnrollStudents}
                disabled={loading || selectedStudents.length === 0}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enrolling...
                  </>
                ) : (
                  `Enroll ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EnrolledStudents