import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import Assignment from '@/models/assignment'
import Course from '@/models/course'
import User from '@/models/user'

export async function DELETE(request: NextRequest) {
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

    // Get assignment ID from query parameters
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required.' },
        { status: 400 }
      )
    }

    // Find the assignment and verify it exists
    const assignment = await Assignment.findById(assignmentId)
    
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found.' },
        { status: 404 }
      )
    }

    // Check if the course belongs to the teacher
    const course = await Course.findOne({ 
      _id: assignment.courseId,
      courseDirectorId: dbUser._id
    })

    if (!course) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this assignment.' },
        { status: 403 }
      )
    }

    // Remove the assignment from the course's assignmentIds array
    await Course.findByIdAndUpdate(
      assignment.courseId,
      { $pull: { assignmentIds: assignmentId } }
    )

    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId)

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully.',
      deletedAssignmentId: assignmentId
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting assignment:', error)
    
    // Handle specific MongoDB errors
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid assignment ID format.' },
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