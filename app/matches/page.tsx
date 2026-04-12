"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import { getApprovedProfiles, UserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Crown } from "lucide-react";
import PremiumModal from "@/components/PremiumModal";
import Link from "next/link";

export default function MatchesPage() {
  const { user, userProfile } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filtered, setFiltered] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">("all");
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const isPremium = userProfile?.is_premium ?? false;

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const data = await getApprovedProfiles();
        // Filter out current user's own profile
        const others = user ? data.filter((p) => p.uid !== user.uid) : data;
        setProfiles(others);
        setFiltered(others);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, [user]);

  useEffect(() => {
    let result = profiles;
    if (filterGender !== "all") {
      result = result.filter((p) => p.gender === filterGender);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.religion?.toLowerCase().includes(q) ||
          p.occupation?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filterGender, profiles]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Header */}
      <section className="bg-[var(--surface-container-low)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-[var(--primary-fixed)] text-[var(--on-primary-fixed)] border-0">
              Verified Profiles
            </Badge>
            <h1 className="font-serif text-4xl font-bold text-[var(--on-surface)]">
              Find Your Match
            </h1>
            <p className="text-[var(--on-surface-variant)] mt-2">
              {filtered.length} approved profiles available
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--outline)]" />
              <Input
                id="matches-search-input"
                placeholder="Search by name, city, religion..."
                className="pl-11 rounded-full bg-[var(--surface-container-lowest)] border-[var(--outline-variant)]/30 h-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(["all", "female", "male"] as const).map((g) => (
                <Button
                  key={g}
                  id={`filter-${g}-btn`}
                  variant={filterGender === g ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full capitalize ${filterGender === g ? "gold-gradient text-white border-0" : "border-[var(--outline-variant)]/50 text-[var(--on-surface-variant)]"}`}
                  onClick={() => setFilterGender(g)}
                >
                  {g === "all" ? "All" : g === "female" ? "Brides" : "Grooms"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Banner for non-premium users */}
      {user && !isPremium && (
        <div className="bg-[var(--primary-fixed)]/40 border-b border-[var(--primary-fixed)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-[var(--on-primary-fixed)]">
              <Crown className="w-4 h-4 text-[var(--primary)]" />
              <span className="font-medium">Upgrade to Premium to view contact details of all matches.</span>
            </div>
            <Button
              size="sm"
              id="matches-premium-upgrade-btn"
              className="gold-gradient text-white rounded-full text-xs"
              onClick={() => setShowPremiumModal(true)}
            >
              Upgrade for ₹999
            </Button>
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-[var(--surface-container)] border-b border-[var(--outline-variant)]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-[var(--on-surface-variant)]">
              Sign in to save matches and unlock contact details.
            </p>
            <Button asChild size="sm" className="gold-gradient text-white rounded-full text-xs">
              <Link href="/auth/signup">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Profile Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[var(--surface-container-lowest)] rounded-2xl overflow-hidden shadow-ambient">
                <Skeleton className="h-56 w-full bg-[var(--surface-container)]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-2/3 bg-[var(--surface-container)]" />
                  <Skeleton className="h-4 w-1/2 bg-[var(--surface-container)]" />
                  <Skeleton className="h-4 w-3/4 bg-[var(--surface-container)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-[var(--on-surface-variant)]">No profiles found</p>
            <p className="text-sm text-[var(--outline)] mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((profile) => (
              <ProfileCard
                key={profile.uid}
                profile={profile}
                isPremiumViewer={isPremium}
                onUnlockClick={() => setShowPremiumModal(true)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Premium Modal */}
      <PremiumModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
