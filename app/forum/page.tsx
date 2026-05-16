"use client";


import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCategories, getThreads, createThread, ForumCategory, ForumThread } from "@/lib/forum";
import Link from "next/link";


export default function ForumPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "", tags: "" });
  const [creating, setCreating] = useState(false);


  useEffect(() => {
    loadCategories();
  }, []);


  useEffect(() => {
    if (selectedCategory) loadThreads();
  }, [selectedCategory]);


  async function loadCategories() {
    try {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0].id!);
    } catch {} finally { setLoading(false); }
  }


  async function loadThreads() {
    setLoading(true);
    try {
      const data = await getThreads(selectedCategory);
      setThreads(data);
    } catch {} finally { setLoading(false); }
  }


  async function handleCreateThread() {
    if (!user || !newThread.title.trim() || !newThread.content.trim()) return;
    setCreating(true);
    try {
      await createThread({
        categoryId: selectedCategory,
        title: newThread.title,
        content: newThread.content,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        tags: newThread.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setNewThread({ title: "", content: "", tags: "" });
      setShowNewThread(false);
      await loadThreads();
    } catch {} finally { setCreating(false); }
  }


  return (
    <div className="min-h-screen bg-[#fff9f0] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-[#800000]">Community Forum</h1>
          {user && (
            <button onClick={() => setShowNewThread(true)} className="gold-gradient text-white px-6 py-2 rounded-full">
              New Thread
            </button>
          )}
        </div>


        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id!)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id ? "bg-[#f97316] text-white" : "bg-white text-gray-600 border"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>


        {/* New Thread Form */}
        {showNewThread && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-serif text-[#800000] mb-4">Create New Thread</h2>
            <input
              type="text"
              placeholder="Thread title..."
              value={newThread.title}
              onChange={(e) => setNewThread((p) => ({ ...p, title: e.target.value }))}
              className="w-full p-3 border rounded-xl mb-3"
            />
            <textarea
              placeholder="Write your post..."
              value={newThread.content}
              onChange={(e) => setNewThread((p) => ({ ...p, content: e.target.value }))}
              className="w-full p-3 border rounded-xl h-32 resize-none mb-3"
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={newThread.tags}
              onChange={(e) => setNewThread((p) => ({ ...p, tags: e.target.value }))}
              className="w-full p-3 border rounded-xl mb-4"
            />
            <div className="flex gap-3">
              <button onClick={handleCreateThread} disabled={creating} className="gold-gradient text-white px-6 py-2 rounded-full disabled:opacity-50">
                {creating ? "Posting..." : "Post"}
              </button>
              <button onClick={() => setShowNewThread(false)} className="px-6 py-2 text-gray-600 border rounded-full">
                Cancel
              </button>
            </div>
          </div>
        )}


        {/* Threads */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl"><p className="text-gray-500">No threads yet. Be the first to post!</p></div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <div key={thread.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {thread.isPinned && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Pinned</span>}
                      {thread.isLocked && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Locked</span>}
                    </div>
                    <h3 className="font-semibold text-lg mt-1">{thread.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      by {thread.authorName} • {thread.replyCount} replies • {thread.viewCount} views
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {thread.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-orange-50 text-[#f97316] px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



