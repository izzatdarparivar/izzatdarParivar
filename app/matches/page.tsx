"use client";


import React, { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Briefcase, GraduationCap, Sparkles, RefreshCw, ChevronDown, Loader2, AlertCircle, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CompatibilityBadge, { type ScoreBreakdown } from "@/components/CompatibilityBadge";
import ShortlistButton from "@/components/ShortlistButton";
import BlockReportMenu from "@/components/BlockReportMenu";
import ReportModal from "@/components/ReportModal";
import Navbar from "@/components/Navbar";


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------


interface ProfileLocation {
  city: string;
  state: string;
}


interface MatchProfileData {
  uid: string;
  displayName: string;
  age: number;
  location: ProfileLocation;
  photoURL: string;
  education: string;
  occupation: string;
}


interface MatchProfile {
  profile: MatchProfileData;
  score: number;
  breakdown: Record<string, number>;
}


interface MatchesResponse {
  matches: MatchProfile[];
  nextCursor: string | null;
  hasMore: boolean;
}


type Tab = "forYou" | "browse";


type FetchStatus = "idle" | "loading" | "loadingMore" | "error" | "done";


// ---------------------------------------------------------------------------
// Helper: avatar fallback
// ---------------------------------------------------------------------------


function avatarUrl(name: string, size = 400): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=f97316&color=fff`;
}


// ---------------------------------------------------------------------------
// ProfileCard
// ---------------------------------------------------------------------------


interface ProfileCardProps {
  item: MatchProfile;
}


function ProfileCard({ item }: ProfileCardProps) {
  const { profile, score, breakdown } = item;
  const [reportTarget, setReportTarget] = useState<{ uid: string; name: string } | null>(null);
  const locationLabel = [profile.location?.city, profile.location?.state].filter(Boolean).join(", ");


  return (
    <>
      <article className="glass rounded-2xl overflow-hidden shadow-ambient flex flex-col group transition-transform hover:-translate-y-1 duration-200">
        {/* Photo */}
        <div className="relative w-full aspect-[3/4] bg-[#f3e8d5]">
          <Image
            src={profile.photoURL || avatarUrl(profile.displayName)}
            alt={profile.displayName || "Profile photo"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = avatarUrl(profile.displayName);
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />


          {/* Top-right actions */}
          <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
            <ShortlistButton profileId={profile.uid} />
            <BlockReportMenu
              targetUserId={profile.uid}
              targetUserName={profile.displayName}
              onReportClick={() => setReportTarget({ uid: profile.uid, name: profile.displayName })}
            />
          </div>


          {/* Score badge */}
          {score > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <CompatibilityBadge score={score} breakdown={breakdown as unknown as ScoreBreakdown} size="sm" />
            </div>
          )}


          {/* Name + age pinned to bottom of photo */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10 pointer-events-none">
            <h3 className="font-serif text-white text-xl font-bold leading-tight drop-shadow-lg">
              {profile.displayName}, {profile.age}
            </h3>
          </div>
        </div>


        {/* Details */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {locationLabel && (
            <p className="flex items-center gap-1 text-sm text-[#3A2D27]/70">
              <MapPin className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </p>
          )}
          {profile.occupation && (
            <p className="flex items-center gap-1 text-sm text-[#3A2D27]/70">
              <Briefcase className="w-3.5 h-3.5 text-[#800000] shrink-0" />
              <span className="truncate">{profile.occupation}</span>
            </p>
          )}
          {profile.education && (
            <p className="flex items-center gap-1 text-sm text-[#3A2D27]/70">
              <GraduationCap className="w-3.5 h-3.5 text-[#800000] shrink-0" />
              <span className="truncate">{profile.education}</span>
            </p>
          )}


          <div className="mt-auto pt-3 flex gap-2">
            <Link
              href={`/profile/${profile.uid}`}
              className="flex-1 text-center py-2 rounded-full text-sm font-bold gold-gradient text-white shadow hover:opacity-90 transition-opacity"
            >
              View Profile
            </Link>
            <Link
              href={`/chat?with=${profile.uid}`}
              className="w-12 flex items-center justify-center rounded-full border-2 border-[#800000] text-[#800000] hover:bg-red-50 transition-colors"
              title="Message"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </article>


      {/* Report modal */}
      {reportTarget && (
        <ReportModal
          open
          onClose={() => setReportTarget(null)}
          targetUserId={reportTarget.uid}
          targetUserName={reportTarget.name}
        />
      )}
    </>
  );
}


// ---------------------------------------------------------------------------
// Skeleton card for loading state
// ---------------------------------------------------------------------------


function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/60 animate-pulse">
      <div className="aspect-[3/4] bg-[#f3e8d5]" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-[#f3e8d5] rounded-full w-3/4" />
        <div className="h-3 bg-[#f3e8d5] rounded-full w-1/2" />
        <div className="h-3 bg-[#f3e8d5] rounded-full w-2/3" />
        <div className="h-8 bg-[#f3e8d5] rounded-full mt-3" />
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------


export default function MatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();


  const [activeTab, setActiveTab] = useState<Tab>("forYou");


  // Per-tab state
  const [forYouItems, setForYouItems] = useState<MatchProfile[]>([]);
  const [forYouCursor, setForYouCursor] = useState<string | null>(null);
  const [forYouHasMore, setForYouHasMore] = useState(false);
  const [forYouStatus, setForYouStatus] = useState<FetchStatus>("idle");
  const [forYouError, setForYouError] = useState<string | null>(null);


  const [browseItems, setBrowseItems] = useState<MatchProfile[]>([]);
  const [browseCursor, setBrowseCursor] = useState<string | null>(null);
  const [browseHasMore, setBrowseHasMore] = useState(false);
  const [browseStatus, setBrowseStatus] = useState<FetchStatus>("idle");
  const [browseError, setBrowseError] = useState<string | null>(null);


  // Prevent double-fetch on StrictMode
  const didFetch = useRef<{ forYou: boolean; browse: boolean }>({ forYou: false, browse: false });


  // ---------------------------------------------------------------------------
  // Redirect if unauthenticated
  // ---------------------------------------------------------------------------


  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [authLoading, user, router]);


  // ---------------------------------------------------------------------------
  // Fetch helpers
  // ---------------------------------------------------------------------------


  const fetchForYou = useCallback(
    async (cursor: string | null = null, append = false) => {
      if (!user) return;
      const isLoadMore = append && cursor !== null;
      setForYouStatus(isLoadMore ? "loadingMore" : "loading");
      setForYouError(null);
      try {
        const params = new URLSearchParams({ uid: user.uid, limit: "12" });
        if (cursor) params.set("cursor", cursor);
        const res = await fetch(`/api/recommendations?${params.toString()}`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data: MatchesResponse = await res.json();
        setForYouItems((prev) => (append ? [...prev, ...data.matches] : data.matches));
        setForYouCursor(data.nextCursor);
        setForYouHasMore(data.hasMore);
        setForYouStatus("done");
      } catch (err) {
        setForYouError(err instanceof Error ? err.message : "Failed to load recommendations");
        setForYouStatus("error");
      }
    },
    [user]
  );


  const fetchBrowse = useCallback(
    async (cursor: string | null = null, append = false) => {
      if (!user) return;
      const isLoadMore = append && cursor !== null;
      setBrowseStatus(isLoadMore ? "loadingMore" : "loading");
      setBrowseError(null);
      try {
        const params = new URLSearchParams({ uid: user.uid, limit: "12" });
        if (cursor) params.set("cursor", cursor);
        const res = await fetch(`/api/matches?${params.toString()}`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data: MatchesResponse = await res.json();
        setBrowseItems((prev) => (append ? [...prev, ...data.matches] : data.matches));
        setBrowseCursor(data.nextCursor);
        setBrowseHasMore(data.hasMore);
        setBrowseStatus("done");
      } catch (err) {
        setBrowseError(err instanceof Error ? err.message : "Failed to load profiles");
        setBrowseStatus("error");
      }
    },
    [user]
  );


  // ---------------------------------------------------------------------------
  // Initial fetch per tab (only once per tab per session)
  // ---------------------------------------------------------------------------


  useEffect(() => {
    if (!user) return;
    if (activeTab === "forYou" && !didFetch.current.forYou) {
      didFetch.current.forYou = true;
      fetchForYou(null, false);
    }
    if (activeTab === "browse" && !didFetch.current.browse) {
      didFetch.current.browse = true;
      fetchBrowse(null, false);
    }
  }, [activeTab, user, fetchForYou, fetchBrowse]);


  // ---------------------------------------------------------------------------
  // Derived values for active tab
  // ---------------------------------------------------------------------------


  const isForYou = activeTab === "forYou";
  const items = isForYou ? forYouItems : browseItems;
  const status = isForYou ? forYouStatus : browseStatus;
  const error = isForYou ? forYouError : browseError;
  const hasMore = isForYou ? forYouHasMore : browseHasMore;
  const cursor = isForYou ? forYouCursor : browseCursor;


  const handleLoadMore = () => {
    if (isForYou) {
      fetchForYou(cursor, true);
    } else {
      fetchBrowse(cursor, true);
    }
  };


  const handleRetry = () => {
    if (isForYou) {
      didFetch.current.forYou = false;
      setForYouItems([]);
      fetchForYou(null, false);
      didFetch.current.forYou = true;
    } else {
      didFetch.current.browse = false;
      setBrowseItems([]);
      fetchBrowse(null, false);
      didFetch.current.browse = true;
    }
  };


  // ---------------------------------------------------------------------------
  // Auth loading gate
  // ---------------------------------------------------------------------------


  if (authLoading || (!authLoading && !user)) {
    return (
      <div className="min-h-screen bg-[#fff9f0] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#f97316] animate-spin" />
        </div>
      </div>
    );
  }


  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------


  return (
    <div className="min-h-screen bg-[#fff9f0] flex flex-col">
      <Navbar />


      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A2D27] mb-1">Discover Matches</h1>
          <p className="text-[#3A2D27]/60 text-sm">Find your perfect life partner</p>
        </div>


        {/* Tab bar */}
        <div className="flex gap-1 mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 w-fit shadow-sm border border-[#f97316]/10">
          <TabButton
            label="For You"
            icon={<Sparkles className="w-4 h-4" />}
            active={activeTab === "forYou"}
            onClick={() => setActiveTab("forYou")}
            description="Scored recommendations"
          />
          <TabButton
            label="Browse"
            icon={<RefreshCw className="w-4 h-4" />}
            active={activeTab === "browse"}
            onClick={() => setActiveTab("browse")}
            description="All profiles"
          />
        </div>


        {/* Content area */}
        <TabContent
          status={status}
          error={error}
          items={items}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onRetry={handleRetry}
        />
      </main>
    </div>
  );
}


// ---------------------------------------------------------------------------
// TabButton
// ---------------------------------------------------------------------------


interface TabButtonProps {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  description: string;
}


function TabButton({ label, icon, active, onClick, description }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
        active
          ? "gold-gradient text-white shadow-md"
          : "text-[#3A2D27]/60 hover:text-[#3A2D27] hover:bg-white/60"
      }`}
      title={description}
    >
      {icon}
      {label}
    </button>
  );
}


// ---------------------------------------------------------------------------
// TabContent
// ---------------------------------------------------------------------------


interface TabContentProps {
  status: FetchStatus;
  error: string | null;
  items: MatchProfile[];
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}


function TabContent({ status, error, items, hasMore, onLoadMore, onRetry }: TabContentProps) {
  const isInitialLoading = status === "loading";
  const isLoadingMore = status === "loadingMore";
  const isError = status === "error";
  const isEmpty = (status === "done" || status === "error") && (!items || items.length === 0);


  // Initial skeleton grid
  if (isInitialLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }


  // Error with no items
  if (isError && isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-[#3A2D27] mb-1">Something went wrong</h2>
          <p className="text-sm text-[#3A2D27]/60 max-w-xs">{error}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="gold-gradient text-white rounded-full px-8 py-2.5 text-sm font-bold shadow hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }


  // Empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#f97316]/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-[#f97316]" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-[#3A2D27] mb-1">No profiles found</h2>
          <p className="text-sm text-[#3A2D27]/60 max-w-xs">
            Check back later — new profiles are added regularly.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-8">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item) => (
          <ProfileCard key={item.profile.uid} item={item} />
        ))}
        {/* Append skeletons at bottom while loading more */}
        {isLoadingMore &&
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>


      {/* Error after partial results */}
      {isError && items.length > 0 && (
        <div className="flex items-center justify-center gap-3 py-4 text-sm text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="underline font-semibold hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}


      {/* Load More */}
      {hasMore && !isError && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-10 py-3 rounded-full text-sm font-bold border-2 border-[#f97316] text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Load More
              </>
            )}
          </button>
        </div>
      )}


      {/* End-of-results */}
      {!hasMore && items.length > 0 && status === "done" && (
        <p className="text-center text-xs text-[#3A2D27]/40 py-4">
          You&apos;ve seen all available profiles
        </p>
      )}
    </div>
  );
}

