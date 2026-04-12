"use client";

import { UserProfile } from "@/lib/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, BookOpen, Briefcase, Crown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface ProfileCardProps {
  profile: UserProfile;
  isPremiumViewer: boolean;
  onUnlockClick?: () => void;
}

function calcAge(dob: any): number {
  if (!dob) return 0;
  const d = dob.toDate ? dob.toDate() : new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function ProfileCard({ profile, isPremiumViewer, onUnlockClick }: ProfileCardProps) {
  const age = profile.age || calcAge(profile.dob);

  return (
    <div className="bg-[var(--surface-container-lowest)] rounded-2xl overflow-hidden shadow-ambient hover:shadow-lg transition-all duration-300 group">
      {/* Image area */}
      <div className="relative h-56 bg-[var(--surface-container)] overflow-hidden">
        {profile.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoURL}
            alt={profile.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-[var(--primary-container)] text-[var(--on-primary-container)] text-3xl font-serif">
                {profile.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Premium trust badge */}
        {profile.is_premium && (
          <div className="absolute top-3 right-3 w-8 h-8 gold-gradient rounded-full flex items-center justify-center shadow-md">
            <Crown className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Status chip */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-[var(--surface-container-lowest)]/90 text-[var(--primary)] text-xs font-semibold border-0">
            {profile.religion || "—"} · {profile.caste || "—"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[var(--on-surface)] leading-tight">
            {profile.name}
          </h3>
          <p className="text-sm text-[var(--on-surface-variant)]">
            {age > 0 ? `${age} yrs` : "Age N/A"}
            {profile.motherTongue ? ` · ${profile.motherTongue}` : ""}
          </p>
        </div>

        <div className="space-y-1.5">
          {profile.location && (
            <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--primary)]" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
          {profile.education && (
            <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-[var(--primary)]" />
              <span className="truncate">{profile.education}</span>
            </div>
          )}
          {profile.occupation && (
            <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-[var(--primary)]" />
              <span className="truncate">{profile.occupation}</span>
            </div>
          )}
        </div>

        {/* Contact details — locked for non-premium */}
        <div className="pt-2 border-t border-[rgba(208,197,175,0.2)] space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">
            Contact Details
          </p>
          {isPremiumViewer ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span className="text-[var(--on-surface)]">{profile.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span className="text-[var(--on-surface)]">{profile.email || "Not provided"}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm select-none">
                <EyeOff className="w-3.5 h-3.5 text-[var(--outline)]" />
                <span className="blur-contact text-[var(--on-surface)]">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-sm select-none">
                <EyeOff className="w-3.5 h-3.5 text-[var(--outline)]" />
                <span className="blur-contact text-[var(--on-surface)]">example@email.com</span>
              </div>
              <Button
                onClick={onUnlockClick}
                size="sm"
                className="mt-2 w-full gold-gradient text-white rounded-full text-xs font-semibold"
              >
                <Crown className="w-3 h-3 mr-1" />
                Unlock with Premium
              </Button>
            </div>
          )}
        </div>

        <Link
          href={`/profile/${profile.uid}`}
          className="block mt-3 text-center text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-container)] transition-colors"
        >
          View Full Profile →
        </Link>
      </div>
    </div>
  );
}
