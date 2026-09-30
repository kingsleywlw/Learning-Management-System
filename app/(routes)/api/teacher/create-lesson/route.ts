import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectMongoDB from '../../../../../db/connectMongoDB';
import Lesson from '../../../../../models/lessons';
import Course from '../../../../../models/course';
import User from '../../../../../models/user';

export async function POST(request: NextRequest) {
  try {

    // Parse the request body
    const body = await request.json();
    const {
      userId,
      title,
      description,
      objectives,
      readingList,
      estHoursPerWeek,
      credit,
      status,
      courseId
    } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Lesson title is required' },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the user to get their MongoDB _id
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the course exists and the user is the course director
    const course = await Course.findOne({ courseId });
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is the course director
    if (course.courseDirectorId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized - You are not the course director' },
        { status: 403 }
      );
    }

    // Create the new lesson
    const newLesson = new Lesson({
      title: title.trim(),
      description: description || '',
      objectives: typeof objectives === 'string' ? objectives.trim() : '',
      readingList: Array.isArray(readingList) ? readingList.filter(item => item && item.trim()) : [],
      estHoursPerWeek: estHoursPerWeek || 1,
      designerId: user._id,
      status: status || 'draft',
      credit: credit || 6
    });

    // Save the lesson
    const savedLesson = await newLesson.save();

    // Add the lesson to the course's lessonIds array
    await Course.findByIdAndUpdate(
      course._id,
      { 
        $push: { lessonIds: savedLesson._id } 
      }
    );

    return NextResponse.json({
      success: true,
      lesson: savedLesson,
      message: 'Lesson created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating lesson:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: `Validation error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}