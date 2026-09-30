import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../../db/connectMongoDB';
import Theme from '../../../../models/theme';

export async function GET(_request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Get all themes from the database
    const themes = await Theme.find({}).select('hexColor description');

    if (!themes || themes.length === 0) {
      return NextResponse.json(
        { error: 'No themes found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      themes,
      message: 'Themes retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST method to create a new theme (optional)
export async function POST(request: NextRequest) {
  try {
    const { hexColor, description } = await request.json();

    // Validate required fields
    if (!hexColor || !description) {
      return NextResponse.json(
        { error: 'Hex color and description are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Create new theme
    const newTheme = new Theme({
      hexColor,
      description
    });

    await newTheme.save();

    return NextResponse.json({
      success: true,
      theme: newTheme,
      message: 'Theme created successfully'
    });

  } catch (error: unknown) {
    console.error('Error creating theme:', error);
    
    // Handle duplicate key error (unique constraint on hexColor)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Theme with this color already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}