import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import Course from '@/models/course'
import Assignment from '@/models/assignment'
import User from '@/models/user'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
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

        const { courseId } = await params

        // Get the course with populated assignments
        const course: any = await Course.findById(courseId)
            .populate('assignmentIds')
            .lean()

        if (!course) {
            return NextResponse.json(
                { error: 'Course not found.' },
                { status: 404 }
            )
        }

        // Verify the teacher is the course director
        if (course.courseDirectorId.toString() !== dbUser._id.toString()) {
            return NextResponse.json(
                { error: 'You can only view assignments for courses you direct.' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            assignments: course.assignmentIds || []
        })

    } catch (error) {
        console.error('Error fetching course assignments:', error)

        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        )
    }
}