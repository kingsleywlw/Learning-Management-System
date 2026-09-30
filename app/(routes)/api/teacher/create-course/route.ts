import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/db/connectMongoDB';
import Course from '@/models/course';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    const { courseId, title, credits, userId } = await request.json();

    // Validate required fields
    if (!courseId || !title || !credits || !userId) {
      return NextResponse.json(
        { error: 'Course ID, title, credits, and user ID are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the current user in the database using Clerk ID
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Check if course ID already exists
    const existingCourse = await Course.findOne({ courseId });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course ID already exists' },
        { status: 409 }
      );
    }

    // Create new course with empty lessons and enrolled students
    const newCourse = new Course({
      courseId,
      title,
      credits: Number(credits),
      courseDirectorId: currentUser._id,
      lessonIds: [], // Empty array as requested
      enrolledStudentIds: [], // Empty array as requested
      status: 'active'
    });

    // Save the course to database
    const savedCourse = await newCourse.save();
    
    // Populate the courseDirectorId field for return
    await savedCourse.populate('courseDirectorId', 'name email');

    return NextResponse.json({
      success: true,
      course: savedCourse,
      message: 'Course created successfully'
    });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}