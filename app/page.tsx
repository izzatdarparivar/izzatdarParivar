"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ActivityTicker from "@/components/sections/ActivityTicker";
import EmotionalQuote from "@/components/sections/EmotionalQuote";
import TrustSection from "@/components/sections/TrustSection";
import VerificationProcessSection from "@/components/sections/VerificationProcessSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import CommunitySupportSection from "@/components/sections/CommunitySupportSection";
import ProfilePreviewSection from "@/components/sections/ProfilePreviewSection";
import TrustLogosBar from "@/components/sections/TrustLogosBar";
import StatsStrip from "@/components/sections/StatsStrip";
import PremiumCTA from "@/components/sections/PremiumCTA";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FAQAccordionSection from "@/components/sections/FAQAccordionSection";
import SiteFooter from "@/components/sections/SiteFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <HeroSection />
      <ActivityTicker />
      <EmotionalQuote />
      <TrustSection />
      <VerificationProcessSection />
      <HowItWorksSection />
      <CommunitySupportSection />
      <ProfilePreviewSection />
      <TrustLogosBar />
      <StatsStrip />
      <PremiumCTA />
      <TestimonialsSection />
      <FAQAccordionSection />
      <SiteFooter />
    </div>
  );
}
