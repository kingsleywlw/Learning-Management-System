import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../../../db/connectMongoDB';
import User from '../../../../../models/user';
import Course from '../../../../../models/course';
import Theme from '../../../../../models/theme';

// Ensure models are registered with Mongoose
// These lines prevent tree-shaking and ensure models are available for populate
void User;
void Course;
void Theme;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Validate required parameter
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the user by clerkId and populate enrolled courses and selected theme
    const user = await User.findOne({ clerkId: userId })
      .populate({
        path: 'enrolledCourseIds',
        select: 'courseId title description credits status courseDirectorId',
        populate: {
          path: 'courseDirectorId',
          select: 'name email'
        },
        strictPopulate: false
      })
      .populate({
        path: 'selectedThemeId',
        select: 'hexColor description',
        strictPopulate: false
      });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        dateEnrolled: user.dateEnrolled,
        status: user.status,
        currentCreditPoints: user.currentCreditPoints,
        selectedThemeId: user.selectedThemeId?._id || null,
        selectedTheme: user.selectedThemeId || null,
        enrolledCourses: user.enrolledCourseIds || []
      },
      message: 'User data retrieved successfully'
    });

  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    
    // Handle specific mongoose errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}