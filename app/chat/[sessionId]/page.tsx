"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getChatSession, subscribeToMessages, sendMessage, ChatMessage, ChatSession } from "@/lib/chat";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { CallSession } from "@/lib/video-call";
import { createNotification } from "@/lib/notifications";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Info, Crown, ShieldCheck, Phone, Video } from "lucide-react";
import VideoCall from "@/components/VideoCall";
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
  const [activeCall, setActiveCall] = useState<{ type: "voice" | "video"; incoming?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }


    async function init() {
      let s = await getChatSession(sessionId);
      
      // If session not found, check for fallback
      if (!s) {
        const searchParams = new URLSearchParams(window.location.search);
        const otherUidFallback = searchParams.get("uid");
        
        if (otherUidFallback && user) {
          const { getOrCreateChatSession } = await import("@/lib/chat");
          const newId = await getOrCreateChatSession(user.uid, otherUidFallback);
          router.replace(`/chat/${newId}`);
          return;
        }

        toast.error("Conversation not found");
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


    // Listen for incoming calls
    const callsRef = collection(db, "calls");
    const q = query(
      callsRef,
      where("receiverId", "==", user.uid),
      where("status", "==", "ringing")
    );


    const unsubCalls = onSnapshot(q, {
      next: (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const callData = change.doc.data() as CallSession;
            setActiveCall({ type: callData.type, incoming: change.doc.id });
          }
        });
      },
      error: (err) => {
        console.warn("Incoming Call Listener (Permission Check):", err.message);
        // Only show toast if it's not a permission error (which we expect if rules aren't set yet)
        if (!err.message.includes("permissions")) {
          toast.error("Real-time call signaling is unavailable.");
        }
      }
    });


    return () => {
      unsub();
      unsubCalls();
    };
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
    <div className="h-[100dvh] bg-[var(--background)] flex flex-col overflow-hidden">
      <Navbar />


      <main className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full border-t border-[var(--outline-variant)]/10">
        <div className="hidden md:block">
          <ChatSidebar userId={user.uid} />
        </div>


        <div className="flex-1 flex flex-col bg-[var(--surface-container-lowest)] h-full relative">
          {/* Chat Header */}
          <header className="shrink-0 px-4 sm:px-6 py-2.5 bg-white border-b border-[var(--outline-variant)]/10 shadow-sm z-20">
            <div className="flex items-center gap-3">
              <Link
                href="/chat"
                className="md:hidden w-8 h-8 rounded-full bg-[var(--surface-container-low)] flex items-center justify-center transition-colors hover:bg-[var(--surface-container)]"
              >
                <ArrowLeft className="w-4 h-4 text-[var(--on-surface-variant)]" />
              </Link>


              <div className="relative w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white font-serif font-bold flex-shrink-0 shadow-ambient">
                {initial}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </div>


              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-[var(--on-surface)] truncate">{displayName}</p>
                  {otherProfile?.status === "approved" && (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </div>
                <p className="text-[10px] text-[var(--on-surface-variant)] font-medium">
                  {otherProfile?.location || "India"}
                  {otherProfile?.occupation ? ` · ${otherProfile.occupation}` : ""}
                </p>
              </div>


              <div className="flex items-center gap-2">
                {otherProfile?.is_premium && (
                  <div className="w-7 h-7 gold-gradient rounded-full flex items-center justify-center shadow-md">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setActiveCall({ type: "voice" })}
                    className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-blue-700" />
                  </button>
                  <button 
                    onClick={() => setActiveCall({ type: "video" })}
                    className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition-colors"
                  >
                    <Video className="w-4 h-4 text-purple-700" />
                  </button>
                  <Link href={`/profile/${otherProfile?.uid}`} className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center hover:bg-orange-100 transition-colors">
                    <Info className="w-4 h-4 text-orange-700" />
                  </Link>
                </div>
              </div>
            </div>
          </header>


          {/* Message limit banner */}
          <div className="shrink-0 bg-[var(--primary-container)]/5 px-4 py-1.5 border-b border-[var(--outline-variant)]/5 backdrop-blur-md">
            <div className="flex items-center justify-center gap-2">
              <Info className="w-3 h-3 text-[var(--primary)] flex-shrink-0" />
              <p className="text-[10px] text-[var(--on-surface-variant)] font-medium">
                {status === "pending"
                  ? `Message limit: ${Math.max(0, 3 - myMessageCount)} remaining. Connection is pending.`
                  : `Conversation active. ${!isPremium ? "Upgrade for unlimited chat." : ""}`}
              </p>
            </div>
          </div>


          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-[var(--surface-container-low)]/30 custom-scrollbar">
            <div className="px-4 sm:px-6 py-8 space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-20 text-[var(--on-surface-variant)]">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-ambient flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-2">New Connection</h3>
                  <p className="text-xs max-w-[200px] mx-auto leading-relaxed opacity-70">
                    Start a respectful conversation with {displayName}.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user.uid;
                const time = msg.timestamp
                  ? msg.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "Now";
                
                return (
                  <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                    {!isMe && (
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-700 mb-1 flex-shrink-0">
                        {initial}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-[13px] sm:text-sm leading-relaxed shadow-sm relative group transition-all duration-200 ${
                        isMe
                          ? "bg-[var(--primary)] text-white rounded-br-none shadow-orange-900/10"
                          : "bg-white text-[var(--on-surface)] border border-[var(--outline-variant)]/10 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1.5 opacity-50 text-[9px] ${isMe ? "text-white" : "text-gray-400"}`}>
                        {time}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>


          {/* Input Area */}
          <div className="shrink-0 p-4 sm:p-5 bg-white border-t border-[var(--outline-variant)]/10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-3 max-w-4xl mx-auto"
            >
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={canSend ? "Message..." : "Upgrade to continue..."}
                  disabled={!canSend}
                  className="w-full h-12 rounded-2xl bg-[var(--surface-container-low)] border-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20 text-sm pr-4 shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || !canSend}
                className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center text-white shadow-ambient hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            {!canSend && (
               <p className="text-center text-[10px] text-red-500 font-bold mt-2 animate-pulse">
                 {status === "pending" ? "Waiting for recipient to accept..." : "Upgrade to Premium for more messages"}
               </p>
            )}
          </div>
        </div>
      </main>
      {activeCall && otherProfile && (
        <VideoCall 
          receiverId={otherProfile.uid}
          receiverName={otherProfile.name}
          type={activeCall.type}
          callId={activeCall.incoming}
          onEnd={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}



