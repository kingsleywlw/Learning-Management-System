import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import StudentSubmission from '@/models/studentSubmission'
import Assignment from '@/models/assignment'
import User from '@/models/user'
import Course from '@/models/course'

export async function POST(request: NextRequest) {
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

    // Parse the form data
    const formData = await request.formData()
    const assignmentId = formData.get('assignmentId') as string
    const pdfFile = formData.get('pdfFile') as File

    // Validation
    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required.' },
        { status: 400 }
      )
    }

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'PDF file is required.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (pdfFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (pdfFile.size > maxSize) {
      return NextResponse.json(
        { error: 'PDF file size must not exceed 10MB.' },
        { status: 400 }
      )
    }

    // Verify the assignment exists
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found.' },
        { status: 404 }
      )
    }

    // Verify the course exists and the student is enrolled
    const course = await Course.findById(assignment.courseId)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found.' },
        { status: 404 }
      )
    }

    // Check if student is enrolled in the course
    const isEnrolled = course.enrolledStudentIds.some((id: any) => id.toString() === dbUser._id.toString())
    if (!isEnrolled) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course.' },
        { status: 403 }
      )
    }

    // Check if assignment is overdue
    const currentDate = new Date()
    const dueDate = new Date(assignment.dueDate)
    const isOverdue = currentDate > dueDate

    // Determine the status
    const status = isOverdue ? 'Overdue' : 'Submitted'

    // Convert the file to buffer for storage
    const bytes = await pdfFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Check if a submission already exists
    const existingSubmission = await StudentSubmission.findOne({
      studentId: dbUser._id,
      assignmentId: assignmentId
    })

    let submission

    if (existingSubmission) {
      // Update existing submission with new file
      existingSubmission.status = status
      existingSubmission.fileData = buffer
      existingSubmission.fileName = pdfFile.name
      existingSubmission.fileType = pdfFile.type
      existingSubmission.fileSize = pdfFile.size
      // Keep the existing grade and feedback
      submission = await existingSubmission.save()
    } else {
      // Create new submission
      submission = await StudentSubmission.create({
        studentId: dbUser._id,
        assignmentId: assignmentId,
        status: status,
        grade: 'N', // Not graded yet
        feedback: '',
        fileData: buffer,
        fileName: pdfFile.name,
        fileType: pdfFile.type,
        fileSize: pdfFile.size
      })
    }

    // Populate the assignment details
    await submission.populate('assignmentId', 'title description dueDate')

    return NextResponse.json({
      success: true,
      submission: {
        _id: submission._id,
        status: submission.status,
        grade: submission.grade,
        fileName: submission.fileName,
        fileSize: submission.fileSize,
        assignmentId: submission.assignmentId,
        updatedAt: submission.updatedAt
      },
      message: isOverdue 
        ? 'Assignment submitted but marked as overdue.' 
        : 'Assignment submitted successfully!'
    }, { status: 200 })

  } catch (error) {
    console.error('Error submitting assignment:', error)
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.name === 'CastError') {
        return NextResponse.json(
          { error: 'Invalid ID format provided.' },
          { status: 400 }
        )
      }
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Validation error. Please check your input.' },
          { status: 400 }
        )
      }
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
