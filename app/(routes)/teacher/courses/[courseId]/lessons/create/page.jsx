'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCreateLesson } from '@/hooks/teacher/useCreateLesson'

const CreateLessonPage = () => {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId
  const { createLesson, loading, error, clearError } = useCreateLesson()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    readingList: [''],
    estHoursPerWeek: 1,
    credit: 6,
    status: 'active'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayInputChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (index, field) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError() // Clear any previous errors

    try {
      const lessonData = {
        ...formData,
        courseId
      }

      const result = await createLesson(lessonData)

      if (result.success) {
        // Redirect back to course page on success
        router.push(`/teacher/courses/${courseId}`)
      }
      // If result.success is false, the error will be handled by the hook
    } catch (err) {
      // Additional error handling if needed
      console.error('Error in form submission:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Breadcrumb */}
        <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li><Link href="/teacher">Dashboard</Link></li>
          <li><Link href="/teacher/courses">Courses</Link></li>
          <li><Link href={`/teacher/courses/${courseId}`}>Course Details</Link></li>
          <li>Create Lesson</li>
        </ul>
      </div>

      {/* Header */}
      <div className="bg-base-100 rounded-lg shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Create New Lesson</h1>
            <p className="text-gray-600">Add a new lesson to your course</p>
          </div>
          <Link href={`/teacher/courses/${courseId}`} className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="card bg-base-100 shadow-2xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Display */}
            {error && (
              <div className="alert alert-error shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Basic Information Card */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="form-control">
                    <div className="mb-2">
                      <span className="label-text font-semibold text-base">
                        Lesson Title <span className="text-error">*</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter a descriptive lesson title"
                      className="input input-bordered input-primary focus:input-primary"
                      required
                    />
                  </div>

                  {/* Credit */}
                  <div className="form-control">
                    <div className="mb-2">
                      <span className="label-text font-semibold text-base">Credit Points</span>
                    </div>
                    <input
                      type="number"
                      name="credit"
                      value={formData.credit}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="input input-bordered focus:input-primary"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-control">
                  <div className="mb-2">
                    <span className="label-text font-semibold text-base">Description</span>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of what students will learn in this lesson..."
                    className="textarea textarea-bordered textarea-primary focus:textarea-primary h-28"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Learning Objectives Card */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Learning Objectives
                </h3>
                
                <div className="form-control">
                  <div className="mb-2">
                    <span className="label-text font-semibold text-base">What will students learn?</span>
                  </div>
                  <textarea
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleInputChange}
                    placeholder="By the end of this lesson, students will be able to..."
                    className="textarea textarea-bordered textarea-primary focus:textarea-primary h-24"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Configuration Card */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Lesson Configuration
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="form-control">
                    <div className="mb-2">
                      <span className="label-text font-semibold text-base">Estimated Hours Per Week</span>
                    </div>
                    <div className="join">
                      <input
                        type="number"
                        name="estHoursPerWeek"
                        value={formData.estHoursPerWeek}
                        onChange={handleInputChange}
                        min="1"
                        max="40"
                        className="input input-bordered join-item focus:input-primary flex-1"
                      />
                      <span className="btn join-item no-animation">hours</span>
                    </div>
                  </div>

                  <div className="form-control">
                    <div className="mb-2">
                      <span className="label-text font-semibold text-base">Status</span>
                    </div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="select select-bordered select-primary focus:select-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Reading Materials Card */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Reading Materials
                </h3>
                
                <div className="form-control">
                  <div className="mb-2">
                    <span className="label-text font-semibold text-base">Required Reading List</span>
                  </div>
                  <div className="space-y-3">
                    {formData.readingList.map((item, index) => (
                      <div key={index} className="join w-full">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayInputChange(index, 'readingList', e.target.value)}
                          placeholder={`Reading material ${index + 1} (e.g., textbook chapter, article, etc.)`}
                          className="input input-bordered join-item flex-1 focus:input-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, 'readingList')}
                          className="btn btn-error join-item"
                          disabled={formData.readingList.length === 1}
                          title="Remove reading material"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('readingList')}
                      className="btn btn-outline btn-primary btn-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Reading Material
                    </button>
                  </div>
                  <label className="label">
                    <span className="label-text-alt">Add books, articles, or other materials students should read</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <Link 
                    href={`/teacher/courses/${courseId}`} 
                    className="btn btn-outline btn-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className={`btn btn-primary btn-lg ${loading ? 'loading' : ''}`}
                    disabled={loading || !formData.title.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Create Lesson
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  )
}

export default CreateLessonPage