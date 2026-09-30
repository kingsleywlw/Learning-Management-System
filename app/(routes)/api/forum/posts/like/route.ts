import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import ForumPost from '@/models/forumPost'
import User from '@/models/user'

// POST - Toggle like on a post
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
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required.' },
        { status: 400 }
      )
    }

    const post = await ForumPost.findById(postId)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found.' },
        { status: 404 }
      )
    }

    // Check if user already liked the post
    const likeIndex = post.likes.indexOf(dbUser._id)
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1)
    } else {
      // Like
      post.likes.push(dbUser._id)
    }

    await post.save()

    return NextResponse.json({
      success: true,
      liked: likeIndex === -1,
      likeCount: post.likes.length
    })

  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}