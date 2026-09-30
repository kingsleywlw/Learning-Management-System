'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useGetSpecificCourse } from '@/hooks/teacher/useGetSpecificCourse'
import { useGetUserOffRole } from '@/hooks/useGetUserOffRole'
import CourseDirector from '@/components/teacher/CourseDirector'
import LessonCard from '@/components/teacher/LessonCard'
import AssignmentCard from '@/components/teacher/AssignmentCard'
import EnrolledStudents from '@/components/teacher/EnrolledStudents'

const CoursePage = () => {
  const params = useParams()
  const courseId = params.courseId
  const { course, loading, error, refetchCourse } = useGetSpecificCourse(courseId)
  const {teachers, students} = useGetUserOffRole();

  const handleDeleteLesson = async (lessonId) => {
    try {
      // TODO: Implement delete lesson API call
      console.log('Deleting lesson with ID:', lessonId)
      // After successful deletion, refetch the course data
      refetchCourse()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      throw error // Re-throw to let the component handle the error
    }
  }

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      // TODO: Implement delete assignment API call
      console.log('Deleting assignment with ID:', assignmentId)
      // After successful deletion, refetch the course data
      refetchCourse()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      throw error // Re-throw to let the component handle the error
    }
  }
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="ml-4 text-lg">Loading course...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Course</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={refetchCourse} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
              Try Again
            </button>
            <Link href="/teacher/courses" className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course with ID "{courseId}" could not be found.</p>
          <Link href="/teacher/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li><Link href="/teacher">Dashboard</Link></li>
          <li><Link href="/teacher/courses">Courses</Link></li>
          <li>{course.title}</li>
        </ul>
      </div>

      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-blue-600">{course.title}</h1>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {course.status}
              </div>
            </div>
            <p className="text-gray-600 mb-4">Course ID: {course.courseId}</p>
          </div>
          
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="stat bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">Course ID</div>
            <div className="text-2xl font-bold text-gray-900">{course.courseId}</div>
          </div>
          
          <div className="stat bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">Credits</div>
            <div className="text-2xl font-bold text-gray-900">{course.credits}</div>
          </div>
          
          <div className="stat bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">Total Lessons</div>
            <div className="text-2xl font-bold text-gray-900">{course.lessonIds?.length || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="stat bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600">Total Assignments</div>
            <div className="text-2xl font-bold text-blue-800">{course.assignmentIds?.length || 0}</div>
          </div>
          
          <div className="stat bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600">Enrolled Students</div>
            <div className="text-2xl font-bold text-green-800">{course.enrolledStudentIds?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Course Director */}
      <CourseDirector 
        course={course} 
        teachers={teachers} 
        onCourseUpdate={(updatedCourse) => {
          // Update the course data in the parent component
          // You might want to call refetchCourse() here or update local state
          refetchCourse();
        }}
      />

      {/* Enrolled Students */}
      <EnrolledStudents 
        course={course} 
        students={students} 
        onCourseUpdate={(updatedCourse) => {
          // Update the course data in the parent component
          refetchCourse();
        }}
      />

      {/* Lessons */}
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Lessons</h2>
          <Link href={`/teacher/courses/${courseId}/lessons/create`} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Add Lesson</Link>
        </div>
        
        <div className="space-y-3">
          {course.lessonIds && course.lessonIds.length > 0 ? (
            course.lessonIds.map((lesson, index) => (
              <LessonCard
                key={lesson._id || index}
                lesson={lesson}
                index={index}
                onDelete={handleDeleteLesson}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No lessons available for this course yet.
            </div>
          )}
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
          <Link href={`/teacher/courses/${courseId}/assignments/create`} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Add Assignment</Link>
        </div>
        
        <div className="space-y-3">
          {course.assignmentIds && course.assignmentIds.length > 0 ? (
            course.assignmentIds.map((assignment, index) => (
              <AssignmentCard
                key={assignment._id || index}
                assignment={assignment}
                index={index}
                onDelete={handleDeleteAssignment}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No assignments available for this course yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoursePage