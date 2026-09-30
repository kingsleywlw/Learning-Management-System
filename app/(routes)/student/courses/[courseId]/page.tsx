'use client'

import React, { useState, useRef } from 'react'
import { ArrowLeft, Book, Clock, GraduationCap, FileText, Target, User, Calendar, Upload } from 'lucide-react'
import Link from 'next/link'
import { useGetStudentCourse } from '@/hooks/student/useGetStudentCourse'
import { useGetStudentSubmissions } from '@/hooks/student/useGetStudentSubmissions'
import { useSubmitAssignment } from '@/hooks/student/useSubmitAssignment'
import { useUser } from '@clerk/nextjs'

// Types matching your API response format
interface Lesson {
  _id: string
  title: string
  description: string
  objectives: string
  readingList: string[]
  estHoursPerWeek: number
  designerId: {
    name: string
  }
  credit: number
  status: 'draft' | 'active' | 'archived'
}

interface Course {
  _id: string
  courseId: string
  title: string
  credits: number
  status: 'active' | 'inactive'
  courseDirectorId: {
    name: string
    email: string
  }
  lessonIds: any[] // Using any[] to match the populated response
  assignmentIds: Assignment[] // Populated assignments
  enrolledStudentIds: any[] // This comes from the API
  description?: string
}

// Assignment interface matching your API response
interface Assignment {
  _id: string
  title: string
  description: string
  dueDate: string
  courseId: string
  createdAt?: string
  updatedAt?: string
}

// Tab Component
const TabButton = ({ 
  active, 
  onClick, 
  children, 
  icon: Icon 
}: { 
  active: boolean
  onClick: () => void
  children: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
}) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    <Icon className="h-4 w-4 mr-2" />
    {children}
  </button>
)

// Lessons Tab Component (using your existing data structure)
const LessonsTab = ({ course }: { course: Course }) => {
  const activeLessons = course.lessonIds?.filter((lesson: any) => lesson.status === 'active') || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Course Lessons</h3>
        <span className="text-sm text-gray-500">{activeLessons.length} active lessons</span>
      </div>
      
      {activeLessons.length > 0 ? (
        <div className="space-y-4">
          {activeLessons.map((lesson: any, index: number) => (
            <div key={lesson._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      Lesson {index + 1}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {lesson.credit} credits
                    </span>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded capitalize">
                      {lesson.status}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h4>
                  {lesson.description && (
                    <p className="text-gray-600 mb-3">{lesson.description}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {lesson.estHoursPerWeek} hrs/week
                  </div>
                  <div className="text-sm text-gray-500">
                    Designer: {lesson.designerId?.name || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Lesson Objectives */}
              {lesson.objectives && (
                <div className="mb-4">
                  <h5 className="flex items-center text-sm font-medium text-gray-900 mb-2">
                    <Target className="h-4 w-4 mr-1" />
                    Learning Objectives
                  </h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {lesson.objectives}
                  </p>
                </div>
              )}

              {/* Reading List */}
              {lesson.readingList && lesson.readingList.length > 0 && (
                <div>
                  <h5 className="flex items-center text-sm font-medium text-gray-900 mb-2">
                    <FileText className="h-4 w-4 mr-1" />
                    Reading List
                  </h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {lesson.readingList.map((reading: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-600 mr-2">&#8226;</span>
                        {reading}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Book className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No active lessons available for this course.</p>
        </div>
      )}
    </div>
  )
}

// Assignments Tab Component
const AssignmentsTab = ({ course, studentId }: { course: Course; studentId: string }) => {
  // Filter to only show active assignments
  const assignments = (course.assignmentIds || []).filter((assignment: any) => assignment.status === 'active')
  const {
    submissions,
    loading: submissionsLoading,
    error: submissionsError,
    getGradeForAssignment,
    getStatusForAssignment,
    getFeedbackForAssignment,
    getFileInfoForAssignment,
    refetch: refetchSubmissions
  } = useGetStudentSubmissions(studentId, course._id)
  
  const { submitAssignment, loading: submitLoading } = useSubmitAssignment()
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = (assignmentId: string) => {
    setCurrentAssignmentId(assignmentId)
    fileInputRef.current?.click()
  }

  // Handle viewing submitted PDF
  const handleViewSubmission = (assignmentId: string) => {
    const fileInfo = getFileInfoForAssignment(assignmentId)
    if (fileInfo?.submissionId) {
      // Open PDF in new tab
      window.open(`/api/student/submissions/${fileInfo.submissionId}/file`, '_blank')
    } else {
      alert('No submission found for this assignment')
    }
  }

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      // Automatically submit after file selection
      if (currentAssignmentId) {
        handleSubmit(currentAssignmentId, file)
      }
    } else {
      alert('Please select a PDF file')
    }
    // Reset input
    if (event.target) {
      event.target.value = ''
    }
  }

  // Handle submission
  const handleSubmit = async (assignmentId: string, file: File) => {
    const result = await submitAssignment(assignmentId, file)
    
    if (result.success) {
      // Refresh submissions to show updated status
      refetchSubmissions()
      setCurrentAssignmentId(null)
      alert(result.message || 'Assignment submitted successfully!')
    } else {
      alert(result.error || 'Failed to submit assignment')
    }
  }

  // Helper function to determine assignment status based on due date
  const getAssignmentStatus = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    
    if (due < today) {
      return 'overdue'
    } else if (due.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) { // Due within 7 days
      return 'due-soon'
    }
    return 'upcoming'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Assignments & Assessments</h3>
        <span className="text-sm text-gray-500">{assignments.length} active assignments</span>
      </div>
      
      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const status = getAssignmentStatus(assignment.dueDate)
            const dueDate = new Date(assignment.dueDate)
            const isOverdue = status === 'overdue'
            const isDueSoon = status === 'due-soon'
            
            return (
              <div key={assignment._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h4>
                    <p className="text-gray-600 mb-3">{assignment.description}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      isOverdue 
                        ? "bg-red-100 text-red-800"
                        : isDueSoon
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Upcoming'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        Due: {dueDate.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Submission Status */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Status:</span>
                    {getStatusForAssignment(assignment._id) ? (
                      <span className={`font-medium ${
                        getStatusForAssignment(assignment._id) === 'graded' 
                          ? 'text-green-600' 
                          : 'text-blue-600'
                      }`}>
                        {getStatusForAssignment(assignment._id) === 'graded' 
                          ? `Graded: ${getGradeForAssignment(assignment._id)}` 
                          : 'Submitted'}
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium">Not Submitted</span>
                    )}
                  </div>
                </div>

                {/* Feedback Section */}
                {getFeedbackForAssignment(assignment._id) && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-800 mb-1">Teacher Feedback:</h5>
                    <p className="text-sm text-blue-700">{getFeedbackForAssignment(assignment._id)}</p>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Action buttons */}
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleFileSelect(assignment._id)}
                    disabled={submitLoading && currentAssignmentId === assignment._id}
                    className={`flex items-center justify-center ${
                      submitLoading && currentAssignmentId === assignment._id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white px-4 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    {submitLoading && currentAssignmentId === assignment._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Assignment (PDF)
                      </>
                    )}
                  </button>
                  {getFileInfoForAssignment(assignment._id) && (
                    <button 
                      onClick={() => handleViewSubmission(assignment._id)}
                      className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      View Submitted PDF
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Assignments</h3>
          <p className="text-gray-600">Active assignments will appear here when your instructor creates them.</p>
        </div>
      )}
    </div>
  )
}



export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  // Unwrap the params Promise using React.use()
  const { courseId } = React.use(params)
  const { user } = useUser()
  const { course, loading, error } = useGetStudentCourse(courseId)
  const [activeTab, setActiveTab] = useState('lessons')
  
  // Type the course properly
  const typedCourse = course as Course | null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-700">Loading course details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !typedCourse) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Course</h2>
            <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
            <Link 
              href="/student/courses"
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const activeLessons = typedCourse.lessonIds?.filter((lesson: Lesson) => lesson.status === 'active') || []
  const totalHours = activeLessons.reduce((sum: number, lesson: Lesson) => sum + (lesson.estHoursPerWeek || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/student/courses"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Link>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{typedCourse.title}</h1>
              <p className="text-lg text-blue-600 font-semibold">{typedCourse.courseId}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                typedCourse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {typedCourse.status}
              </div>
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Credits</p>
                <p className="font-semibold text-gray-900">{typedCourse.credits}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Book className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Lessons</p>
                <p className="font-semibold text-gray-900">{activeLessons.length}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Est. Hours/Week</p>
                <p className="font-semibold text-gray-900">{totalHours}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <User className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Course Director</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {typedCourse.courseDirectorId?.name || 'Not assigned'}
                </p>
              </div>
            </div>
          </div>

          {/* Course Description */}
          {typedCourse.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Description</h3>
              <p className="text-gray-700 leading-relaxed">{typedCourse.description}</p>
            </div>
          )}
        </div>

        {/* Course Director Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Course Director
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {typedCourse.courseDirectorId?.name || 'Not assigned'}
                </p>
                {typedCourse.courseDirectorId?.email && (
                  <p className="text-sm text-gray-600">{typedCourse.courseDirectorId.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex space-x-1 p-4 border-b border-gray-200">
            <TabButton
              active={activeTab === 'lessons'}
              onClick={() => setActiveTab('lessons')}
              icon={Book}
            >
              Lessons
            </TabButton>
            <TabButton
              active={activeTab === 'assignments'}
              onClick={() => setActiveTab('assignments')}
              icon={FileText}
            >
              Assignments
            </TabButton>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'lessons' && (
              <LessonsTab course={typedCourse} />
            )}
            {activeTab === 'assignments' && user?.id && (
              <AssignmentsTab course={typedCourse} studentId={user.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}