"use client";

import { motion } from "framer-motion";
import { Heart, Phone, Mail, Info, ShieldCheck, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--secondary)] text-[var(--surface)] py-16 border-t border-[var(--outline-variant)]/20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand + contact */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif font-bold text-xl text-[var(--surface)] tracking-wide">
                Izzatdar Parivar
              </span>
            </div>
            <p className="text-[var(--surface-variant)] mb-6 leading-relaxed">
              Connecting families with dignity, respect, and trust across India.
            </p>
            <div className="flex items-center gap-4 text-[var(--surface-variant)]">
              <Phone className="w-5 h-5" />
              <span>+91 70617 85692</span>
            </div>
            <div className="flex items-center gap-4 text-[var(--surface-variant)] mt-3">
              <Mail className="w-5 h-5" />
              <span>support@izzatdar.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3 text-[var(--surface-variant)]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-white transition-colors">
                  Browse Profiles
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-white transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-3 text-[var(--surface-variant)]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors flex items-center gap-2">
                  <Info className="w-4 h-4" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6">Start Your Journey</h4>
            <p className="text-[var(--surface-variant)] mb-6">
              Join today to find verified profiles matching your preferences.
            </p>
            <div className="space-y-3">
              <Button
                asChild
                className="gold-gradient text-[var(--on-primary)] w-full rounded-full font-bold"
              >
                <Link href="/auth/signup">Create Free Profile</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[var(--surface-variant)]/30 text-[var(--surface-variant)] w-full rounded-full font-semibold hover:bg-white/10 hover:text-white"
              >
                <Link href="/auth/login">Already registered? Sign In</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.1)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--surface-variant)]">
            © {new Date().getFullYear()} Izzatdar Parivar. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
