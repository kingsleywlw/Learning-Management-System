import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectMongoDB from '../../../../../db/connectMongoDB';
import Lesson from '../../../../../models/lessons';
import Course from '../../../../../models/course';
import User from '../../../../../models/user';

// Ensure Lesson model is registered
Lesson;

export async function DELETE(request: NextRequest) {
  try {
    // Get authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { lessonId } = body;

    // Validate required fields
    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
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

    // Find the lesson to verify it exists and check authorization
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check if the user is the lesson designer (creator)
    if (lesson.designerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete lessons you created' },
        { status: 403 }
      );
    }

    // Find all courses that reference this lesson and remove the lesson from their lessonIds arrays
    await Course.updateMany(
      { lessonIds: lessonId },
      { $pull: { lessonIds: lessonId } }
    );

    // Delete the lesson
    await Lesson.findByIdAndDelete(lessonId);

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    
    // Handle specific mongoose errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid lesson ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}