"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/ChatSidebar";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full border-t border-[var(--outline-variant)]/10">
        <ChatSidebar userId={user.uid} />

        {/* Right side: Empty state placeholder */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-[var(--surface-container-lowest)]">
          <div className="text-center max-w-sm px-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary-container)]/40 to-[var(--secondary-container)]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-ambient">
              <MessageCircle className="w-10 h-10 text-[var(--primary)]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-3">Your Messages</h2>
            <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
              Select a conversation from the left to start chatting. Your privacy and safety are our top priorities.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
