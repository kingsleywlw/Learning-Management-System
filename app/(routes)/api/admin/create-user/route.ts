import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const client = await clerkClient();

    // Get the user data from request body
    const { firstName, lastName, username, emailAddress, password, role } = await request.json();
    
    // Validate required fields
    if (!firstName || !lastName || !username || !emailAddress || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be student, teacher, or admin' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric, dots, underscores, hyphens)
    const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters and contain only letters, numbers, dots, underscores, or hyphens' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Prepare user data for creation with proper typing
    const userData: {
      firstName: string;
      lastName: string;
      username: string;
      emailAddress: string[];
      password: string;
      skipPasswordChecks: boolean;
      publicMetadata: Record<string, any>;
    } = {
      firstName,
      lastName,
      username,
      emailAddress: [emailAddress],
      password,
      skipPasswordChecks: true,
      publicMetadata: {}
    };

    // Set public metadata based on role
    // Students have no public metadata (empty object)
    // Teachers and admins have role in public metadata
    if (role === 'student') {
      userData.publicMetadata = {};
    } else {
      userData.publicMetadata = {
        role: role
      };
    }

    // Create the user using Clerk's backend API
    const newUser = await client.users.createUser(userData);

    return NextResponse.json(
      { 
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
        userId: newUser.id,
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          emailAddress: newUser.emailAddresses[0]?.emailAddress,
          role: role
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating user:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      errors: error.errors,
      clerkTraceId: error.clerkTraceId
    });
    
    // Handle specific Clerk errors
    if (error.status === 422) {
      const clerkErrors = error.errors || [];
      const errorMessages = clerkErrors.map((err: any) => err.message || err.longMessage || 'Validation error').join(', ');
      
      return NextResponse.json(
        { error: `Validation failed: ${errorMessages}` },
        { status: 422 }
      );
    }

    if (error instanceof Error && error.message?.includes('email_address_taken')) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}