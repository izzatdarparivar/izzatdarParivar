"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Heart,
  Shield,
  Star,
  Users,
  CheckCircle,
  ArrowRight,
  Crown,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Verified Profiles",
    description:
      "Every profile is manually verified by our team. No fake accounts, no spam.",
  },
  {
    icon: Star,
    title: "Curated Matches",
    description:
      "AI-powered matching based on your preferences, values, and compatibility.",
  },
  {
    icon: Crown,
    title: "Premium Privacy",
    description:
      "Contact details are protected. Upgrade to Premium to connect directly.",
  },
  {
    icon: Users,
    title: "Family-Friendly",
    description:
      "Built for the entire family — parents and individuals can both browse profiles.",
  },
];

const stats = [
  { value: "50,000+", label: "Registered Members" },
  { value: "12,000+", label: "Successful Matches" },
  { value: "150+", label: "Cities Covered" },
  { value: "4.9★", label: "User Rating" },
];

const testimonials = [
  {
    name: "Priya & Arjun",
    location: "Mumbai, Maharashtra",
    text: "We found each other on Izzatdar Parivar. The verified profiles gave us confidence, and the process was so dignified.",
    initials: "PA",
  },
  {
    name: "Sunita & Rahul",
    location: "Jaipur, Rajasthan",
    text: "Our families are very traditional. This platform understood our values and helped us find the perfect match.",
    initials: "SR",
  },
  {
    name: "Meera & Kiran",
    location: "Bengaluru, Karnataka",
    text: "Premium membership was worth every rupee. Direct contact details made it so much easier to connect.",
    initials: "MK",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-fixed)]/30 via-[var(--background)] to-[var(--secondary-container)]/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--primary-container)]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--secondary-container)]/20 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-[var(--primary-fixed)] text-[var(--on-primary-fixed)] border-0 font-medium text-sm px-4 py-1.5 rounded-full">
              ✨ India&apos;s Most Trusted Matrimonial Platform
            </Badge>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--on-surface)] leading-[1.1] tracking-tight mb-6">
              Find Your{" "}
              <span className="text-[var(--primary)]">Life Partner</span>{" "}
              <br className="hidden sm:block" />
              With Dignity
            </h1>

            <p className="text-lg sm:text-xl text-[var(--on-surface-variant)] leading-relaxed max-w-xl mb-10">
              Izzatdar Parivar connects families and individuals seeking meaningful,
              lasting bonds — built on values, trust, and respect.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="gold-gradient text-white rounded-full px-8 py-6 text-base font-semibold shadow-ambient hover:opacity-90 transition-opacity"
              >
                <Link href="/auth/signup" id="hero-get-started-btn">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-base font-semibold border-[var(--outline-variant)] text-[var(--primary)] hover:bg-[var(--surface-container-low)]"
              >
                <Link href="/matches" id="hero-browse-btn">
                  Browse Profiles
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {["Free to Register", "Verified Profiles", "Secure & Private"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                  <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="bg-[var(--surface-container-low)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-3xl font-bold text-[var(--primary)]">
                  {stat.value}
                </p>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[var(--primary-fixed)] text-[var(--on-primary-fixed)] border-0">
              Why Choose Us
            </Badge>
            <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-4">
              A Premium Experience, <br className="hidden sm:block" />
              Built on Trust
            </h2>
            <p className="text-[var(--on-surface-variant)] max-w-xl mx-auto">
              We combine traditional values with modern technology to create
              the most dignified matrimonial experience in India.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-[var(--surface-container-lowest)] rounded-2xl p-6 shadow-ambient hover:shadow-lg transition-shadow group"
              >
                <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-serif text-base font-semibold text-[var(--on-surface)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Premium CTA ─── */}
      <section className="bg-[var(--surface-container-low)] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[var(--surface-container-lowest)] rounded-3xl p-10 lg:p-16 shadow-ambient relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--primary-fixed)]/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <Crown className="w-10 h-10 text-[var(--primary)] mx-auto mb-4" />
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[var(--on-surface)] mb-4">
              Unlock Premium Membership
            </h2>
            <p className="text-[var(--on-surface-variant)] mb-2 max-w-lg mx-auto">
              Get access to contact details, send unlimited expressions of interest,
              and get priority listing.
            </p>
            <p className="font-serif text-4xl font-bold text-[var(--primary)] mb-8">
              ₹999 <span className="text-base font-normal text-[var(--on-surface-variant)]">/ year</span>
            </p>
            <Button
              asChild
              size="lg"
              className="gold-gradient text-white rounded-full px-10 py-6 text-base font-semibold"
              id="premium-cta-btn"
            >
              <Link href="/auth/signup">Get Premium Access</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)]">
              Love Stories
            </h2>
            <p className="text-[var(--on-surface-variant)] mt-3">
              Thousands of families have found happiness through us.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-[var(--surface-container-lowest)] rounded-2xl p-6 shadow-ambient"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--on-surface)]">{t.name}</p>
                    <p className="text-xs text-[var(--on-surface-variant)]">{t.location}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-[var(--primary-container)] fill-[var(--primary-container)]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[var(--surface-container)] py-12 border-t border-[rgba(208,197,175,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 gold-gradient rounded-full flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif font-semibold text-[var(--primary)]">Izzatdar Parivar</span>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)]">
              © {new Date().getFullYear()} Izzatdar Parivar. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-[var(--on-surface-variant)]">
              <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-[var(--primary)] transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
