import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/db/connectMongoDB'
import Assignment from '@/models/assignment'
import { currentUser } from '@clerk/nextjs/server'

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoDB()

    const { assignmentId, status } = await req.json()

    if (!assignmentId || !status) {
      return NextResponse.json(
        { error: 'Assignment ID and status are required' },
        { status: 400 }
      )
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "inactive"' },
        { status: 400 }
      )
    }

    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status },
      { new: true, runValidators: true }
    )

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Assignment status updated successfully',
        assignment 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating assignment status:', error)
    return NextResponse.json(
      { error: 'Failed to update assignment status' },
      { status: 500 }
    )
  }
}
