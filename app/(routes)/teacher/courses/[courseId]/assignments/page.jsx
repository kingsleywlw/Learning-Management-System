'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const TeacherAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call to get teacher's assignments
        console.log('Fetching assignments...')
        
        // Mock data for now
        setTimeout(() => {
          setAssignments([
            {
              _id: '1',
              title: 'Programming Fundamentals Quiz',
              description: 'Complete the online quiz covering variables, functions, and basic algorithms.',
              dueDate: '2025-10-15T23:59:00Z',
              courseId: 'CS101',
              courseTitle: 'Introduction to Programming',
              createdAt: '2025-09-20T10:00:00Z'
            },
            {
              _id: '2', 
              title: 'Data Structure Implementation Project',
              description: 'Implement a linked list, stack, and queue in your preferred programming language.',
              dueDate: '2025-11-01T23:59:00Z',
              courseId: 'CS201',
              courseTitle: 'Data Structures',
              createdAt: '2025-09-18T14:30:00Z'
            },
            {
              _id: '3',
              title: 'Web Portfolio Submission',
              description: 'Create a personal portfolio website showcasing your web development skills.',
              dueDate: '2025-09-25T23:59:00Z', // Past due
              courseId: 'CS301',
              courseTitle: 'Web Development',
              createdAt: '2025-09-10T09:15:00Z'
            }
          ])
          setLoading(false)
        }, 1000)
        
      } catch (err) {
        console.error('Error fetching assignments:', err)
        setError('Failed to load assignments')
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDueDateStatus = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const timeDiff = due.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (daysDiff < 0) return { status: 'overdue', text: 'Overdue', class: 'bg-red-100 text-red-800' }
    if (daysDiff <= 3) return { status: 'due-soon', text: 'Due Soon', class: 'bg-yellow-100 text-yellow-800' }
    return { status: 'upcoming', text: 'Upcoming', class: 'bg-green-100 text-green-800' }
  }

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting assignment:', assignmentId)
        
        // Remove from local state
        setAssignments(prev => prev.filter(assignment => assignment._id !== assignmentId))
      } catch (err) {
        console.error('Error deleting assignment:', err)
        alert('Failed to delete assignment. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-4 text-lg text-gray-700">Loading assignments...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-red-800">Error loading assignments</h3>
              <div className="text-sm text-red-700">{error}</div>
            </div>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Breadcrumb */}
        <div className="breadcrumbs text-sm mb-6">
          <ul>
            <li><Link href="/teacher">Dashboard</Link></li>
            <li>Assignments</li>
          </ul>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
            <p className="text-gray-600">Manage assignments across all your courses ({assignments.length} assignment{assignments.length !== 1 ? 's' : ''})</p>
          </div>
          <div className="flex gap-2">
            <button 
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors flex items-center"
              onClick={() => window.location.reload()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link href="/teacher/assignments/create" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Assignment
            </Link>
          </div>
        </div>
        
        {/* Assignments List */}
        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const dueDateInfo = getDueDateStatus(assignment.dueDate)
              
              return (
                <div key={assignment._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{assignment.courseTitle}</span> ({assignment.courseId})
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${dueDateInfo.class}`}>
                          {dueDateInfo.text}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3 line-clamp-2">{assignment.description}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due: {formatDate(assignment.dueDate)}
                        </div>
                        <span className="hidden sm:inline">·</span>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Created: {formatDate(assignment.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                      <Link
                        href={`/teacher/assignments/${assignment._id}/submissions`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors text-center"
                      >
                        View Submissions
                      </Link>
                      <Link
                        href={`/teacher/assignments/${assignment._id}/edit`}
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors text-center"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-gray-500 text-lg mb-2">No assignments yet</div>
            <p className="text-gray-400 mb-4">You haven't created any assignments yet. Get started by creating your first assignment.</p>
            <Link href="/teacher/assignments/create" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
              Create Your First Assignment
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherAssignmentsPage