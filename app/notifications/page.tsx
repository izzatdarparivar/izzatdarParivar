"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import {
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  AppNotification,
} from "@/lib/notifications";
import {
  Heart,
  MessageCircle,
  Bell,
  CheckCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


const ICON_MAP: Record<string, { icon: typeof Heart; color: string; bg: string }> = {
  interest: { icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  message: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50" },
  match: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  system: { icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
};


export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);


  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);


  useEffect(() => {
    if (!user) return;


    const unsub = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
      setLoadingNotifs(false);
    });


    return () => unsub();
  }, [user]);


  const unreadCount = notifications.filter((n) => !n.read).length;


  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.uid);
  };


  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read && notif.id) {
      await markNotificationRead(notif.id);
    }
  };


  const formatTime = (notif: AppNotification) => {
    const ts = notif.createdAt?.toDate?.();
    if (!ts) return "";
    const now = new Date();
    const diff = now.getTime() - ts.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);


    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return ts.toLocaleDateString([], { day: "numeric", month: "short" });
  };


  // Group notifications: Today, This Week, Earlier
  const grouped = groupNotifications(notifications);


  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />


      <main className="flex-1 max-w-2xl w-full mx-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--on-surface)]">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-[var(--on-surface-variant)] mt-0.5">
                {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="rounded-full text-xs border-[var(--outline-variant)]/40 text-[var(--primary)] hover:bg-[var(--primary-container)]/20"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>


        {/* Notification List */}
        <div className="px-4 sm:px-6 pb-6">
          {loadingNotifs ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--surface-container-lowest)] animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-container)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-[var(--surface-container)]" />
                    <div className="h-3 w-56 rounded bg-[var(--surface-container)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-[var(--primary-container)]/30 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-10 h-10 text-[var(--primary)]" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-[var(--on-surface)] mb-2">
                No notifications yet
              </h2>
              <p className="text-[var(--on-surface-variant)] text-sm max-w-xs">
                When you receive interests, messages, or updates, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map((group) => (
                <div key={group.label}>
                  <h3 className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2 px-1">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((notif) => {
                      const config = ICON_MAP[notif.type] || ICON_MAP.system;
                      const Icon = config.icon;


                      const content = (
                        <div
                          className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all duration-200 group cursor-pointer ${
                            notif.read
                              ? "bg-transparent hover:bg-[var(--surface-container-low)]"
                              : "bg-[var(--primary-container)]/15 hover:bg-[var(--primary-container)]/25"
                          }`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          {/* Icon or User Avatar */}
                          <div className="flex-shrink-0 relative">
                            {notif.fromUserName ? (
                              <div className="w-11 h-11 gold-gradient rounded-full flex items-center justify-center text-white text-sm font-serif font-bold">
                                {notif.fromUserName[0]?.toUpperCase() || "?"}
                              </div>
                            ) : (
                              <div className={`w-11 h-11 ${config.bg} rounded-full flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${config.color}`} />
                              </div>
                            )}
                            {/* Type indicator badge */}
                            {notif.fromUserName && (
                              <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 ${config.bg} rounded-full flex items-center justify-center border-2 border-white`}>
                                <Icon className={`w-2.5 h-2.5 ${config.color}`} />
                              </div>
                            )}
                          </div>


                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${notif.read ? "text-[var(--on-surface-variant)]" : "text-[var(--on-surface)] font-medium"}`}>
                              <span className="font-semibold">{notif.title}</span>
                              {" "}
                              <span className={notif.read ? "" : "text-[var(--on-surface-variant)]"}>{notif.body}</span>
                            </p>
                            <p className="text-xs text-[var(--outline)] mt-1">
                              {formatTime(notif)}
                            </p>
                          </div>


                          {/* Unread dot */}
                          {!notif.read && (
                            <div className="flex-shrink-0 mt-1.5">
                              <div className="w-2.5 h-2.5 bg-[var(--primary)] rounded-full" />
                            </div>
                          )}
                        </div>
                      );


                      return notif.actionUrl ? (
                        <Link key={notif.id} href={notif.actionUrl}>
                          {content}
                        </Link>
                      ) : (
                        <div key={notif.id}>{content}</div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


function groupNotifications(notifications: AppNotification[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);


  const today: AppNotification[] = [];
  const thisWeek: AppNotification[] = [];
  const earlier: AppNotification[] = [];


  notifications.forEach((n) => {
    const ts = n.createdAt?.toDate?.();
    if (!ts) {
      earlier.push(n);
      return;
    }
    if (ts >= todayStart) {
      today.push(n);
    } else if (ts >= weekStart) {
      thisWeek.push(n);
    } else {
      earlier.push(n);
    }
  });


  const groups = [];
  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (thisWeek.length > 0) groups.push({ label: "This Week", items: thisWeek });
  if (earlier.length > 0) groups.push({ label: "Earlier", items: earlier });


  return groups;
}



