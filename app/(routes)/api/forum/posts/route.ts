import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import ForumPost from '@/models/forumPost'
import User from '@/models/user'

// GET - Fetch all forum posts
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'recent' // recent, popular, oldest

    // Build query
    const query: any = {}
    if (category && category !== 'all') {
      query.category = category
    }

    // Build sort
    let sort: any = {}
    switch (sortBy) {
      case 'popular':
        sort = { likes: -1, createdAt: -1 }
        break
      case 'oldest':
        sort = { createdAt: 1 }
        break
      case 'recent':
      default:
        sort = { isPinned: -1, createdAt: -1 }
        break
    }

    const posts = await ForumPost.find(query)
      .populate('authorId', 'name email')
      .sort(sort)
      .lean()

    return NextResponse.json({
      success: true,
      posts: posts
    })

  } catch (error) {
    console.error('Error fetching forum posts:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

// POST - Create a new forum post
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
    const { title, content, category } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required.' },
        { status: 400 }
      )
    }

    const newPost = await ForumPost.create({
      title,
      content,
      category: category || 'General',
      authorId: dbUser._id
    })

    const populatedPost = await ForumPost.findById(newPost._id)
      .populate('authorId', 'name email')
      .lean()

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating forum post:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}