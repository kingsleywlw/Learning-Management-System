'use client'

import React, { useState, useEffect } from 'react'
import { useGetTeacherCourse } from '@/hooks/teacher/useGetTeacherCourse'
import { Book, FileText, Users, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'

export default function ClassroomGradingPage() {
  const { courses, loading: coursesLoading } = useGetTeacherCourse()
  
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [students, setStudents] = useState([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [gradingLoading, setGradingLoading] = useState(false)

  // Fetch assignments when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments(selectedCourse._id)
      setSelectedAssignment(null)
      setSubmissions([])
    }
  }, [selectedCourse])

  // Fetch submissions when assignment is selected
  useEffect(() => {
    if (selectedAssignment && selectedCourse) {
      fetchSubmissions(selectedCourse._id, selectedAssignment._id)
    }
  }, [selectedAssignment])

  const fetchAssignments = async (courseId) => {
    setLoadingAssignments(true)
    try {
      const response = await fetch(`/api/teacher/get-course-assignments/${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setAssignments(data.assignments || [])
      } else {
        console.error('Failed to fetch assignments:', data.error)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoadingAssignments(false)
    }
  }

  const fetchSubmissions = async (courseId, assignmentId) => {
    setLoadingSubmissions(true)
    try {
      const response = await fetch(`/api/teacher/get-submissions?courseId=${courseId}&assignmentId=${assignmentId}`)
      const data = await response.json()
      
      if (data.success) {
        setStudents(data.students || [])
        setSubmissions(data.submissions || [])
      } else {
        console.error('Failed to fetch submissions:', data.error)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleGrade = async (studentId, grade) => {
    if (!selectedAssignment || !selectedCourse) return
    
    setGradingLoading(true)
    try {
      const response = await fetch('/api/teacher/grade-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          assignmentId: selectedAssignment._id,
          courseId: selectedCourse._id,
          grade
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh submissions
        fetchSubmissions(selectedCourse._id, selectedAssignment._id)
        alert('Grade submitted successfully!')
      } else {
        alert('Failed to submit grade: ' + data.error)
      }
    } catch (error) {
      console.error('Error grading submission:', error)
      alert('Error grading submission')
    } finally {
      setGradingLoading(false)
    }
  }

  const getSubmissionForStudent = (studentId) => {
    return submissions.find(sub => 
      sub.studentId._id?.toString() === studentId.toString() ||
      sub.studentId.toString() === studentId.toString()
    )
  }

  const getGradeIcon = (grade) => {
    switch (grade) {
      case 'P':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'F':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getGradeBadgeColor = (grade) => {
    switch (grade) {
      case 'P':
        return 'bg-green-100 text-green-800'
      case 'F':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Classroom Grading</h1>
          <p className="text-gray-600">Select a course and assignment to grade student submissions</p>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Book className="inline h-4 w-4 mr-1" />
                Select Course
              </label>
              <select
                value={selectedCourse?._id || ''}
                onChange={(e) => {
                  const course = courses.find(c => c._id === e.target.value)
                  setSelectedCourse(course || null)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={coursesLoading}
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseId} - {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Select Assignment
              </label>
              <select
                value={selectedAssignment?._id || ''}
                onChange={(e) => {
                  const assignment = assignments.find(a => a._id === e.target.value)
                  setSelectedAssignment(assignment || null)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedCourse || loadingAssignments}
              >
                <option value="">-- Select an Assignment --</option>
                {assignments.map((assignment) => (
                  <option key={assignment._id} value={assignment._id}>
                    {assignment.title} (Due: {new Date(assignment.dueDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Course Info */}
          {selectedCourse && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedCourse.title}</h3>
                  <p className="text-sm text-gray-600">Course ID: {selectedCourse.courseId}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{selectedCourse.enrolledStudentIds?.length || 0} Students Enrolled</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grading Table */}
        {selectedCourse && selectedAssignment && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Grading: {selectedAssignment.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Due Date: {new Date(selectedAssignment.dueDate).toLocaleString()}
              </p>
            </div>

            {loadingSubmissions ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading submissions...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
                <p className="text-gray-600">There are no students enrolled in this course.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submission Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Grade
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade Assignment
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        View Submission
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => {
                      const submission = getSubmissionForStudent(student._id)
                      const hasSubmitted = submission && submission.status !== 'Pending'
                      const currentGrade = submission?.grade || 'N'
                      
                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {student.name?.charAt(0).toUpperCase() || 'S'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              hasSubmitted 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {hasSubmitted ? 'Submitted' : 'Not Submitted'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {getGradeIcon(currentGrade)}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeBadgeColor(currentGrade)}`}>
                                {currentGrade === 'P' ? 'Pass' : currentGrade === 'F' ? 'Fail' : 'Not Graded'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleGrade(student._id, 'P')}
                                disabled={!hasSubmitted || gradingLoading}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                  !hasSubmitted
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                                title={!hasSubmitted ? 'Student has not submitted yet' : 'Grade as Pass'}
                              >
                                Pass
                              </button>
                              <button
                                onClick={() => handleGrade(student._id, 'F')}
                                disabled={!hasSubmitted || gradingLoading}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                  !hasSubmitted
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                                title={!hasSubmitted ? 'Student has not submitted yet' : 'Grade as Fail'}
                              >
                                Fail
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {hasSubmitted && submission?._id ? (
                              <button
                                onClick={() => window.open(`/api/student/submissions/${submission._id}/file`, '_blank')}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View PDF
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedCourse && !coursesLoading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Book className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course to Get Started</h3>
            <p className="text-gray-600">Choose a course from the dropdown above to view assignments and grade submissions.</p>
          </div>
        )}
      </div>
    </div>
  )
}
