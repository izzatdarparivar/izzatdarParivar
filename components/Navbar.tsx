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
import { Heart, Menu, X, Crown, MessageCircle, Bell, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { subscribeToChatSessions } from "@/lib/chat";
import { subscribeToUnreadCount } from "@/lib/notifications";


export default function Navbar() {
  const { user, userProfile, logOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [chatCount, setChatCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    user.getIdTokenResult().then((res) => {
      const role = res.claims.role as string;
      setIsAdmin(role === "admin" || role === "moderator");
    });
  }, [user]);


  const isActive = (path: string) => pathname === path;
  const navLinkClass = (path: string) => `text-sm font-semibold transition-all duration-200 ${
    isActive(path)
      ? "text-[var(--primary)] scale-105"
      : "text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
  }`;


  // Subscribe to chat session count
  useEffect(() => {
    if (!user) { setChatCount(0); return; }


    const unsub = subscribeToChatSessions(user.uid, (sessions) => {
      setChatCount(sessions.length);
    });


    return () => unsub();
  }, [user]);


  // Subscribe to unread notification count
  useEffect(() => {
    if (!user) { setNotifCount(0); return; }


    const unsub = subscribeToUnreadCount(user.uid, (count) => {
      setNotifCount(count);
    });


    return () => unsub();
  }, [user]);


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
            <div className="relative w-12 h-12 overflow-hidden rounded-md">
              <Image
                src="/logo.png"
                alt="Izzatdar Parivar Logo"
                fill
                sizes="48px"
                className="object-cover object-top scale-[1.3]"
                priority
              />
            </div>
            <span className="font-serif text-lg font-bold text-[var(--primary)] tracking-tight">
              Izzatdar Parivar
            </span>
          </Link>


          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/matches" className={navLinkClass("/matches")}>
              Find Matches
            </Link>


            {user ? (
              <>
                <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                  Dashboard
                </Link>


                {/* Chat icon with badge */}
                <Link
                  href="/chat"
                  className={`relative p-2 rounded-full transition-all ${isActive("/chat") ? "bg-[var(--primary-container)]/50" : "hover:bg-[var(--surface-container)]"}`}
                  title="Messages"
                >
                  <MessageCircle className={`w-5 h-5 ${isActive("/chat") ? "text-[var(--primary)]" : "text-[var(--on-surface-variant)]"}`} />
                  {chatCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 ring-2 ring-white">
                      {chatCount > 99 ? "99+" : chatCount}
                    </span>
                  )}
                </Link>


                {/* Notification bell with badge */}
                <Link
                  href="/notifications"
                  className={`relative p-2 rounded-full transition-all ${isActive("/notifications") ? "bg-[var(--primary-container)]/50" : "hover:bg-[var(--surface-container)]"}`}
                  title="Notifications"
                >
                  <Bell className={`w-5 h-5 ${isActive("/notifications") ? "text-[var(--primary)]" : "text-[var(--on-surface-variant)]"}`} />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 ring-2 ring-white">
                      {notifCount > 99 ? "99+" : notifCount}
                    </span>
                  )}
                </Link>


                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full ring-2 ring-[var(--primary-container)] hover:ring-[var(--primary)] transition-all ml-2">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={userProfile?.photoURL || user.photoURL || ""} alt={userProfile?.name || user.displayName || "User"} />
                        <AvatarFallback className="bg-[var(--primary-container)] text-[var(--on-primary-container)] text-sm font-semibold">
                          {user.displayName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-ambient border-[var(--outline-variant)]/20 bg-white">
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Account</p>
                    </div>
                    <DropdownMenuItem asChild className={isActive("/dashboard") ? "bg-[var(--primary-container)]/30 text-[var(--primary)] font-bold" : ""}>
                      <Link href="/dashboard" className="flex items-center gap-2 py-2.5">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isActive("/profile/create") ? "bg-[var(--primary-container)]/30 text-[var(--primary)] font-bold" : ""}>
                      <Link href="/profile/create" className="flex items-center gap-2 py-2.5">Edit Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isActive("/chat") ? "bg-[var(--primary-container)]/30 text-[var(--primary)] font-bold" : ""}>
                      <Link href="/chat" className="flex items-center gap-2 py-2.5">Messages {chatCount > 0 && `(${chatCount})`}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isActive("/notifications") ? "bg-[var(--primary-container)]/30 text-[var(--primary)] font-bold" : ""}>
                      <Link href="/notifications" className="flex items-center gap-2 py-2.5">Notifications {notifCount > 0 && `(${notifCount})`}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-[var(--outline-variant)]/10" />
                    <div className="px-3 py-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Settings</p>
                    </div>
                    <DropdownMenuItem asChild className={isActive("/settings/privacy") ? "bg-[var(--primary-container)]/30 text-[var(--primary)] font-bold" : ""}>
                      <Link href="/settings/privacy" className="flex items-center gap-2 py-1.5 text-xs">Privacy Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isActive("/settings/verification") ? "bg-[var(--primary-container)]/30 text-[var(--primary)] font-bold" : ""}>
                      <Link href="/settings/verification" className="flex items-center gap-2 py-1.5 text-xs">Verification</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isActive("/settings/referrals") ? "bg-[var(--primary-container)]/30 text-[var(--primary)] font-bold" : ""}>
                      <Link href="/settings/referrals" className="flex items-center gap-2 py-1.5 text-xs">Referrals</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isActive("/settings/blocked") ? "bg-[var(--primary-container)]/30 text-[var(--primary)] font-bold" : ""}>
                      <Link href="/settings/blocked" className="flex items-center gap-2 py-1.5 text-xs">Blocked Users</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={isActive("/settings/account") ? "bg-[var(--primary-container)]/30 text-[var(--primary)] font-bold" : ""}>
                      <Link href="/settings/account" className="flex items-center gap-2 py-1.5 text-xs text-red-600">Delete Account</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="my-1.5 bg-[var(--outline-variant)]/10" />
                        <DropdownMenuItem asChild className="p-0">
                          <Link 
                            href="/admin" 
                            className={`flex items-center gap-2 px-3 py-3 mx-1 my-1 rounded-xl transition-all duration-200 ${
                              isActive("/admin") 
                                ? "bg-amber-100 text-[#800000] shadow-sm" 
                                : "bg-amber-50/50 text-[#800000] hover:bg-amber-100/80"
                            }`}
                          >
                            <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center shadow-sm">
                              <ShieldCheck className="w-4 h-4 text-[#800000]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold tracking-tight">Admin Dashboard</span>
                              <span className="text-[9px] font-medium opacity-70">Platform Management</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator className="my-1 bg-[var(--outline-variant)]/10" />
                    <DropdownMenuItem className="text-red-600 font-semibold focus:text-red-600 focus:bg-red-50 py-2.5" onClick={handleLogout}>
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
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <>
                <Link
                  href="/chat"
                  className={`relative p-2 rounded-full ${isActive("/chat") ? "bg-[var(--primary-container)]/50 text-[var(--primary)]" : "text-[var(--on-surface-variant)]"}`}
                >
                  <MessageCircle className="w-5 h-5" />
                  {chatCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-[var(--primary)] text-white text-[9px] font-bold flex items-center justify-center rounded-full px-0.5 ring-2 ring-white">
                      {chatCount > 99 ? "99+" : chatCount}
                    </span>
                  )}
                </Link>


                <Link
                  href="/notifications"
                  className={`relative p-2 rounded-full ${isActive("/notifications") ? "bg-[var(--primary-container)]/50 text-[var(--primary)]" : "text-[var(--on-surface-variant)]"}`}
                >
                  <Bell className="w-5 h-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full px-0.5 ring-2 ring-white">
                      {notifCount > 99 ? "99+" : notifCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              className="p-2 rounded-lg text-[var(--on-surface-variant)]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>


      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(208,197,175,0.2)] bg-[var(--surface-container-lowest)] px-4 py-4 space-y-3">
          <Link href="/matches" className={`block text-sm py-2 px-3 rounded-lg ${isActive("/matches") ? "bg-[var(--primary-container)]/50 text-[var(--primary)] font-bold" : "font-medium text-[var(--on-surface-variant)]"}`} onClick={() => setMobileOpen(false)}>Find Matches</Link>
          {user ? (
            <>
              <Link href="/dashboard" className={`block text-sm py-2 px-3 rounded-lg ${isActive("/dashboard") ? "bg-[var(--primary-container)]/50 text-[var(--primary)] font-bold" : "font-medium text-[var(--on-surface-variant)]"}`} onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/chat" className={`flex items-center gap-2 text-sm py-2 px-3 rounded-lg ${isActive("/chat") ? "bg-[var(--primary-container)]/50 text-[var(--primary)] font-bold" : "font-medium text-[var(--on-surface-variant)]"}`} onClick={() => setMobileOpen(false)}>
                Messages
                {chatCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
                    {chatCount}
                  </span>
                )}
              </Link>
              <Link href="/notifications" className={`flex items-center gap-2 text-sm py-2 px-3 rounded-lg ${isActive("/notifications") ? "bg-[var(--primary-container)]/50 text-[var(--primary)] font-bold" : "font-medium text-[var(--on-surface-variant)]"}`} onClick={() => setMobileOpen(false)}>
                Notifications
                {notifCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
                    {notifCount}
                  </span>
                )}
              </Link>
              <Link href="/profile/create" className={`block text-sm py-2 px-3 rounded-lg ${isActive("/profile/create") ? "bg-[var(--primary-container)]/50 text-[var(--primary)] font-bold" : "font-medium text-[var(--on-surface-variant)]"}`} onClick={() => setMobileOpen(false)}>Edit Profile</Link>
              {isAdmin && (
                <Link href="/admin" className={`block text-sm py-2 px-3 rounded-lg bg-orange-50 text-[#800000] font-bold border border-orange-200`} onClick={() => setMobileOpen(false)}>
                  🛡️ Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left text-sm py-2 px-3 font-semibold text-red-600">Sign Out</button>
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



