'use client'

import { useGetUser } from '@/hooks/useGetUser'
import { useTheme } from '@/context/ThemeContext'
import { UserPlus } from 'lucide-react'

interface Course {
  _id?: string
  courseId: string
  title: string
  status: 'active' | 'completed' | 'inactive'
  credits: number
  description?: string
  courseDirectorId?: {
    name: string
    email?: string
  }
}

interface User {
  name: string
  status: string
  dateEnrolled?: string
  enrolledCourses?: Course[]
  currentCreditPoints?: number
}



// Updated Course Detail Component (now simplified for list view)
const CourseDetail = ({ course }: { course: Course }) => {
  const { currentTheme } = useTheme();
  const isWhiteTheme = currentTheme.hexColor === '#ffffff';

  return (
    <div 
      className="rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border"
      style={{ 
        backgroundColor: currentTheme.hexColor,
        borderColor: `${currentTheme.hexColor}30`
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 
            className="text-lg font-semibold"
            style={{ color: isWhiteTheme ? '#111827' : '#ffffff' }}
          >
            {course.title}
          </h3>
          <p 
            className="text-sm font-medium"
            style={{ color: isWhiteTheme ? '#2563eb' : '#93c5fd' }}
          >
            {course.courseId}
          </p>
        </div>
        <div
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: course.status === 'active' 
              ? (isWhiteTheme ? '#dcfce7' : 'rgba(34,197,94,0.2)')
              : (isWhiteTheme ? '#f3f4f6' : 'rgba(255,255,255,0.2)'),
            color: course.status === 'active'
              ? (isWhiteTheme ? '#166534' : '#22c55e')
              : (isWhiteTheme ? '#374151' : '#e5e7eb')
          }}
        >
          {course.status}
        </div>
      </div>

      <div className="space-y-2 text-sm mb-4" style={{ color: isWhiteTheme ? '#6b7280' : '#d1d5db' }}>
        <div className="flex justify-between">
          <span>Coordinator:</span>
          <span 
            className="font-medium"
            style={{ color: isWhiteTheme ? '#111827' : '#ffffff' }}
          >
            {course.courseDirectorId?.name || 'Not assigned'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Credits:</span>
          <span 
            className="font-medium"
            style={{ color: isWhiteTheme ? '#111827' : '#ffffff' }}
          >
            {course.credits}
          </span>
        </div>
      </div>

      {course.description && (
        <p 
          className="text-sm mb-4 line-clamp-3"
          style={{ color: isWhiteTheme ? '#6b7280' : '#d1d5db' }}
        >
          {course.description}
        </p>
      )}

      <div className="flex flex-col space-y-2">
        {/* Single View Details Button */}
        <a
          href={`/student/courses/${course.courseId}`}
          className="py-2 px-4 rounded-md text-sm font-medium transition-colors text-center block"
          style={{
            backgroundColor: isWhiteTheme ? '#2563eb' : 'rgba(37,99,235,0.2)',
            color: isWhiteTheme ? '#ffffff' : '#60a5fa'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isWhiteTheme ? '#1d4ed8' : 'rgba(37,99,235,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isWhiteTheme ? '#2563eb' : 'rgba(37,99,235,0.2)';
          }}
        >
          View Course Details
        </a>
      </div>
    </div>
  )
}



// Main Courses List Page (unchanged functionality)
export default function CoursesPage() {
  const { user, loading, error, refetch } = useGetUser()
  const { currentTheme } = useTheme()
  const isWhiteTheme = currentTheme.hexColor === '#ffffff'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-700">Loading your courses...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Courses</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No User Data Found</h2>
            <p className="text-gray-600">Unable to load your profile information.</p>
          </div>
        </div>
      </div>
    )
  }

  const enrolledCourses = (user as User)?.enrolledCourses || []

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="rounded-lg shadow-md p-6 mb-8 border"
          style={{ 
            backgroundColor: currentTheme.hexColor,
            borderColor: `${currentTheme.hexColor}30`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ color: isWhiteTheme ? '#111827' : '#ffffff' }}
              >
                My Courses
              </h1>
              <p 
                className="mt-1"
                style={{ color: isWhiteTheme ? '#6b7280' : '#d1d5db' }}
              >
                Manage and access your enrolled courses
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div 
                  className="text-sm"
                  style={{ color: isWhiteTheme ? '#6b7280' : '#d1d5db' }}
                >
                  Total Enrolled
                </div>
                <div 
                  className="text-2xl font-bold"
                  style={{ color: isWhiteTheme ? '#2563eb' : '#60a5fa' }}
                >
                  {enrolledCourses.length}
                </div>
              </div>
              <button
                onClick={refetch}
                className="transition-colors"
                style={{ color: isWhiteTheme ? '#6b7280' : '#d1d5db' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = isWhiteTheme ? '#374151' : '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isWhiteTheme ? '#6b7280' : '#d1d5db';
                }}
                title="Refresh"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div 
          className="rounded-lg shadow-md p-6 border"
          style={{ 
            backgroundColor: currentTheme.hexColor,
            borderColor: `${currentTheme.hexColor}30`
          }}
        >
          <h2 
            className="text-2xl font-bold mb-6"
            style={{ color: isWhiteTheme ? '#111827' : '#ffffff' }}
          >
            Enrolled Courses
          </h2>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course: Course) => (
                <CourseDetail
                  key={course._id || course.courseId}
                  course={course}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus 
                className="h-12 w-12 mx-auto mb-4" 
                style={{ color: isWhiteTheme ? '#9ca3af' : 'rgba(255,255,255,0.4)' }}
              />
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: isWhiteTheme ? '#111827' : '#ffffff' }}
              >
                No Courses Enrolled
              </h3>
              <p 
                className="mb-6"
                style={{ color: isWhiteTheme ? '#6b7280' : '#d1d5db' }}
              >
                Start your learning journey by enrolling in courses.
              </p>
              <a
                href="/student/enrol"
                className="inline-flex items-center px-4 py-2 font-medium rounded-md transition-colors"
                style={{
                  backgroundColor: isWhiteTheme ? '#2563eb' : 'rgba(37,99,235,0.2)',
                  color: isWhiteTheme ? '#ffffff' : '#60a5fa'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isWhiteTheme ? '#1d4ed8' : 'rgba(37,99,235,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isWhiteTheme ? '#2563eb' : 'rgba(37,99,235,0.2)';
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll in Courses
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}