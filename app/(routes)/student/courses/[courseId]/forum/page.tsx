"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type ReactionMap = { love: string[] };

export default function CourseForumPage() {
  const { courseId } = useParams() as { courseId: string };
  const API = `/api/course/${courseId}/forum`;

  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({ title: "", content: "" });

  async function loadThreads(query = "") {
    setLoading(true);
    try {
      const url = query 
        ? `${API}/threads?q=${encodeURIComponent(query)}`
        : `${API}/threads`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setThreads(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function createThread() {
    // Reset errors
    setErrors({ title: "", content: "" });

    // Validate
    const newErrors = { title: "", content: "" };
    let hasError = false;

    if (!title.trim()) {
      newErrors.title = "Title cannot be empty";
      hasError = true;
    }

    if (!content.trim()) {
      newErrors.content = "Content cannot be empty";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Create thread
    await fetch(`${API}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    
    setTitle(""); 
    setContent(""); 
    setShowComposer(false);
    setErrors({ title: "", content: "" });
    loadThreads(searchQuery);
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    loadThreads(value);
  }

  function clearSearch() {
    setSearchQuery("");
    loadThreads("");
  }

  function highlightText(text: string, query: string) {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-600 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  useEffect(() => { loadThreads(); }, [courseId]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forum · {courseId}</h1>
        <button className="btn btn-primary" onClick={() => setShowComposer((v) => !v)}>
          {showComposer ? "Close" : "New Thread"}
        </button>
      </div>

      {/* Composer (hidden until clicked) */}
      {showComposer && (
        <div className="card bg-base-100 shadow-sm p-4">
          <div className="space-y-3">
            <div>
              <input
                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                placeholder="Thread title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
                }}
              />
              {errors.title && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.title}</span>
                </div>
              )}
            </div>

            <div>
              <textarea
                className={`textarea textarea-bordered w-full ${errors.content ? 'textarea-error' : ''}`}
                rows={4}
                placeholder="Write your question or topic…"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors(prev => ({ ...prev, content: "" }));
                }}
              />
              {errors.content && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.content}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="btn btn-neutral" onClick={createThread}>Post</button>
              <button 
                className="btn" 
                onClick={() => {
                  setShowComposer(false);
                  setErrors({ title: "", content: "" });
                  setTitle("");
                  setContent("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="card bg-base-100 shadow-sm p-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="input input-bordered w-full pl-10 pr-10"
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="text-gray-500">
              {threads.length} result{threads.length === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>

      {/* Thread list */}
      {loading && (
        <div className="flex justify-center p-8">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}
      {!loading && threads.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          {searchQuery ? `No threads found for "${searchQuery}"` : "No threads yet."}
        </div>
      )}

      <div className="space-y-3">
        {threads.map((t) => {
          const reactions = (t.reactions || {}) as ReactionMap;
          const loveCount = reactions.love?.length || 0;
          const commentsCount = t.comments?.length || 0;

          return (
            <div key={t._id} className="card bg-base-100 shadow p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">
                    {highlightText(t.title, searchQuery)}
                  </h2>
                  <div className="text-sm text-gray-500">
                    by {t.authorName} • {new Date(t.createdAt).toLocaleString()}
                  </div>
                  <p className="mt-2 line-clamp-2">
                    {highlightText(t.content, searchQuery)}
                  </p>
                </div>
                <div className="text-sm text-gray-500 min-w-[140px] text-right space-y-1">
                  <div>{commentsCount} comment{commentsCount===1?"":"s"}</div>
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-base">❤️</span>
                    <span>{loveCount}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href={`/student/courses/${courseId}/forum/${t._id}`}
                  className="btn btn-outline"
                >
                  View thread
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}