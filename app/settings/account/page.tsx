"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AccountSettingsPage() {
  const { user, logOut, loading } = useAuth();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error('Type DELETE to confirm');
      return;
    }
    setDeleting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Deletion failed");
      await logOut();
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="p-4 bg-red-50 text-red-600 rounded-full inline-block mb-3">
            <Trash2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-red-700">Delete Account</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Permanently remove your account and matrimonial profile.
          </p>
        </div>

        <div className="bg-[var(--surface-container-lowest)] border border-red-200/40 rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-red-800 font-bold">This action is permanent and cannot be undone.</p>
              <ul className="text-xs text-red-700 list-disc pl-4 space-y-1">
                <li>Your profile will be removed from the matchmaking feed</li>
                <li>All your matches, interests, and messages will be deleted</li>
                <li>Your premium subscription will not be refunded</li>
                <li>You cannot recover this account once deleted</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Type <strong className="text-red-700 font-bold">DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 focus:border-red-500 rounded-xl text-sm outline-none transition-all font-mono"
                placeholder="Type DELETE here"
              />
            </div>

            <Button
              onClick={handleDelete}
              disabled={deleting || confirmText !== "DELETE"}
              className="w-full py-6 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md text-sm"
            >
              {deleting ? "Deleting account..." : "Permanently Delete My Account"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
