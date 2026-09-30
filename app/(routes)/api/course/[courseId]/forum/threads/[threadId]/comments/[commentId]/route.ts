import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/db/connectMongoDB'
import ForumThread from '@/models/forumThread'
import { requireCourseAccess } from '../../../../_auth'

ForumThread;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; threadId: string; commentId: string }> }
) {
  const { courseId, threadId, commentId } = await params; // ✅ await params
  const access = await requireCourseAccess(courseId);
  if (!access.ok) return NextResponse.json({ error: access.msg }, { status: access.status });

  await connectMongoDB();
  const t: any = await (ForumThread as any).findOne({ _id: threadId, courseIdStr: courseId });
  if (!t) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  const c: any = t.comments.id(commentId);
  if (!c) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  if (String(c.authorId) !== String(access.cu!.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { content } = await req.json();
  if (typeof content === 'string') c.content = content;
  await t.save();
  return NextResponse.json(t);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ courseId: string; threadId: string; commentId: string }> }
) {
  const { courseId, threadId, commentId } = await params; // ✅ await params
  const access = await requireCourseAccess(courseId);
  if (!access.ok) return NextResponse.json({ error: access.msg }, { status: access.status });

  await connectMongoDB();
  const t: any = await (ForumThread as any).findOne({ _id: threadId, courseIdStr: courseId });
  if (!t) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  const c: any = t.comments.id(commentId);
  if (!c) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  if (String(c.authorId) !== String(access.cu!.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  c.deleteOne();
  await t.save();
  return NextResponse.json(t);
}
