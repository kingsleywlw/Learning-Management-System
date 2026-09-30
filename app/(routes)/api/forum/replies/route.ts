import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import ForumReply from '@/models/forumReply'
import ForumPost from '@/models/forumPost'
import User from '@/models/user'

// GET - Fetch replies for a post
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB()

    const searchParams = request.nextUrl.searchParams
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required.' },
        { status: 400 }
      )
    }

    const replies = await ForumReply.find({ postId })
      .populate('authorId', 'name email')
      .sort({ createdAt: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      replies: replies
    })

  } catch (error) {
    console.error('Error fetching replies:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

// POST - Create a new reply
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
    const { postId, content } = body

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Post ID and content are required.' },
        { status: 400 }
      )
    }

    // Verify post exists
    const post = await ForumPost.findById(postId)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found.' },
        { status: 404 }
      )
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: 'This post is locked and cannot receive new replies.' },
        { status: 403 }
      )
    }

    // Create reply
    const newReply = await ForumReply.create({
      content,
      postId,
      authorId: dbUser._id
    })

    // Update post reply count
    post.replyCount = (post.replyCount || 0) + 1
    await post.save()

    const populatedReply = await ForumReply.findById(newReply._id)
      .populate('authorId', 'name email')
      .lean()

    return NextResponse.json({
      success: true,
      message: 'Reply created successfully',
      reply: populatedReply
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}