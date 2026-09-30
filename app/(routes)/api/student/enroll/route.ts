import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import User from '@/models/user'
import Course from '@/models/course'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    await connectMongoDB()

    // Find the user in our database
    const dbUser = await User.findOne({ clerkId: user.id })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if course is active
    if (course.status !== 'active') {
      return NextResponse.json({ error: 'Course is not available for enrollment' }, { status: 400 })
    }

    // Check if student is already enrolled
    if (dbUser.enrolledCourseIds.includes(courseId)) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 })
    }

    // Check if student is already in the course's enrolled students
    if (course.enrolledStudentIds.includes(dbUser._id)) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 })
    }

    // Add course to user's enrolled courses
    dbUser.enrolledCourseIds.push(courseId)
    await dbUser.save()

    // Add student to course's enrolled students
    course.enrolledStudentIds.push(dbUser._id)
    await course.save()

    return NextResponse.json({ 
      message: 'Successfully enrolled in course',
      course: {
        id: course._id,
        courseId: course.courseId,
        title: course.title,
        credits: course.credits
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}