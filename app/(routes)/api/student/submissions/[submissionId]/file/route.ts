import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import StudentSubmission from '@/models/studentSubmission'
import User from '@/models/user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
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

    const { submissionId } = await params

    // Get the submission
    const submission = await StudentSubmission.findById(submissionId)

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found.' },
        { status: 404 }
      )
    }

    // Check if file exists
    if (!submission.fileData) {
      return NextResponse.json(
        { error: 'No file found for this submission.' },
        { status: 404 }
      )
    }

    // Return the PDF file
    return new NextResponse(submission.fileData, {
      status: 200,
      headers: {
        'Content-Type': submission.fileType || 'application/pdf',
        'Content-Disposition': `inline; filename="${submission.fileName || 'assignment.pdf'}"`,
        'Content-Length': submission.fileSize?.toString() || submission.fileData.length.toString()
      }
    })

  } catch (error) {
    console.error('Error retrieving file:', error)

    // Handle specific MongoDB errors
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid submission ID format.' },
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
