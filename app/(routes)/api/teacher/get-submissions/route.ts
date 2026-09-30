import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import Course from '@/models/course'
import StudentSubmission from '@/models/studentSubmission'
import User from '@/models/user'

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
        const searchParams = request.nextUrl.searchParams
        const courseId = searchParams.get('courseId')
        const assignmentId = searchParams.get('assignmentId')

        if (!courseId || !assignmentId) {
            return NextResponse.json(
                { error: 'courseId and assignmentId are required.' },
                { status: 400 }
            )
        }

        // Get the course and verify teacher access
        const course: any = await Course.findById(courseId)
            .populate('enrolledStudentIds')
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
                { error: 'You can only view submissions for courses you direct.' },
                { status: 403 }
            )
        }

        // Get all enrolled students
        const students = course.enrolledStudentIds || []

        // Get all submissions for this assignment
        const submissions = await StudentSubmission.find({
            assignmentId: assignmentId
        })
            .populate('studentId', 'name email')
            .lean()

        return NextResponse.json({
            success: true,
            students: students,
            submissions: submissions
        })

    } catch (error) {
        console.error('Error fetching submissions:', error)

        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        )
    }
}