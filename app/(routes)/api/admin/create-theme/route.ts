import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/db/connectMongoDB';
import Theme from '@/models/theme';

export async function POST(request: NextRequest) {
  try {
    // Get the theme data from request body
    const { hexColor, description } = await request.json();

    // Connect to MongoDB
    await connectMongoDB();

    // Create new theme
    const newTheme = await Theme.create({
    hexColor: hexColor.toUpperCase(),
    description: description.trim()
    });

    return NextResponse.json(
      { 
        message: 'Theme created successfully',
        theme: {
          id: newTheme._id,
          hexColor: newTheme.hexColor,
          description: newTheme.description,
          createdAt: newTheme.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating theme:', error);
    
    // Handle duplicate theme (if you add unique constraint later)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A theme with this color or description already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
