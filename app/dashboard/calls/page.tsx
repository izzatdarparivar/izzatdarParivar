"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video as VideoIcon, Clock, PhoneOff, PhoneMissed, PhoneIncoming, PhoneOutgoing, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import VideoCall from "@/components/VideoCall";

interface CallLog {
  id: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  type: "video" | "voice";
  status: "ringing" | "active" | "ended" | "missed" | "declined";
  startedAt?: any;
  endedAt?: any;
  duration?: number;
  createdAt: any;
}

export default function CallsHistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "missed" | "video" | "voice">("all");
  const [activeCall, setActiveCall] = useState<{ receiverId: string; receiverName: string; type: "video" | "voice" } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const fetchCalls = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/calls/history?limit=30", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls || []);
      }
    } catch (err) {
      console.error("Failed to fetch call history:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCalls();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredCalls = calls.filter(c => {
    if (filter === "missed") return c.status === "missed" || c.status === "declined";
    if (filter === "video") return c.type === "video";
    if (filter === "voice") return c.type === "voice";
    return true;
  });

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(date);
  };

  const formatDuration = (sec?: number) => {
    if (!sec) return "0s";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-[var(--surface-container)]">
              <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)]">Call History 📞</h1>
              <p className="text-sm text-[var(--on-surface-variant)]">Review your past video and voice interactions</p>
            </div>
          </div>

          <Button onClick={fetchCalls} variant="outline" size="sm" className="rounded-full flex items-center gap-2 border-[var(--outline-variant)]">
            <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "all", label: "All Calls" },
            { id: "missed", label: "Missed" },
            { id: "video", label: "Video Calls" },
            { id: "voice", label: "Voice Calls" }
          ].map(f => (
            <Button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              variant={filter === f.id ? "default" : "outline"}
              className={`rounded-full text-xs font-semibold px-5 py-2 ${filter === f.id ? "gold-gradient text-white border-0 shadow-md" : "border-[var(--outline-variant)] text-[var(--on-surface)] hover:bg-[var(--surface-container)]"}`}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Call Logs */}
        <div className="bg-[var(--surface-container-lowest)] rounded-3xl p-6 shadow-ambient border border-[var(--outline-variant)]/10 space-y-4">
          {fetching ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-[var(--on-surface-variant)]">Loading call history...</p>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 bg-[var(--surface-container)] rounded-full flex items-center justify-center mx-auto text-[var(--on-surface-variant)]">
                <PhoneMissed className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[var(--on-surface)]">No calls found</h3>
              <p className="text-sm text-[var(--on-surface-variant)] max-w-sm mx-auto">
                {filter === "all" ? "You haven't made or received any calls yet. Start a video or voice call from a match's profile!" : `No ${filter} calls found in your history.`}
              </p>
            </div>
          ) : (
            filteredCalls.map(call => {
              const isOutgoing = call.callerId === user.uid;
              const otherName = isOutgoing ? call.receiverName : call.callerName;
              const otherId = isOutgoing ? call.receiverId : call.callerId;
              const isMissed = call.status === "missed" || call.status === "declined";

              return (
                <div key={call.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-container-low)] hover:bg-[var(--surface-container)] transition-all border border-[var(--outline-variant)]/5 group">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 ring-2 ring-[var(--primary-container)]">
                      <AvatarFallback className="bg-[var(--primary-container)] text-[var(--on-primary-container)] font-serif font-bold text-lg">
                        {otherName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className="font-serif font-semibold text-[var(--on-surface)] text-base group-hover:text-[var(--primary)] transition-colors">
                        {otherName}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--on-surface-variant)]">
                        <span className={`flex items-center gap-1 font-medium ${isMissed ? "text-red-500" : isOutgoing ? "text-blue-500" : "text-green-500"}`}>
                          {isMissed ? <PhoneMissed className="w-3.5 h-3.5" /> : isOutgoing ? <PhoneOutgoing className="w-3.5 h-3.5" /> : <PhoneIncoming className="w-3.5 h-3.5" />}
                          {isMissed ? "Missed" : isOutgoing ? "Outgoing" : "Incoming"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {call.type === "video" ? <VideoIcon className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                          {call.type === "video" ? "Video" : "Voice"}
                        </span>
                        <span>•</span>
                        <span>{formatTime(call.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {call.status === "ended" && (
                      <span className="text-xs font-mono font-semibold bg-[var(--surface-container-high)] px-2.5 py-1 rounded-lg text-[var(--on-surface-variant)] hidden sm:block">
                        {formatDuration(call.duration)}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setActiveCall({ receiverId: otherId, receiverName: otherName, type: call.type })}
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-colors"
                        title={`Call ${otherName} back`}
                      >
                        {call.type === "video" ? <VideoIcon className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Active Call Overlay */}
      {activeCall && (
        <VideoCall
          receiverId={activeCall.receiverId}
          receiverName={activeCall.receiverName}
          type={activeCall.type}
          onEnd={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
