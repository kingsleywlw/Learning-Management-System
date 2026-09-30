import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import ForumReply from '@/models/forumReply'
import User from '@/models/user'

// POST - Toggle like on a reply
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    const dbUser = await User.findOne({ clerkId: user.id })
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { replyId } = body

    if (!replyId) {
      return NextResponse.json(
        { error: 'Reply ID is required.' },
        { status: 400 }
      )
    }

    const reply = await ForumReply.findById(replyId)
    
    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found.' },
        { status: 404 }
      )
    }

    // Check if user already liked the reply
    const likeIndex = reply.likes.indexOf(dbUser._id)
    
    if (likeIndex > -1) {
      // Unlike
      reply.likes.splice(likeIndex, 1)
    } else {
      // Like
      reply.likes.push(dbUser._id)
    }

    await reply.save()

    return NextResponse.json({
      success: true,
      liked: likeIndex === -1,
      likeCount: reply.likes.length
    })

  } catch (error) {
    console.error('Error toggling reply like:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}