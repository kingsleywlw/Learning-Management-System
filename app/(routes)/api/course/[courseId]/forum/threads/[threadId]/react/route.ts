import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/db/connectMongoDB'
import ForumThread from '@/models/forumThread'
import { requireCourseAccess } from '../../../_auth'



export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; threadId: string }> }
) {
  try {
    const { courseId, threadId } = await params;
    const access = await requireCourseAccess(courseId);
    if (!access.ok) return NextResponse.json({ error: access.msg }, { status: access.status });

    await connectMongoDB();

    const body = await req.json();
    const { type, target, commentId, replyId } = body;

    if (type !== 'love') {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    const t: any = await ForumThread.findOne({ _id: threadId, courseIdStr: courseId });
    if (!t) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

    const userId = access.cu!.id;

    // Helper function to toggle reaction
    const toggleReaction = (item: any) => {
      if (!item.reactions) item.reactions = {};
      if (!item.reactions[type]) item.reactions[type] = [];
      
      const index = item.reactions[type].indexOf(userId);
      if (index > -1) {
        // Remove reaction
        item.reactions[type].splice(index, 1);
      } else {
        // Add reaction
        item.reactions[type].push(userId);
      }
    };

    if (target === 'thread') {
      toggleReaction(t);
    } else if (target === 'comment' && commentId) {
      const comment: any = t.comments.id(commentId);
      if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      toggleReaction(comment);
    } else if (target === 'reply' && commentId && replyId) {
      const comment: any = t.comments.id(commentId);
      if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

      // Recursive function to find reply at any depth
      const findReply = (replies: any[], replyId: string): any => {
        for (const reply of replies) {
          if (String(reply._id) === String(replyId)) return reply;
          if (reply.replies && reply.replies.length > 0) {
            const found = findReply(reply.replies, replyId);
            if (found) return found;
          }
        }
        return null;
      };

      const reply = findReply(comment.replies || [], replyId);
      if (!reply) return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
      
      toggleReaction(reply);
    } else {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    }

    await t.save();
    return NextResponse.json(t);
  } catch (error: any) {
    console.error('Reaction error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}