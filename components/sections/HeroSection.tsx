"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, CheckCircle, Heart } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-fixed)]/30 via-[var(--background)] to-[var(--secondary-container)]/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--primary-container)]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--secondary-container)]/20 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <Badge className="mb-6 bg-[var(--primary-fixed)] text-[var(--on-primary-container)] border-0 font-medium text-sm px-4 py-1.5 rounded-full">
            ✨ Growing among families across India
          </Badge>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--on-surface)] leading-[1.1] tracking-tight mb-6">
            Find Your Life Partner <br /> Built on{" "}
            <span className="text-[var(--primary)]">Trust</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--on-surface-variant)] leading-relaxed max-w-xl mb-10">
            A premium, secure platform connecting genuine Indian families. Create
            your profile with confidence and discover matches that align with your
            values.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button
              asChild
              size="lg"
              className="gold-gradient text-white rounded-full px-8 py-6 text-base font-semibold shadow-ambient hover:opacity-90 transition-opacity"
            >
              <Link href="/auth/signup" id="hero-get-started-btn">
                Create Profile
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
                Browse Matches
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-4 text-sm font-medium text-[var(--on-surface-variant)]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" /> Private
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[var(--primary)]" /> Verified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[var(--primary)]" /> Easy to use
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white"
        >
          <Image
            src="/images/hero_family.png"
            alt="Happy family and newlywed couple"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
