import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/db/connectMongoDB'
import ForumThread from '@/models/forumThread'
import { requireCourseAccess } from '../../../../../_auth'

ForumThread;

function findReplyById(list: any[], id: string): any | null {
  for (const r of list) {
    if (String(r._id) === String(id)) return r;
    const found = r.replies?.length ? findReplyById(r.replies, id) : null;
    if (found) return found;
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; threadId: string; commentId: string }> }
) {
  const { courseId, threadId, commentId } = await params;
  const access = await requireCourseAccess(courseId);
  if (!access.ok) return NextResponse.json({ error: access.msg }, { status: access.status });

  await connectMongoDB();

  const body = await req.json();
  const content = (body?.content || '').trim();
  const parentReplyId: string | undefined = body?.parentReplyId;

  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

  const t: any = await (ForumThread as any).findOne({ _id: threadId, courseIdStr: courseId });
  if (!t) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  const c: any = t.comments.id(commentId);
  if (!c) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

  const payload = {
    authorId: access.cu!.id,
    authorName: access.cu!.fullName || 'Student',
    content,
    reactions: {},
    replies: []
  };

  if (!parentReplyId) {
    // reply to the comment
    c.replies.unshift(payload);
  } else {
    // reply to an existing reply (any depth)
    const parent = findReplyById(c.replies || [], parentReplyId);
    if (!parent) return NextResponse.json({ error: 'Parent reply not found' }, { status: 404 });
    parent.replies ??= [];
    parent.replies.unshift(payload);
  }

  await t.save();
  return NextResponse.json(t, { status: 201 });
}
