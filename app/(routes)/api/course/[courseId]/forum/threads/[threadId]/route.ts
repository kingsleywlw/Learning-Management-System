import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/db/connectMongoDB'
import ForumThread from '@/models/forumThread'
import { requireCourseAccess } from '../../_auth'

ForumThread;


export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ courseId: string; threadId: string }> }
) {
  const { courseId, threadId } = await params;  // ✅ await
  const access = await requireCourseAccess(courseId);
  if (!access.ok) return NextResponse.json({ error: access.msg }, { status: access.status });

  await connectMongoDB();

  const t = await (ForumThread as any).findOne({ _id: threadId, courseIdStr: courseId });
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(t);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; threadId: string }> }
) {
  const { courseId, threadId } = await params;  // ✅ await
  const access = await requireCourseAccess(courseId);
  if (!access.ok) return NextResponse.json({ error: access.msg }, { status: access.status });

  const { cu } = access;
  await connectMongoDB();

  const t: any = await (ForumThread as any).findOne({ _id: threadId, courseIdStr: courseId });
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (String(t.authorId) !== String(cu!.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (body.title !== undefined) t.title = body.title;
  if (body.content !== undefined) t.content = body.content;
  if (body.tags !== undefined) t.tags = Array.isArray(body.tags) ? body.tags.join(' ') : '';
  await t.save();
  return NextResponse.json(t);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ courseId: string; threadId: string }> }
) {
  const { courseId, threadId } = await params;  // ✅ await
  const access = await requireCourseAccess(courseId);
  if (!access.ok) return NextResponse.json({ error: access.msg }, { status: access.status });

  const { cu } = access;
  await connectMongoDB();

  const t: any = await (ForumThread as any).findOne({ _id: threadId, courseIdStr: courseId });
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (String(t.authorId) !== String(cu!.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await t.deleteOne();
  return NextResponse.json({ ok: true });
}
