"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

type ReactionType = "love";

export default function ThreadDetailPage() {
  const { courseId, threadId } = useParams() as { courseId: string; threadId: string };
  const API = `/api/course/${courseId}/forum/threads/${threadId}`;
  const router = useRouter();
  const { user } = useUser();

  const [thread, setThread] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function load() {
    const res = await fetch(API, { cache: "no-store" });
    const data = await res.json();
    setThread(data);
    setDraft({ title: data.title || "", content: data.content || "" });
  }

  async function save() {
    await fetch(API, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setEdit(false);
    load();
  }

  async function delThread() {
    await fetch(API, { method: "DELETE" });
    router.push(`/student/courses/${courseId}/forum`);
  }

  useEffect(() => { load(); }, [courseId, threadId]);

  if (!thread) return <div className="p-4">Loading…</div>;

  // Check if current user is the thread author
  const isThreadAuthor = user?.id && String(thread.authorId) === String(user.id);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {!edit ? (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{thread.title}</h1>
            {isThreadAuthor && (
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-ghost gap-2" 
                  onClick={() => setEdit(true)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50 gap-2" 
                  onClick={() => setShowDeleteModal(true)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            by {thread.authorName} • {new Date(thread.createdAt).toLocaleString()}
          </div>
          <p className="whitespace-pre-wrap">{thread.content}</p>

          <ReactionBar courseId={courseId} threadId={threadId} target="thread" item={thread} onChanged={load} />

          <CommentComposer courseId={courseId} threadId={threadId} onAdded={load} />
          <CommentList courseId={courseId} threadId={threadId} comments={thread.comments || []} onChanged={load} currentUserId={user?.id} />
        </>
      ) : (
        <div className="space-y-2">
          <input className="input input-bordered w-full" value={draft.title} onChange={(e)=>setDraft(s=>({...s, title:e.target.value}))} />
          <textarea className="textarea textarea-bordered w-full" rows={6} value={draft.content} onChange={(e)=>setDraft(s=>({...s, content:e.target.value}))} />
          <div className="flex gap-2">
            <button className="btn btn-neutral" onClick={save}>Save</button>
            <button className="btn" onClick={()=>setEdit(false)}>Cancel</button>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        title="Delete Thread"
        message="Are you sure you want to delete this thread? This action cannot be undone."
        onConfirm={() => {
          setShowDeleteModal(false);
          delThread();
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

function DeleteModal({ isOpen, title, message, onConfirm, onCancel }: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ReactionBar({ courseId, threadId, target, item, commentId, replyId, onChanged }:{
  courseId:string; threadId:string; target:'thread'|'comment'|'reply'; item:any; commentId?:string; replyId?:string; onChanged:()=>void;
}) {
  const API = `/api/course/${courseId}/forum/threads/${threadId}/react`;
  const count = item?.reactions?.love?.length || 0;

  async function toggle(){
    await fetch(API, { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify({ 
        type:'love', 
        target, 
        commentId,
        replyId 
      })
    });
    onChanged();
  }
  
  return (
    <div className="flex gap-3 text-sm">
      <button 
        className="flex items-center gap-1 hover:scale-110 transition-transform" 
        onClick={toggle}
      >
        <span className="text-xl">❤️</span>
        <span className="text-gray-600">{count}</span>
      </button>
    </div>
  );
}

function CommentComposer({ courseId, threadId, onAdded }:{ courseId:string; threadId:string; onAdded:()=>void }) {
  const [content, setContent] = useState("");
  const API = `/api/course/${courseId}/forum/threads/${threadId}/comments`;
  async function add(){
    if(!content.trim()) return;
    await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content }) });
    setContent(""); onAdded();
  }
  return (
    <div className="card bg-base-100 shadow-sm p-3 mt-4">
      <div className="flex gap-2">
        <input className="input input-bordered flex-1" placeholder="Write a comment…" value={content} onChange={(e)=>setContent(e.target.value)} />
        <button className="btn" onClick={add}>Comment</button>
      </div>
    </div>
  );
}

function CommentList({ courseId, threadId, comments, onChanged, currentUserId }:{
  courseId:string; threadId:string; comments:any[]; onChanged:()=>void; currentUserId?: string;
}) {
  return (
    <div className="space-y-3 mt-2">
      {comments.map(c=> (
        <CommentItem key={c._id} courseId={courseId} threadId={threadId} comment={c} onChanged={onChanged} currentUserId={currentUserId}/>
      ))}
    </div>
  );
}

function ReplyNode({
  reply,
  courseId,
  threadId,
  commentId,
  onChanged,
  currentUserId,
  level = 1,
}: {
  reply: any;
  courseId: string;
  threadId: string;
  commentId: string;
  onChanged: () => void;
  currentUserId?: string;
  level?: number;
}) {
  const [showBox, setShowBox] = React.useState(false);
  const [text, setText] = React.useState("");

  const base = `/api/course/${courseId}/forum/threads/${threadId}/comments/${commentId}/replies`;
  
  async function send() {
    if (!text.trim()) return;
    await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, parentReplyId: reply._id }),
    });
    setText("");
    setShowBox(false);
    onChanged();
  }

  return (
    <div style={{ marginLeft: level * 16 }} className="pl-3 border-l space-y-2">
      <div className="text-sm text-gray-500">
        {reply.authorName} • {new Date(reply.createdAt).toLocaleString()}
      </div>
      
      <div className="whitespace-pre-wrap">{reply.content}</div>

      {/* Added reaction bar for replies */}
      <ReactionBar 
        courseId={courseId} 
        threadId={threadId} 
        target="reply" 
        item={reply} 
        commentId={commentId}
        replyId={reply._id}
        onChanged={onChanged} 
      />

      <div className="flex gap-2 items-center flex-wrap">
        <button className="text-xs underline" onClick={() => setShowBox(v => !v)}>
          Reply
        </button>
        
        {/* REMOVED: Edit and Delete buttons for replies */}
      </div>

      {showBox && (
        <div className="flex gap-2 mt-2">
          <input
            className="input input-bordered flex-1"
            placeholder="Write a reply…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-sm" onClick={send}>Reply</button>
        </div>
      )}

      {reply.replies?.length > 0 &&
        reply.replies.map((child: any) => (
          <ReplyNode
            key={child._id}
            reply={child}
            courseId={courseId}
            threadId={threadId}
            commentId={commentId}
            onChanged={onChanged}
            currentUserId={currentUserId}
            level={level + 1}
          />
        ))}
    </div>
  );
}

function CommentItem({ courseId, threadId, comment, onChanged, currentUserId }:{
  courseId:string; threadId:string; comment:any; onChanged:()=>void; currentUserId?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [reply, setReply] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const base = `/api/course/${courseId}/forum/threads/${threadId}/comments/${comment._id}`;
  const isOwner = currentUserId && String(comment.authorId) === String(currentUserId);

  async function save(){
    await fetch(base, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: draft })});
    setEditing(false); onChanged();
  }
  async function del(){
    await fetch(base, { method:'DELETE' });
    onChanged();
  }
  async function sendReply(){
    if(!reply.trim()) return;
    await fetch(`${base}/replies`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: reply })});
    setReply(""); onChanged();
  }

  return (
    <div className="border rounded-lg p-3">
      <div className="text-sm text-gray-500">
        {comment.authorName} • {new Date(comment.createdAt).toLocaleString()}
      </div>
      {!editing ? (
        <div className="whitespace-pre-wrap my-2">{comment.content}</div>
      ) : (
        <textarea className="textarea textarea-bordered w-full my-2" rows={3} value={draft} onChange={(e)=>setDraft(e.target.value)} />
      )}
      <ReactionBar courseId={courseId} threadId={threadId} target="comment" item={comment} commentId={comment._id} onChanged={onChanged} />
      
      {isOwner && (
        <div className="flex gap-2 mt-2">
          {!editing ? (
            <>
              <button 
                className="btn btn-xs btn-ghost gap-1" 
                onClick={()=>setEditing(true)}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button 
                className="btn btn-xs btn-ghost text-red-600 hover:bg-red-50 gap-1" 
                onClick={() => setShowDeleteModal(true)}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-xs btn-neutral" onClick={save}>Save</button>
              <button className="btn btn-xs" onClick={()=>setEditing(false)}>Cancel</button>
            </>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <input className="input input-bordered flex-1" placeholder="Write a reply…" value={reply} onChange={(e)=>setReply(e.target.value)} />
        <button className="btn" onClick={sendReply}>Reply</button>
      </div>

      {comment.replies?.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((r:any) => (
            <ReplyNode
              key={r._id}
              reply={r}
              courseId={courseId}
              threadId={threadId}
              commentId={comment._id}
              onChanged={onChanged}
              currentUserId={currentUserId}
              level={1}
            />
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={() => {
          setShowDeleteModal(false);
          del();
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}