import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../../../db/connectMongoDB';
import User from '../../../../../models/user';
import Theme from '../../../../../models/theme';

// Ensure models are registered with Mongoose
void User;
void Theme;

export async function PATCH(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, themeId } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // If themeId is null, reset to default theme (no specific theme selected)
    if (themeId === null) {
      // Update user's selected theme to null (default theme)
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: userId },
        { selectedThemeId: null },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Theme reset to default successfully',
        user: {
          id: updatedUser._id,
          clerkId: updatedUser.clerkId,
          selectedThemeId: null,
          selectedTheme: null
        }
      }, { status: 200 });
    }

    // Validate themeId is provided for non-default themes
    if (!themeId) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    // Verify the theme exists
    const themeExists = await Theme.findById(themeId);
    if (!themeExists) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Update user's selected theme
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { selectedThemeId: themeId },
      { new: true, runValidators: true }
    ).populate({
      path: 'selectedThemeId',
      select: 'hexColor description'
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Theme updated successfully',
      user: {
        id: updatedUser._id,
        clerkId: updatedUser.clerkId,
        selectedThemeId: updatedUser.selectedThemeId?._id || null,
        selectedTheme: updatedUser.selectedThemeId || null
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error updating user theme:', error);
    
    // Handle specific mongoose errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}