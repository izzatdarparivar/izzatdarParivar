"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Users,
  Heart,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  User,
} from "lucide-react";
import Link from "next/link";
import PremiumModal from "@/components/PremiumModal";
import { getProfileSuggestions, Suggestion } from "@/lib/suggestions";
import SuggestionCard from "@/components/SuggestionCard";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";


export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [showPremiumModal, setShowPremiumModal] = useState(false);


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


  const profileCompletion = () => {
    if (!userProfile) return 10;
    const fields = ["name", "gender", "dob", "location", "religion", "caste", "bio", "occupation", "education"];
    const filled = fields.filter((f) => !!(userProfile as any)[f]).length;
    return Math.round((filled / fields.length) * 100);
  };


  const completion = profileCompletion();


  const statusConfig = {
    pending: { label: "Under Review", icon: Clock, color: "text-amber-600 bg-amber-50" },
    approved: { label: "Approved", icon: CheckCircle, color: "text-green-700 bg-green-50" },
    rejected: { label: "Rejected", icon: AlertCircle, color: "text-red-600 bg-red-50" },
  };


  const status = userProfile?.status || "pending";
  const statusInfo = statusConfig[status];

  const suggestions = userProfile ? getProfileSuggestions(userProfile as any) : [];


  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <EmailVerificationBanner />


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[var(--primary-container)]/40 to-[var(--secondary-container)]/20 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-fixed)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)] relative">
            Welcome back, {user.displayName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-[var(--on-surface-variant)] mt-1 relative">
            Manage your profile and discover matches
          </p>
        </div>


        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[var(--surface-container-lowest)] rounded-2xl p-6 shadow-ambient">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 ring-4 ring-[var(--primary-container)]">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback className="bg-[var(--primary-container)] text-[var(--on-primary-container)] text-3xl font-serif">
                      {user.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {userProfile?.is_premium && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 gold-gradient rounded-full flex items-center justify-center">
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>


                <h2 className="font-serif text-xl font-semibold text-[var(--on-surface)]">
                  {userProfile?.name || user.displayName || "Your Name"}
                </h2>
                <p className="text-sm text-[var(--on-surface-variant)] mt-0.5">
                  {userProfile?.location || "Location not set"}
                </p>


                <div className={`flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                  <statusInfo.icon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </div>


                {userProfile?.is_premium && (
                  <Badge className="mt-2 bg-[var(--primary-fixed)] text-[var(--on-primary-fixed)] border-0">
                    <Crown className="w-3 h-3 mr-1" /> Premium Member
                  </Badge>
                )}
              </div>


              {/* Profile completion */}
              <div className="mt-6 pt-5 border-t border-[rgba(208,197,175,0.2)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[var(--on-surface-variant)]">Profile Completion</span>
                  <span className="text-xs font-bold text-[var(--primary)]">{completion}%</span>
                </div>
                <Progress value={completion} className="h-2 bg-[var(--surface-container)]" />
                {completion < 100 && (
                  <p className="text-xs text-[var(--on-surface-variant)] mt-2">
                    Complete your profile to get better matches
                  </p>
                )}
              </div>


              <Button
                asChild
                className="mt-4 w-full gold-gradient text-white rounded-full"
                id="dashboard-edit-profile-btn"
              >
                <Link href="/profile/create">
                  <User className="w-4 h-4 mr-2" />
                  {completion < 50 ? "Complete Profile" : "Edit Profile"}
                </Link>
              </Button>
            </div>


            {/* Premium upgrade */}
            {!userProfile?.is_premium && (
              <div className="bg-[var(--surface-container-lowest)] rounded-2xl p-6 shadow-ambient relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-fixed)]/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <Crown className="w-8 h-8 text-[var(--primary)] mb-3" />
                <h3 className="font-serif text-base font-semibold text-[var(--on-surface)] mb-1">
                  Unlock Premium
                </h3>
                <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                  View contact details, send unlimited interest, get priority listing.
                </p>
                <p className="font-serif text-2xl font-bold text-[var(--primary)] mb-4">
                  ₹999 <span className="text-sm font-normal text-[var(--on-surface-variant)]">/year</span>
                </p>
                <Button
                  className="w-full gold-gradient text-white rounded-full text-sm font-semibold"
                  id="dashboard-premium-btn"
                  onClick={() => setShowPremiumModal(true)}
                >
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>


          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Eye, label: "Profile Views", value: "—" },
                { icon: Heart, label: "Interests Received", value: "—" },
                { icon: Users, label: "Matches", value: "—" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[var(--surface-container-lowest)] rounded-2xl p-5 shadow-[0_8px_30px_rgba(58,45,39,0.08)] text-center hover:shadow-[0_12px_40px_rgba(58,45,39,0.12)] transition-shadow duration-300 border border-[var(--outline-variant)]/10">
                  <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-[var(--on-surface)]">{stat.value}</p>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>


            {/* Status info */}
            {status === "pending" && (
              <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-5 flex gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-amber-800">Profile Under Review</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Our team is reviewing your profile. This usually takes 24–48 hours. You&apos;ll be notified once approved.
                  </p>
                </div>
              </div>
            )}


            {status === "approved" && (
              <div className="bg-green-50 border border-green-200/50 rounded-2xl p-5 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-green-800">Profile Approved!</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Your profile is live and visible to other members. Start browsing matches!
                  </p>
                </div>
              </div>
            )}


            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-semibold text-[var(--on-surface)]">
                  Suggestions to Improve Your Profile
                </h3>
                {suggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="bg-[var(--surface-container-lowest)] rounded-2xl p-6 shadow-ambient">
              <h3 className="font-serif text-lg font-semibold text-[var(--on-surface)] mb-4">
                Quick Actions
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { href: "/matches", label: "Browse All Matches", desc: "Explore approved profiles", icon: Users },
                  { href: "/profile/create", label: "Update Profile", desc: "Keep your info fresh", icon: User },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-container-low)] hover:bg-[var(--surface-container)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--on-surface)]">{action.label}</p>
                      <p className="text-xs text-[var(--on-surface-variant)]">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--outline)] group-hover:text-[var(--primary)] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>


      <PremiumModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </div>
  );
}



