import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import Course from '@/models/course'
import User from '@/models/user'
import Lesson from '@/models/lessons'

// Ensure models are registered
Course;
User;
Lesson;

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoDB()

    // Find the user in our database to get their enrolled courses
    const dbUser = await User.findOne({ clerkId: user.id })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all active courses with course director populated
    const allCourses = await Course.find({ status: 'active' })
      .populate('courseDirectorId', 'name')
      .populate('lessonIds')
      .sort({ courseId: 1 })

    // Filter out courses the student is already enrolled in
    const availableCourses = allCourses.filter((course: any) => 
      !dbUser.enrolledCourseIds.some((enrolledId: any) => enrolledId.toString() === course._id.toString())
    )

    return NextResponse.json({ courses: availableCourses }, { status: 200 })

  } catch (error) {
    console.error('Error fetching available courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
