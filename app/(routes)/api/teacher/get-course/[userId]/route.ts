import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../../../../db/connectMongoDB';
import Course from '../../../../../../models/course';
import User from '../../../../../../models/user';
import Lesson from '../../../../../../models/lessons';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Find all courses where the current user is the course director
    const courses = await Course.find({ 
      courseDirectorId: currentUser._id 
    }).populate('courseDirectorId', 'name email')
      .sort({ _id: -1 }); // Sort by newest first (using _id since createdAt might not exist)

    return NextResponse.json({
      success: true,
      courses,
      message: 'Courses retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}