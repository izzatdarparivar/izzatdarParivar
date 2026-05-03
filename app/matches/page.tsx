"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getApprovedProfiles, UserProfile, getUserProfile } from "@/lib/firestore";
import { logInteraction } from "@/lib/analytics";
import { getOrCreateChatSession, sendMessage, subscribeToMessages, ChatMessage, ChatSession } from "@/lib/chat";
import { createNotification } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Crown, Heart, X, MapPin, Briefcase, GraduationCap,
  MessageCircle, Send, Info, ChevronLeft, ChevronRight,
  Filter, Star, Sparkles, ArrowLeft
} from "lucide-react";
import PremiumModal from "@/components/PremiumModal";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FilterState {
  minAge: number;
  maxAge: number;
  religion: string;
  location: string;
}

export default function MatchesPage() {
  const { user, userProfile } = useAuth();
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProfile, setChatProfile] = useState<UserProfile | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    minAge: 18,
    maxAge: 50,
    religion: "Any",
    location: "Any",
  });

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
        setAllProfiles(candidates);
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

  const profiles = useMemo(() => {
    return allProfiles.filter((p) => {
      const age = p.age || 25;
      if (age < filters.minAge || age > filters.maxAge) return false;
      if (filters.religion !== "Any" && p.religion?.toLowerCase() !== filters.religion.toLowerCase()) return false;
      if (filters.location !== "Any" && !p.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      return true;
    });
  }, [allProfiles, filters]);

  useEffect(() => {
    setCurrentIndex(0);
    viewStartTime.current = Date.now();
  }, [filters]);

  const handleSwipe = useCallback(async (direction: "left" | "right", profile: UserProfile) => {
    if (!user) {
      toast.error("Please sign in to interact");
      return;
    }
    const timeSpent = Date.now() - viewStartTime.current;
    logInteraction(user.uid, profile.uid, direction === "right" ? "swipe_right" : "swipe_left", timeSpent);
    if (direction === "right") toast.success(`Interest sent to ${profile.name}!`);
    setCurrentIndex((prev) => prev + 1);
    viewStartTime.current = Date.now();
  }, [user]);

  const currentProfile = profiles[currentIndex];

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden w-full max-w-[1800px] mx-auto">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex w-[300px] flex-shrink-0 border-r border-[var(--outline-variant)]/20 bg-white/50 backdrop-blur-sm p-6 flex-col">
          <div className="mb-8">
            <h2 className="font-serif text-xl font-bold text-[var(--on-surface)] flex items-center gap-2 mb-1">
              <Filter className="w-4 h-4 text-[var(--primary)]" /> Filters
            </h2>
            <p className="text-xs text-[var(--on-surface-variant)]">Refine your discovery</p>
          </div>

          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--outline)]">Age Range</p>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={filters.minAge} 
                  onChange={(e) => setFilters(prev => ({...prev, minAge: parseInt(e.target.value) || 18}))}
                  className="w-full h-9 rounded-xl border border-[var(--outline-variant)]/20 bg-white px-3 text-xs font-bold"
                />
                <span className="text-[var(--outline)]">-</span>
                <input 
                  type="number" 
                  value={filters.maxAge} 
                  onChange={(e) => setFilters(prev => ({...prev, maxAge: parseInt(e.target.value) || 50}))}
                  className="w-full h-9 rounded-xl border border-[var(--outline-variant)]/20 bg-white px-3 text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--outline)]">Religion</p>
              <select 
                value={filters.religion}
                onChange={(e) => setFilters(prev => ({...prev, religion: e.target.value}))}
                className="w-full h-9 rounded-xl border border-[var(--outline-variant)]/20 bg-white px-3 text-xs font-bold appearance-none"
              >
                <option value="Any">Any Religion</option>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Sikh">Sikh</option>
                <option value="Christian">Christian</option>
                <option value="Jain">Jain</option>
                <option value="Buddhist">Buddhist</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--outline)]">Location</p>
              <input 
                type="text" 
                placeholder="City name..."
                value={filters.location === "Any" ? "" : filters.location}
                onChange={(e) => setFilters(prev => ({...prev, location: e.target.value || "Any"}))}
                className="w-full h-9 rounded-xl border border-[var(--outline-variant)]/20 bg-white px-3 text-xs font-bold"
              />
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-[10px] uppercase font-bold text-[var(--primary)] tracking-widest"
              onClick={() => setFilters({ minAge: 18, maxAge: 50, religion: "Any", location: "Any" })}
            >
              Reset Filters
            </Button>
          </div>

          <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/5 border border-[var(--primary)]/10">
            <p className="text-xs font-bold text-[var(--primary)] mb-1 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Matches Found
            </p>
            <p className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed">
              We found {profiles.length} profiles matching your criteria.
            </p>
          </div>
        </aside>

        {/* Center: Discovery Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--surface-container-lowest)]">
          {profiles.length === 0 || currentIndex >= profiles.length ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-[var(--primary-container)]/30 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-[var(--primary)]" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-2">No Matches Found</h2>
              <Button 
                onClick={() => setFilters({ minAge: 18, maxAge: 50, religion: "Any", location: "Any" })}
                className="gold-gradient text-white rounded-full px-8 shadow-lg mt-4"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 sm:p-6 lg:p-8 gap-8">
              {/* Massive Picture Area */}
              <div className="flex-1 relative rounded-[40px] overflow-hidden shadow-2xl group border border-white/20">
                <Image
                  src={currentProfile.photos?.[0] || currentProfile.photoURL || `https://ui-avatars.com/api/?name=${currentProfile.name}&size=800`}
                  alt={currentProfile.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 z-20 pointer-events-none">
                  <h2 className="font-serif text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <div className="flex items-center gap-3 text-white/90 text-sm">
                    <span><MapPin className="w-4 h-4 inline mr-1" /> {currentProfile.location}</span>
                    <span><Briefcase className="w-4 h-4 inline mr-1" /> {currentProfile.occupation || "Independent"}</span>
                  </div>
                </div>
              </div>

              {/* Details Area */}
              <div className="w-full lg:w-[450px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[var(--outline-variant)]/20 space-y-8">
                  {currentProfile.bio && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">About Me</h3>
                      <p className="text-base text-[var(--on-surface-variant)] italic font-medium italic">&ldquo;{currentProfile.bio}&rdquo;</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-4 border-t border-[var(--outline-variant)]/10">
                    <DetailedStat label="Marital Status" value={currentProfile.maritalStatus} />
                    <DetailedStat label="Religion" value={currentProfile.religion} />
                    <DetailedStat label="Caste" value={currentProfile.caste} />
                    <DetailedStat label="Gotra" value={currentProfile.gotra} />
                    <DetailedStat label="Diet" value={currentProfile.diet} />
                    <DetailedStat label="Family" value={currentProfile.familyType} />
                  </div>

                  {/* Action Bar */}
                  <div className="pt-8 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleSwipe("left", currentProfile)}
                      className="flex-1 h-14 rounded-2xl bg-white border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-sm"
                    >
                      <X className="w-6 h-6 mr-2" /> <span className="font-bold">Pass</span>
                    </button>
                    <button
                      onClick={() => handleSwipe("right", currentProfile)}
                      className="flex-1 h-14 rounded-2xl gold-gradient flex items-center justify-center text-white shadow-xl hover:opacity-90 transition-all"
                    >
                      <Heart className="w-6 h-6 mr-2 fill-current" /> <span className="font-bold">Interested</span>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => { setChatProfile(currentProfile); setChatOpen(true); }}
                  className="w-full bg-[var(--primary-container)]/30 hover:bg-[var(--primary-container)]/50 p-6 rounded-[32px] flex items-center justify-center gap-3 transition-all border border-[var(--primary)]/10"
                >
                  <MessageCircle className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-sm font-bold text-[var(--primary)]">Send Intro Message (3 left)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && chatProfile && user && (
          <ChatPanel
            profile={chatProfile}
            currentUser={user}
            currentUserProfile={userProfile}
            onClose={() => { setChatOpen(false); setChatProfile(null); }}
            onRequirePremium={() => setShowPremiumModal(true)}
          />
        )}
      </AnimatePresence>

      <PremiumModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </div>
  );
}

function ChatPanel({ 
  profile, 
  currentUser, 
  currentUserProfile,
  onClose,
  onRequirePremium
}: { 
  profile: UserProfile; 
  currentUser: any; 
  currentUserProfile: any;
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
      const sid = await getOrCreateChatSession(currentUser.uid, profile.uid);
      setSessionId(sid);
      return subscribeToMessages(sid, setMessages);
    }
    initChat();
  }, [currentUser.uid, profile.uid]);

  const myMessageCount = messages.filter(m => m.senderId === currentUser.uid).length;
  const status = sessionData?.status || "pending";
  const isPremium = currentUserProfile?.is_premium === true;
  const canSend = status === "pending" ? myMessageCount < 3 : isPremium;

  const handleSend = async () => {
    if (!input.trim() || !sessionId || !canSend) {
      if (!canSend) {
        if (status === "pending") toast.error("Intro limit reached. Wait for acceptance.");
        else onRequirePremium();
      }
      return;
    }

    const text = input.trim();
    setInput("");
    const success = await sendMessage(sessionId, currentUser.uid, text);
    if (success) {
      await createNotification({
        userId: profile.uid,
        type: "message",
        title: "New message",
        body: `${currentUserProfile?.name || "Someone"}: ${text.substring(0, 50)}...`,
        actionUrl: `/chat/${sessionId}`,
        fromUserId: currentUser.uid,
        fromUserName: currentUserProfile?.name || "",
      });
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-[var(--outline-variant)]/20"
    >
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
        <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white font-bold">{profile.name[0]}</div>
        <div className="flex-1">
          <p className="font-bold text-sm">{profile.name}</p>
          <p className="text-[10px] text-green-600">3 intro messages available</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.senderId === currentUser.uid ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === currentUser.uid ? "bg-[var(--primary)] text-white" : "bg-gray-100"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder={canSend ? "Type a message..." : "Limit reached"}
          className="flex-1 rounded-full"
          disabled={!canSend}
        />
        <Button onClick={handleSend} disabled={!canSend} className="gold-gradient rounded-full w-10 h-10 p-0"><Send className="w-4 h-4" /></Button>
      </div>
    </motion.div>
  );
}

function DetailedStat({ label, value }: { label: string; value?: string }) {
  if (!value || value === "undefined") return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-[var(--outline)] uppercase">{label}</p>
      <p className="text-sm font-bold text-[var(--on-surface)] capitalize">{value}</p>
    </div>
  );
}
