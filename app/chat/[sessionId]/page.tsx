"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getChatSession, subscribeToMessages, sendMessage, ChatMessage, ChatSession } from "@/lib/chat";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import { createNotification } from "@/lib/notifications";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Info, Crown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/ChatSidebar";

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<ChatSession | null>(null);
  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    async function init() {
      const s = await getChatSession(sessionId);
      if (!s) {
        toast.error("Chat session not found");
        router.push("/chat");
        return;
      }
      setSession(s);

      const otherUid = s.participants.find((p) => p !== user!.uid) || "";
      if (otherUid) {
        const p = await getUserProfile(otherUid);
        setOtherProfile(p);
      }
      setLoading(false);
    }

    init();

    const unsub = subscribeToMessages(sessionId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsub();
  }, [user, sessionId, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isPremium = userProfile?.is_premium === true;
  const myMessageCount = messages.filter((m) => m.senderId === user?.uid).length;
  const status = session?.status || "pending";
  const canSend = status === "pending" ? myMessageCount < 3 : isPremium;

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    if (!canSend) {
      if (status === "pending") {
        toast.error("Message limit reached. Wait for them to accept.");
      } else if (!isPremium) {
        toast.error("Upgrade to Premium for unlimited messages.");
      }
      return;
    }

    const text = input.trim();
    setInput("");

    const success = await sendMessage(sessionId, user.uid, text);
    if (success) {
      const otherUid = session?.participants.find((p) => p !== user.uid) || "";
      if (otherUid) {
        await createNotification({
          userId: otherUid,
          type: "message",
          title: "New message",
          body: `${userProfile?.name || "Someone"}: ${text.substring(0, 60)}${text.length > 60 ? "..." : ""}`,
          actionUrl: `/chat/${sessionId}`,
          fromUserId: user.uid,
          fromUserName: userProfile?.name || "",
          fromUserPhoto: userProfile?.photoURL || "",
        });
      }
    } else {
      toast.error("Could not send message.");
      setInput(text);
    }
  };

  const displayName = otherProfile?.name || "User";
  const initial = displayName[0]?.toUpperCase() || "?";

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
        <div className="hidden md:block">
          <ChatSidebar userId={user.uid} />
        </div>

        <div className="flex-1 flex flex-col bg-[var(--surface-container-lowest)] h-full">
          {/* Chat Header */}
          <header className="shrink-0 px-4 sm:px-6 py-3 bg-white border-b border-[var(--outline-variant)]/10 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <Link
                href="/chat"
                className="md:hidden w-9 h-9 rounded-full bg-[var(--surface-container-low)] flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[var(--on-surface-variant)]" />
              </Link>

              <div className="relative w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white font-serif font-bold flex-shrink-0 shadow-sm">
                {initial}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{displayName}</p>
                <p className="text-[10px] text-[var(--on-surface-variant)]">
                  {otherProfile?.location || ""}
                  {otherProfile?.occupation ? ` · ${otherProfile.occupation}` : ""}
                </p>
              </div>

              {otherProfile?.is_premium && (
                <div className="w-7 h-7 gold-gradient rounded-full flex items-center justify-center shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          </header>

          {/* Message limit banner */}
          <div className="shrink-0 bg-[var(--primary-container)]/10 px-4 py-1.5 border-b border-[var(--outline-variant)]/10">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
              <p className="text-[10px] text-[var(--on-surface-variant)]">
                {status === "pending"
                  ? `Pending connection. You can send ${Math.max(0, 3 - myMessageCount)} more message${3 - myMessageCount !== 1 ? "s" : ""}.`
                  : `Connection accepted. ${!isPremium ? "Upgrade for unlimited chat." : ""}`}
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-transparent">
            <div className="px-4 sm:px-6 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-16 text-[var(--on-surface-variant)] text-xs">
                  <div className="w-16 h-16 bg-[var(--primary-container)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👋</span>
                  </div>
                  <p className="font-medium">Say hi to {displayName}!</p>
                  <p className="mt-1">Start your journey with a respectful message.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user.uid;
                const time = msg.timestamp
                  ? msg.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "Now";
                return (
                  <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all ${
                        isMe
                          ? "bg-[var(--primary)] text-white rounded-br-sm"
                          : "bg-white text-[var(--on-surface)] border border-[var(--outline-variant)]/20 rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-[9px] mt-1 text-right opacity-60`}>
                        {time}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="shrink-0 p-4 bg-white border-t border-[var(--outline-variant)]/10">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={canSend ? "Type your message..." : "Limit reached"}
                disabled={!canSend}
                className="flex-1 h-11 rounded-xl bg-[var(--surface-container-low)] border-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]/30 text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || !canSend}
                className="w-11 h-11 gold-gradient rounded-xl flex items-center justify-center text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
