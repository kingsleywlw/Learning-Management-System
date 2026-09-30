import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import Course from '@/models/course'
import StudentSubmission from '@/models/studentSubmission'
import User from '@/models/user'
import Assignment from '@/models/assignment'

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
        const { studentId, assignmentId, courseId, grade } = body

        // Validate required fields
        if (!studentId || !assignmentId || !courseId || !grade) {
            return NextResponse.json(
                { error: 'studentId, assignmentId, courseId, and grade are required.' },
                { status: 400 }
            )
        }

        // Validate grade value
        if (!['P', 'F'].includes(grade)) {
            return NextResponse.json(
                { error: 'Grade must be either "P" (Pass) or "F" (Fail).' },
                { status: 400 }
            )
        }

        // Verify the course exists and teacher is the director
        const course: any = await Course.findById(courseId).lean()

        if (!course) {
            return NextResponse.json(
                { error: 'Course not found.' },
                { status: 404 }
            )
        }

        if (course.courseDirectorId.toString() !== dbUser._id.toString()) {
            return NextResponse.json(
                { error: 'You can only grade submissions for courses you direct.' },
                { status: 403 }
            )
        }

        // Verify the assignment belongs to the course
        const assignment: any = await Assignment.findById(assignmentId).lean()

        if (!assignment) {
            return NextResponse.json(
                { error: 'Assignment not found.' },
                { status: 404 }
            )
        }

        if (assignment.courseId.toString() !== courseId) {
            return NextResponse.json(
                { error: 'Assignment does not belong to this course.' },
                { status: 400 }
            )
        }

        // Get the student from database
        const student = await User.findById(studentId)

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found.' },
                { status: 404 }
            )
        }

        // Find or create the submission
        let submission = await StudentSubmission.findOne({
            studentId: studentId,
            assignmentId: assignmentId
        })

        if (!submission) {
            return NextResponse.json(
                { error: 'Student has not submitted this assignment yet.' },
                { status: 400 }
            )
        }

        // Check if submission has been submitted
        if (submission.status === 'Pending') {
            return NextResponse.json(
                { error: 'Cannot grade a submission that has not been submitted yet.' },
                { status: 400 }
            )
        }

        // Update the submission with grade
        submission.grade = grade
        submission.status = 'Graded'

        await submission.save()

        return NextResponse.json({
            success: true,
            message: 'Grade submitted successfully',
            submission: {
                _id: submission._id,
                studentId: submission.studentId,
                assignmentId: submission.assignmentId,
                grade: submission.grade,
                status: submission.status
            }
        })

    } catch (error) {
        console.error('Error grading submission:', error)

        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        )
    }
}