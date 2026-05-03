"use client";

import { useEffect, useState } from "react";
import { subscribeToChatSessions, getOtherParticipantId, ChatSession } from "@/lib/chat";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import { MessageCircle, Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";

type SessionWithId = ChatSession & { id: string };

interface ChatSidebarProps {
  userId: string;
}

export default function ChatSidebar({ userId }: ChatSidebarProps) {
  const params = useParams();
  const currentSessionId = params.sessionId as string;
  const [sessions, setSessions] = useState<SessionWithId[]>([]);
  const [profileCache, setProfileCache] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!userId) return;

    const unsub = subscribeToChatSessions(userId, async (newSessions) => {
      setSessions(newSessions);
      setLoading(false);

      const uidsToFetch = newSessions
        .map((s) => getOtherParticipantId(s, userId))
        .filter((uid) => uid && !profileCache[uid]);

      const uniqueUids = [...new Set(uidsToFetch)];
      if (uniqueUids.length > 0) {
        const profiles: Record<string, UserProfile> = {};
        await Promise.all(
          uniqueUids.map(async (uid) => {
            const p = await getUserProfile(uid);
            if (p) profiles[uid] = p;
          })
        );
        setProfileCache((prev) => ({ ...prev, ...profiles }));
      }
    });

    return () => unsub();
  }, [userId]);

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery) return true;
    const otherUid = getOtherParticipantId(s, userId);
    const otherProfile = profileCache[otherUid];
    return otherProfile?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <aside className="w-full md:w-[320px] lg:w-[380px] flex-shrink-0 border-r border-[var(--outline-variant)]/20 bg-white flex flex-col h-full overflow-hidden">
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-serif text-xl font-bold text-[var(--on-surface)]">Messages</h1>
          <div className="bg-[var(--primary-container)]/30 px-2 py-0.5 rounded-full">
            <span className="text-[10px] font-bold text-[var(--primary)]">{sessions.length}</span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--outline)]" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-[var(--surface-container-low)] border-none text-xs focus-visible:ring-1 focus-visible:ring-[var(--primary)]/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="space-y-1 px-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[var(--surface-container)]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-20 rounded bg-[var(--surface-container)]" />
                  <div className="h-2.5 w-32 rounded bg-[var(--surface-container)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <p className="text-xs text-[var(--on-surface-variant)]">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredSessions.map((session) => {
              const otherUid = getOtherParticipantId(session, userId);
              const otherProfile = profileCache[otherUid];
              const displayName = otherProfile?.name || "User";
              const initial = displayName[0]?.toUpperCase() || "?";
              const lastMsg = session.lastMessage || "No messages yet";
              const isActive = currentSessionId === session.id;

              return (
                <Link
                  key={session.id}
                  href={`/chat/${session.id}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group mx-1 ${
                    isActive 
                      ? "bg-[var(--primary-container)]/20 shadow-sm" 
                      : "hover:bg-[var(--surface-container-low)]"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-serif font-bold ${isActive ? "gold-gradient" : "bg-[var(--outline)]/30 text-[var(--on-surface-variant)]"}`}>
                      {initial}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`text-xs font-semibold truncate transition-colors ${isActive ? "text-[var(--primary)]" : "text-[var(--on-surface)]"}`}>
                        {displayName}
                      </h3>
                    </div>
                    <p className="text-[10px] text-[var(--on-surface-variant)] truncate leading-relaxed">
                      {lastMsg}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}
