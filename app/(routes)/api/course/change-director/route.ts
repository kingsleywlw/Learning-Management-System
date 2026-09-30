import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/db/connectMongoDB';
import Course from '@/models/course';
import User from '@/models/user';

export async function PATCH(request: NextRequest) {
  try {
    const { courseId, courseDirectorId } = await request.json();

    // Validate required fields
    if (!courseId || !courseDirectorId) {
      return NextResponse.json(
        { error: 'Course ID and course director ID are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the course by courseId (not _id)
    const course = await Course.findOne({ courseId });
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Find the new course director by clerkId
    const newDirector = await User.findOne({ clerkId: courseDirectorId });
    if (!newDirector) {
      return NextResponse.json(
        { error: 'Course director not found' },
        { status: 404 }
      );
    }

    // Update the course director
    course.courseDirectorId = newDirector._id;
    const updatedCourse = await course.save();

    // Populate the courseDirectorId field for return
    await updatedCourse.populate('courseDirectorId', 'name email clerkId');

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: 'Course director updated successfully'
    });

  } catch (error) {
    console.error('Error updating course director:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}