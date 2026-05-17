"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import { toast } from "sonner";
import { ShieldAlert, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlockedUsersPage() {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const snap = await getDocs(
        collection(db, "blocks", user!.uid, "blockedUsers")
      );
      const profiles = await Promise.all(
        snap.docs.map(d => getUserProfile(d.id))
      );
      setBlocked(profiles.filter(Boolean) as UserProfile[]);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleUnblock = async (uid: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "blocks", user.uid, "blockedUsers", uid));
      setBlocked(prev => prev.filter(p => p.uid !== uid));
      toast.success("User unblocked successfully");
    } catch (err: any) {
      toast.error("Failed to unblock user");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="p-4 bg-amber-50 text-amber-700 rounded-full inline-block mb-3 border border-amber-100">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[var(--on-surface)]">Blocked Users</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Manage who cannot view your profile or initiate communication with you.
          </p>
        </div>

        <div className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-3xl p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : blocked.length === 0 ? (
            <p className="text-gray-500 text-center py-12">You have not blocked anyone.</p>
          ) : (
            <div className="space-y-3">
              {blocked.map(profile => (
                <div key={profile.uid} className="flex items-center justify-between bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-2xl p-4 hover:shadow-sm transition-all">
                  <div>
                    <p className="font-semibold text-sm text-[var(--on-surface)]">{profile.name}</p>
                    <p className="text-xs text-[var(--on-surface-variant)]">{profile.location}</p>
                  </div>
                  <Button
                    onClick={() => handleUnblock(profile.uid)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary)]/90 rounded-xl transition text-xs font-bold shadow-sm h-auto"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
