import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import StudentSubmission from '@/models/studentSubmission'
import Assignment from '@/models/assignment'
import User from '@/models/user'
import Course from '@/models/course'

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    await connectMongoDB()

    // Get the user from the database
    const dbUser = await User.findOne({ clerkId: user.id })
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database.' },
        { status: 404 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')

    // Validation
    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Both studentId and courseId are required.' },
        { status: 400 }
      )
    }

    // Authorization: Students can only view their own submissions
    // Handle both Clerk ID and MongoDB ID for studentId parameter
    const isOwnSubmission = dbUser._id.toString() === studentId || dbUser.clerkId === studentId
    if (!isOwnSubmission) {
      return NextResponse.json(
        { error: 'You can only view your own submissions.' },
        { status: 403 }
      )
    }

    // Use the database user ID for all subsequent queries
    const actualStudentId = dbUser._id

    // Verify the course exists and the student is enrolled
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found.' },
        { status: 404 }
      )
    }

    // Check if student is enrolled in the course
    const isEnrolled = course.enrolledStudentIds.some((id: any) => id.toString() === actualStudentId.toString())
    if (!isEnrolled) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course.' },
        { status: 403 }
      )
    }

    // Get all assignments for this course
    const assignments = await Assignment.find({ courseId })

    // Get all submissions for this student in this course
    const assignmentIds = assignments.map(assignment => assignment._id)
    const submissions = await StudentSubmission.find({
      studentId: actualStudentId,
      assignmentId: { $in: assignmentIds }
    }).populate('assignmentId', 'title description dueDate')

    // Create a complete list including assignments without submissions
    const submissionsWithDefaults = assignments.map(assignment => {
      const existingSubmission = submissions.find(sub => 
        sub.assignmentId._id.toString() === assignment._id.toString()
      )
      
      if (existingSubmission) {
        return {
          _id: existingSubmission._id,
          studentId: existingSubmission.studentId,
          assignmentId: existingSubmission.assignmentId,
          status: existingSubmission.status,
          grade: existingSubmission.grade,
          feedback: existingSubmission.feedback,
          fileName: existingSubmission.fileName,
          fileSize: existingSubmission.fileSize,
          fileType: existingSubmission.fileType,
          createdAt: existingSubmission.createdAt,
          updatedAt: existingSubmission.updatedAt
        }
      } else {
        // Return default submission data for assignments without submissions
        return {
          studentId: actualStudentId,
          assignmentId: assignment,
          status: 'Pending',
          grade: 'N',
          feedback: null,
          fileName: null,
          fileSize: null,
          fileType: null,
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt
        }
      }
    })

    return NextResponse.json({
      success: true,
      submissions: submissionsWithDefaults,
      message: 'Student submissions retrieved successfully.'
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching student submissions:', error)
    
    // Handle specific MongoDB errors
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid ID format provided.' },
        { status: 400 }
      )
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}