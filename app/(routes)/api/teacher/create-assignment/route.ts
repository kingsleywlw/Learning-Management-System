import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import Assignment from '@/models/assignment'
import Course from '@/models/course'
import User from '@/models/user'

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

    // Parse request body
    const body = await request.json()
    const { title, description, dueDate, courseId } = body

    // Validation
    if (!title || !description || !dueDate || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, dueDate, and courseId are required.' },
        { status: 400 }
      )
    }

    // Validate title length
    if (title.trim().length < 3) {
      return NextResponse.json(
        { error: 'Assignment title must be at least 3 characters long.' },
        { status: 400 }
      )
    }

    // Validate description length
    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Assignment description must be at least 10 characters long.' },
        { status: 400 }
      )
    }

    // Validate due date is in the future
    const parsedDueDate = new Date(dueDate)
    const now = new Date()
    
    if (parsedDueDate <= now) {
      return NextResponse.json(
        { error: 'Due date must be in the future.' },
        { status: 400 }
      )
    }

    // Check if the course exists and belongs to the teacher
    const course = await Course.findOne({ 
      courseId: courseId,
      courseDirectorId: dbUser._id
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or you do not have permission to add assignments to this course.' },
        { status: 404 }
      )
    }

    // Create the assignment
    const assignment = new Assignment({
      title: title.trim(),
      description: description.trim(),
      dueDate: parsedDueDate,
      courseId: course._id  // Use the MongoDB ObjectId, not the courseId string
    })

    // Save the assignment
    await assignment.save()

    // Add the assignment to the course's assignmentIds array
    await Course.findByIdAndUpdate(
      course._id,
      { $push: { assignmentIds: assignment._id } },
      { new: true }
    )

    // Return success response with the created assignment
    return NextResponse.json({
      success: true,
      message: 'Assignment created successfully.',
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        courseId: assignment.courseId,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating assignment:', error)
    
    // Handle specific MongoDB errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided. Please check your input.' },
        { status: 400 }
      )
    }

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