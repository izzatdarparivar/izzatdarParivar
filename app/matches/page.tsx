"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getApprovedProfiles, UserProfile } from "@/lib/firestore";
import { logInteraction } from "@/lib/analytics";
import { getOrCreateChatSession, ChatMessage, ChatSession, subscribeToMessages, sendMessage, updateChatConsent } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Crown, Heart, X, MapPin, Briefcase, GraduationCap,
  MessageCircle, Send, ArrowLeft, ChevronLeft, ChevronRight,
  Info
} from "lucide-react";
import PremiumModal from "@/components/PremiumModal";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";
import { toast } from "sonner";

export default function MatchesPage() {
  const { user, userProfile } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProfile, setChatProfile] = useState<UserProfile | null>(null);

  const viewStartTime = useRef<number>(Date.now());

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const data = await getApprovedProfiles();
        let candidates = data;
        if (user) {
          candidates = candidates.filter((p) => p.uid !== user.uid);
          if (userProfile?.gender) {
            candidates = candidates.filter((p) => p.gender !== userProfile.gender);
          }
        }
        setProfiles(candidates);
        viewStartTime.current = Date.now();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (userProfile !== undefined) {
      fetchProfiles();
    }
  }, [user, userProfile]);

  const handleSwipe = useCallback(async (direction: "left" | "right", profile: UserProfile) => {
    if (!user) {
      toast.error("Please sign in to interact with profiles");
      return;
    }

    const timeSpent = Date.now() - viewStartTime.current;
    
    // Log interaction
    logInteraction(
      user.uid, 
      profile.uid, 
      direction === "right" ? "swipe_right" : "swipe_left", 
      timeSpent
    );

    if (direction === "right") {
      toast.success(`Interest sent to ${profile.name}!`);
    }

    // Move to next
    setCurrentIndex((prev) => prev + 1);
    viewStartTime.current = Date.now();
  }, [user]);

  // Keyboard support for swipe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chatOpen || loading || currentIndex >= profiles.length) return;
      
      const current = profiles[currentIndex];
      if (e.key === "ArrowLeft") {
        handleSwipe("left", current);
      } else if (e.key === "ArrowRight") {
        handleSwipe("right", current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, profiles, loading, chatOpen, handleSwipe]);

  const handleOpenChat = async (profile: UserProfile) => {
    if (!user) {
      toast.error("Please sign in to chat");
      return;
    }
    
    const timeSpent = Date.now() - viewStartTime.current;
    logInteraction(user.uid, profile.uid, "chat_opened", timeSpent);

    setChatProfile(profile);
    setChatOpen(true);
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      <Navbar />

      {!user && (
        <div className="bg-[var(--surface-container)] border-b border-[#e8e0d6] shrink-0">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-[var(--on-surface-variant)]">
              Sign in to send interest and start chatting.
            </p>
            <Button asChild size="sm" className="gold-gradient text-white rounded-full text-xs">
              <Link href="/auth/signup">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative">
        {loading ? (
          <div className="w-full max-w-sm aspect-[3/4] bg-white rounded-3xl animate-pulse shadow-xl border border-[#ede6dc]" />
        ) : profiles.length === 0 || currentIndex >= profiles.length ? (
          <div className="text-center py-16 max-w-sm mx-auto">
            <div className="w-20 h-20 bg-[var(--primary-container)]/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-[var(--primary)]" />
            </div>
            <p className="font-serif text-2xl text-[var(--on-surface)] mb-2">You&apos;ve seen all profiles!</p>
            <p className="text-[var(--on-surface-variant)]">
              Check back later for new verified profiles matching your preferences.
            </p>
            <Button
              className="mt-6 gold-gradient text-white rounded-full px-8 shadow-ambient"
              onClick={() => { 
                setCurrentIndex(0); 
                viewStartTime.current = Date.now();
              }}
            >
              Start Over
            </Button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm md:max-w-md h-[70vh] min-h-[500px] flex items-center justify-center">
            <AnimatePresence>
              {profiles.map((p, i) => {
                if (i < currentIndex) return null;
                if (i > currentIndex + 1) return null; // Render current and next for performance
                
                const isCurrent = i === currentIndex;
                return (
                  <MatchCard
                    key={p.uid}
                    profile={p}
                    isCurrent={isCurrent}
                    onSwipe={(dir) => handleSwipe(dir, p)}
                    onChat={() => handleOpenChat(p)}
                    userId={user?.uid}
                  />
                );
              }).reverse()}
            </AnimatePresence>

            {/* Action Buttons (Trackpad / Click friendly) */}
            <div className="absolute -bottom-20 left-0 right-0 flex justify-center items-center gap-6 z-10">
              <button
                title="Pass"
                onClick={() => handleSwipe("left", currentProfile)}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#ede6dc] text-red-500 hover:scale-110 transition-transform active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                title="Chat"
                onClick={() => handleOpenChat(currentProfile)}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#ede6dc] text-blue-500 hover:scale-110 transition-transform active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button
                title="Like"
                onClick={() => handleSwipe("right", currentProfile)}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#ede6dc] text-green-500 hover:scale-110 transition-transform active:scale-95"
              >
                <Heart className="w-6 h-6 fill-current" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && chatProfile && user && (
          <ChatPanel
            profile={chatProfile}
            currentUser={user}
            isPremium={isPremium(userProfile)}
            onClose={() => { setChatOpen(false); setChatProfile(null); }}
            onRequirePremium={() => setShowPremiumModal(true)}
          />
        )}
      </AnimatePresence>

      <PremiumModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}

function isPremium(profile: UserProfile | null | undefined): boolean {
  return profile?.is_premium === true;
}

/* ─── Match Card (Draggable) ─── */
function MatchCard({ 
  profile, 
  isCurrent, 
  onSwipe, 
  onChat,
  userId
}: { 
  profile: UserProfile; 
  isCurrent: boolean; 
  onSwipe: (dir: "left" | "right") => void;
  onChat: () => void;
  userId?: string;
}) {
  const controls = useAnimation();
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = profile.photos?.length ? profile.photos : [profile.photoURL || `https://ui-avatars.com/api/?name=${profile.name}&size=500&background=fed7aa&color=7c2d12`];

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      await controls.start({ x: 500, opacity: 0, rotate: 20 });
      onSwipe("right");
    } else if (info.offset.x < -swipeThreshold) {
      await controls.start({ x: -500, opacity: 0, rotate: -20 });
      onSwipe("left");
    } else {
      controls.start({ x: 0, opacity: 1, rotate: 0 });
    }
  };

  const handlePhotoTap = (e: React.MouseEvent, dir: "prev" | "next") => {
    e.stopPropagation(); // prevent drag trigger
    if (dir === "prev") {
      setPhotoIndex(p => Math.max(0, p - 1));
    } else {
      setPhotoIndex(p => Math.min(photos.length - 1, p + 1));
    }
    
    if (userId) {
      logInteraction(userId, profile.uid, "photo_change");
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 bg-white rounded-3xl shadow-[0_8px_40px_rgba(58,45,39,0.15)] border border-[#ede6dc] overflow-hidden flex flex-col ${!isCurrent && 'pointer-events-none'}`}
      style={{ originX: 0.5, originY: 1 }}
      initial={!isCurrent ? { scale: 0.95, y: 20 } : { scale: 1, y: 0 }}
      animate={controls}
      drag={isCurrent ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={isCurrent ? { cursor: "grabbing" } : {}}
    >
      {/* Photo Area */}
      <div className="relative flex-1 bg-[var(--surface-container)] w-full cursor-grab active:cursor-grabbing">
        <Image
          src={photos[photoIndex]}
          alt={profile.name}
          fill
          className="object-cover"
          priority
          draggable={false}
        />
        
        {/* Carousel Indicators */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-4 z-20">
            {photos.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full bg-white/50 backdrop-blur-sm transition-all ${i === photoIndex ? 'bg-white shadow-sm' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Tap areas for photo cycle */}
        {photos.length > 1 && (
          <>
            <div 
              className="absolute top-0 bottom-0 left-0 w-1/2 z-10" 
              onClick={(e) => handlePhotoTap(e, "prev")}
            />
            <div 
              className="absolute top-0 bottom-0 right-0 w-1/2 z-10" 
              onClick={(e) => handlePhotoTap(e, "next")}
            />
          </>
        )}

        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20 text-white z-20 pointer-events-none">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-1 flex items-center gap-2">
                {profile.name}, {profile.age}
                {profile.is_premium && <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />}
              </h2>
              {profile.tagline && (
                <p className="text-white/90 italic font-medium mb-2">&ldquo;{profile.tagline}&rdquo;</p>
              )}
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Details Section */}
      <div className="shrink-0 p-5 bg-white space-y-3 pointer-events-auto cursor-default">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
            <Briefcase className="w-4 h-4 text-[var(--primary)]" />
            <span>{profile.occupation || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
            <GraduationCap className="w-4 h-4 text-[var(--primary)]" />
            <span>{profile.education || "Not specified"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.religion && (
             <span className="px-2.5 py-1 bg-[var(--primary-container)]/40 text-[var(--on-primary-container)] rounded-md text-xs font-medium">
               {profile.religion}
             </span>
          )}
          {profile.motherTongue && (
             <span className="px-2.5 py-1 bg-[var(--secondary-container)]/40 text-[var(--secondary)] rounded-md text-xs font-medium">
               {profile.motherTongue}
             </span>
          )}
          {profile.caste && (
             <span className="px-2.5 py-1 bg-[var(--surface-container)] text-[var(--on-surface-variant)] rounded-md text-xs font-medium">
               {profile.caste}
             </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Chat Panel (Slide-in from right) ─── */
function ChatPanel({ 
  profile, 
  currentUser, 
  isPremium,
  onClose,
  onRequirePremium
}: { 
  profile: UserProfile; 
  currentUser: any; 
  isPremium: boolean;
  onClose: () => void;
  onRequirePremium: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initChat() {
      try {
        const sid = await getOrCreateChatSession(currentUser.uid, profile.uid);
        setSessionId(sid);
        
        // Listen to messages
        const unsub = subscribeToMessages(sid, (msgs) => {
          setMessages(msgs);
        });

        // We also need to poll or listen to session updates, but for simplicity
        // we'll fetch once, and update local state upon sending.
        // A robust app would listen to the session doc too.
        return () => {
          unsub();
        };
      } catch(e) {
        console.error("Chat init error", e);
      }
    }
    initChat();
  }, [currentUser.uid, profile.uid]);

  // For this demo, let's derive session data locally based on messages 
  // or fetch it when needed. To enforce rules cleanly on client:
  const isInitiator = true; // Ideally derived from sessionData.initiatorId === currentUser.uid
  const myMessageCount = messages.filter(m => m.senderId === currentUser.uid).length;
  const theirMessageCount = messages.filter(m => m.senderId !== currentUser.uid).length;
  
  // Dummy status for now. If there's an actual session, we check it.
  const status = "pending"; // In a real app, subscribe to session doc to get true status.
  const canSend = status === "pending" ? myMessageCount < 3 : isPremium;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;
    
    if (!canSend) {
      if (status === "pending") {
        toast.error("Message limit reached. Wait for them to accept.");
      } else if (!isPremium) {
        onRequirePremium();
      }
      return;
    }

    const text = input.trim();
    setInput("");
    
    const success = await sendMessage(sessionId, currentUser.uid, text);
    if (!success) {
      toast.error("Could not send message. Limit reached or error.");
      setInput(text); // restore
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#fefcf8] shadow-2xl z-50 flex flex-col border-l border-[#ede6dc]"
    >
      {/* Chat Header */}
      <div className="shrink-0 px-5 py-4 bg-white border-b border-[#ede6dc] flex items-center gap-3 shadow-sm z-10">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white hover:bg-[var(--surface-container)] flex items-center justify-center transition-colors border border-[#ede6dc]"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--on-surface-variant)]" />
        </button>
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--primary-container)] shrink-0">
          <Image
            src={profile.photos?.[0] || profile.photoURL || `https://ui-avatars.com/api/?name=${profile.name}&size=80`}
            alt={profile.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[var(--on-surface)] text-sm truncate">{profile.name}</p>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
            Online
          </p>
        </div>
      </div>

      {/* Banner limits */}
      <div className="shrink-0 bg-[var(--primary-container)]/30 px-4 py-2 flex items-center gap-2 border-b border-[#ede6dc]">
         <Info className="w-4 h-4 text-[var(--primary)]" />
         <p className="text-xs text-[var(--on-surface-variant)]">
           {status === "pending" 
             ? `Pending connection. You can send ${3 - myMessageCount} more messages.` 
             : `Connection accepted. ${!isPremium ? "Upgrade to premium for unlimited messages." : ""}`}
         </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10 text-[var(--on-surface-variant)] text-sm">
            Say hi to {profile.name}!
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUser.uid;
          const time = msg.timestamp ? msg.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now";
          return (
            <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMe
                    ? "bg-[var(--primary)] text-white rounded-br-sm"
                    : "bg-white text-[var(--on-surface)] border border-[#ede6dc] shadow-sm rounded-bl-sm"
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? "text-white/60" : "text-[var(--on-surface-variant)]/60"}`}>
                  {time}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-4 bg-white border-t border-[#ede6dc]">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={canSend ? "Type a message..." : "Limit reached or upgrade required"}
            disabled={!canSend}
            className="flex-1 rounded-full bg-[var(--surface-container-low)] border-[#ede6dc] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || !canSend}
            className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
