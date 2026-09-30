import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/db/connectMongoDB'
import Lesson from '@/models/lessons'
import { currentUser } from '@clerk/nextjs/server'

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoDB()

    const { lessonId, status } = await req.json()

    if (!lessonId || !status) {
      return NextResponse.json(
        { error: 'Lesson ID and status are required' },
        { status: 400 }
      )
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "inactive"' },
        { status: 400 }
      )
    }

    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { status },
      { new: true, runValidators: true }
    )

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Lesson status updated successfully',
        lesson 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating lesson status:', error)
    return NextResponse.json(
      { error: 'Failed to update lesson status' },
      { status: 500 }
    )
  }
}
