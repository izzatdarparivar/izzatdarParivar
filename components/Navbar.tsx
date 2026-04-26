"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Menu, X, Crown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Navbar() {
  const { user, userProfile, logOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    toast.success("Signed out successfully");
    router.push("/");
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-[rgba(208,197,175,0.2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-14 h-14 overflow-hidden rounded-md">
              <Image 
                src="/logo.png" 
                alt="Izzatdar Parivar Logo" 
                fill
                className="object-cover object-top scale-[1.3]"
                priority
              />
            </div>
            <span className="font-serif text-xl font-semibold text-[var(--primary)] tracking-tight">
              Izzatdar Parivar
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/matches" className="text-sm font-medium text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
              Find Matches
            </Link>
            <Link href="/about" className="text-sm font-medium text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
              About Us
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
                  Dashboard
                </Link>
                {userProfile?.is_premium && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full ring-2 ring-[var(--primary-container)] hover:ring-[var(--primary)] transition-all">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={user.photoURL || ""} />
                        <AvatarFallback className="bg-[var(--primary-container)] text-[var(--on-primary-container)] text-sm font-semibold">
                          {user.displayName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/create">Edit Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild className="text-[var(--primary)]">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="gold-gradient text-white rounded-full px-5">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-[var(--on-surface-variant)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(208,197,175,0.2)] bg-[var(--surface-container-lowest)] px-4 py-4 space-y-3">
          <Link href="/matches" className="block text-sm font-medium text-[var(--on-surface-variant)]" onClick={() => setMobileOpen(false)}>Find Matches</Link>
          <Link href="/about" className="block text-sm font-medium text-[var(--on-surface-variant)]" onClick={() => setMobileOpen(false)}>About Us</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block text-sm font-medium text-[var(--on-surface-variant)]" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left text-sm font-medium text-red-600">Sign Out</button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild><Link href="/auth/login">Sign In</Link></Button>
              <Button asChild className="gold-gradient text-white"><Link href="/auth/signup">Get Started</Link></Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
