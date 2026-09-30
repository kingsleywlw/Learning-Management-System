import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../../../db/connectMongoDB';
import Course from '../../../../../models/course';
import User from '../../../../../models/user';
import Lesson from '../../../../../models/lessons';
import Assignment from '../../../../../models/assignment';

// Ensure models are registered
Lesson;
Assignment;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Validate required fields
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the course by courseId (string field, not ObjectId)
    const course = await Course.findOne({ courseId })
      .populate('courseDirectorId', 'name email')
      .populate('lessonIds')
      .populate('assignmentIds')
      .populate('enrolledStudentIds', 'name email');

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course,
      message: 'Course retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}