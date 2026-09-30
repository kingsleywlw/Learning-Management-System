import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/db/connectMongoDB';
import Course from '@/models/course';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    const { courseId, studentIds } = await request.json();

    // Validate required fields
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one student ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the course by courseId
    const course = await Course.findOne({ courseId });
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Find all students by their clerkIds
    const students = await User.find({ clerkId: { $in: studentIds } });
    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No valid students found' },
        { status: 404 }
      );
    }

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some students could not be found' },
        { status: 404 }
      );
    }

    // Get student MongoDB _ids
    const studentObjectIds = students.map(student => student._id);

    // Check which students are already enrolled
    const alreadyEnrolled = studentObjectIds.filter(studentId => 
      course.enrolledStudentIds.some((enrolledId: any) => enrolledId.toString() === studentId.toString())
    );

    if (alreadyEnrolled.length > 0) {
      return NextResponse.json(
        { error: 'Some students are already enrolled in this course' },
        { status: 409 }
      );
    }

    // Add students to course
    course.enrolledStudentIds.push(...studentObjectIds);
    
    // Add course to each student's enrolledCourseIds
    await Promise.all(
      students.map(student => {
        if (!student.enrolledCourseIds.includes(course._id)) {
          student.enrolledCourseIds.push(course._id);
          return student.save();
        }
        return Promise.resolve();
      })
    );

    // Save the updated course
    const updatedCourse = await course.save();

    // Populate the enrolled students for return
    await updatedCourse.populate('enrolledStudentIds', 'name email clerkId');

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: `Successfully enrolled ${students.length} student(s) in the course`
    });

  } catch (error) {
    console.error('Error enrolling students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}