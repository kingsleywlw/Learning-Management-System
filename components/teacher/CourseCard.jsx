'use client'

import { useRouter } from 'next/navigation'

const CourseCard = ({ course }) => {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/teacher/courses/${course.id}`)
  }

  return (
    <div 
      className="w-full bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-blue-600">
            {course.title}
          </h2>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {course.status}
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-600">Course ID:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{course.id}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-600">Director:</span>
            <span className="font-semibold text-gray-900">{course.director?.name || 'Not assigned'}</span>
          </div>
          
          {course.credits && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Credits:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{course.credits}</span>
            </div>
          )}
          
          {course.lessons && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Lessons:</span>
              <span className="text-sm text-gray-900">{course.lessons.length} available</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
            View Course
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseCard