"use client";
export const dynamic = "force-dynamic";

import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/ChatSidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrCreateChatSession } from "@/lib/chat";

export default function ChatListPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    const otherUid = searchParams.get("with");
    if (otherUid && user && !initializing) {
      setInitializing(true);
      getOrCreateChatSession(user.uid, otherUid).then((sessionId) => {
        router.replace(`/chat/${sessionId}`);
      });
    }
  }, [searchParams, user, router, initializing]);

  if (loading || !user || initializing) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
          <p className="text-sm font-medium text-[var(--on-surface-variant)]">
            {initializing ? "Opening conversation..." : "Loading messages..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full border-t border-[var(--outline-variant)]/10">
        <ChatSidebar userId={user.uid} />

        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[var(--surface-container-lowest)] h-full text-center p-8">
          <div className="w-20 h-20 bg-[var(--primary-container)]/20 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="w-10 h-10 text-[var(--primary)]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-2">
            Your Messages
          </h2>
          <p className="text-[var(--on-surface-variant)] max-w-sm">
            Select a conversation from the sidebar to start chatting with your matches.
          </p>
        </div>
      </main>
    </div>
  );
}
