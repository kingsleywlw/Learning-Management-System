import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/db/connectMongoDB'
import ForumThread from '@/models/forumThread'
import { requireCourseAccess } from '../_auth'

// /app/(routes)/api/course/[courseId]/forum/threads/route.ts

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;                 
    const access = await requireCourseAccess(courseId)
    if (!access.ok) return NextResponse.json({ error: access.msg }, { status: access.status })

    await connectMongoDB()
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const tag = searchParams.get('tag') || ''
    const author = searchParams.get('author') || ''
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = 20

    // Base filter: match by courseIdStr OR courseRef
    const base = { $or: [{ courseIdStr: courseId }, { courseRef: access.course._id }] }
    
    // Build filter conditions
    const conditions: any[] = [base];
    
    // Add search filter if query exists
    if (q) {
      conditions.push({
        $or: [
          { title: new RegExp(q, 'i') },
          { content: new RegExp(q, 'i') }
        ]
      });
    }
    
    // Add tag filter
    if (tag) {
      conditions.push({ tags: tag });
    }
    
    // Add author filter
    if (author) {
      conditions.push({ authorName: new RegExp(`^${author}$`, 'i') });
    }

    // Combine all conditions with AND
    const filter = conditions.length > 1 ? { $and: conditions } : base;

    const [items, total] = await Promise.all([
      (ForumThread as any)
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      (ForumThread as any).countDocuments(filter),
    ])

    return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) })
  } catch (err: any) {
    console.error('GET /threads failed:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;                 
    const access = await requireCourseAccess(courseId)
    if (!access.ok) {
      return NextResponse.json({ step: 'auth', error: access.msg }, { status: access.status })
    }
    if (!access.course?._id) {
      return NextResponse.json({ step: 'auth', error: 'No course._id from requireCourseAccess' }, { status: 500 })
    }

    await connectMongoDB()

    const body = await req.json().catch(() => ({}))
    const title = String(body?.title || '').trim()
    const content = String(body?.content || '').trim()
    // FIXED: Convert tags array to space-separated string
    const tags = Array.isArray(body?.tags) ? body.tags.join(' ') : ''

    if (!title || !content) {
      return NextResponse.json({ step: 'validate', error: 'Title and content are required' }, { status: 400 })
    }

    const doc = await (ForumThread as any).create({
      courseIdStr: courseId,
      courseRef: access.course._id,
      authorId: access.cu!.id,
      authorName: access.cu!.fullName || 'Student',
      title,
      content,
      tags,
    })

    return NextResponse.json({ step: 'ok', ...doc.toObject?.() ?? doc }, { status: 201 })
  } catch (e: any) {
    console.error('POST /threads failed:', e)
    return NextResponse.json({ step: 'create', error: e?.message || 'Server error' }, { status: 500 })
  }
}