'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCreateCourse } from '@/hooks/teacher/useCreateCourse'
import { useTheme } from '@/context/ThemeContext'

const CreateCoursePage = () => {
  const router = useRouter()
  const { createCourse, loading, error, clearError } = useCreateCourse()
  const { currentTheme } = useTheme()
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    credits: 1
  })
  const [errors, setErrors] = useState({})

  // Dynamic styles based on theme
  const isWhiteTheme = currentTheme.hexColor === '#ffffff' || currentTheme.hexColor.toLowerCase() === '#fff';
  const themeTextColor = isWhiteTheme ? '#374151' : currentTheme.hexColor;
  
  const buttonStyles = {
    backgroundColor: themeTextColor,
    color: '#ffffff'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) || 1 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.courseId.trim()) {
      newErrors.courseId = 'Course ID is required'
    } else if (!/^[A-Z]{3}\d{4}$/.test(formData.courseId)) {
      newErrors.courseId = 'Course ID must be in format: 3 letters followed by 4 digits (e.g., CSC1010, MAT2021)'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Course title must be at least 3 characters long'
    }

    if (formData.credits < 1 || formData.credits > 10) {
      newErrors.credits = 'Credits must be between 1 and 10'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    // Clear any previous API errors
    clearError()
    
    try {
      const result = await createCourse(
        formData.courseId,
        formData.title,
        formData.credits
      )
      
      if (result.success) {
        console.log('Course created:', result.course)
        alert('Course created successfully!')
        router.push('/teacher/courses')
      } else {
        console.error('Error creating course:', result.error)
        alert(result.error || 'Failed to create course. Please try again.')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Failed to create course. Please try again.')
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Breadcrumb */}
        <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li><Link href="/teacher">Dashboard</Link></li>
          <li><Link href="/teacher/courses">Courses</Link></li>
          <li>Create Course</li>
        </ul>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 
          className="text-3xl font-bold mb-2 transition-colors duration-200"
          style={{ color: themeTextColor }}
        >
          Create New Course
        </h1>
        <p className="text-gray-600">Add a new course to your curriculum</p>
      </div>

      {/* Form Card */}
      <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course ID Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Course ID *</span>
              </label>
              <input
                type="text"
                name="courseId"
                className={`input input-bordered w-full ${errors.courseId ? 'input-error' : ''}`}
                value={formData.courseId}
                onChange={handleInputChange}
                disabled={loading}
                maxLength={7}
              />
              {errors.courseId && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.courseId}</span>
                </label>
              )}
            </div>

            {/* Course Title Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Course Title *</span>
              </label>
              <input
                type="text"
                name="title"
                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                value={formData.title}
                onChange={handleInputChange}
                disabled={loading}
                maxLength={100}
              />
              {errors.title && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.title}</span>
                </label>
              )}
            </div>

            {/* Credits Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Credits *</span>
              </label>
              <input
                type="number"
                name="credits"
                className={`input input-bordered w-full ${errors.credits ? 'input-error' : ''}`}
                value={formData.credits}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.credits && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.credits}</span>
                </label>
              )}
            </div>

            {/* Action Buttons */}
            {/* Display API Error */}
            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="card-actions justify-end pt-4">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn transition-all duration-200 hover:opacity-90"
                style={buttonStyles}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Card */}
      <div className="card w-full max-w-2xl mx-auto bg-info bg-opacity-10 shadow-lg mt-6">
        <div className="card-body">
          <h3 className="card-title text-info">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Guidelines
          </h3>
          <div className="text-sm space-y-2">
            <p><strong>Course ID:</strong> Use department code + number (e.g., CSC1010, MAT2021, ENG1102)</p>
            <p><strong>Title:</strong> Descriptive name that clearly identifies the course content</p>
            <p><strong>Credits:</strong> Academic credit hours</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default CreateCoursePage