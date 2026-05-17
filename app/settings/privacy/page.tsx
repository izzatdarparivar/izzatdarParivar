"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, EyeOff, PhoneOff } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function PrivacySettingsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Privacy States
  const [isPrivate, setIsPrivate] = useState(false);
  const [hideContactInfo, setHideContactInfo] = useState(false);
  const [hidePhotos, setHidePhotos] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (userProfile) {
      setIsPrivate((userProfile as any).isPrivate || false);
      setHideContactInfo((userProfile as any).hideContactInfo || false);
      setHidePhotos((userProfile as any).hidePhotos || false);
    }
  }, [user, loading, userProfile, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        isPrivate,
        hideContactInfo,
        hidePhotos,
        updatedAt: new Date(),
      });
      toast.success("Privacy settings updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)] flex items-center gap-2">
            <Lock className="w-8 h-8 text-[var(--primary)]" /> Privacy Settings
          </h1>
          <p className="text-[var(--on-surface-variant)] mt-1">
            Control your profile visibility and communication boundaries.
          </p>
        </div>

        <div className="bg-[var(--surface-container-lowest)] rounded-3xl p-8 shadow-ambient space-y-8 border border-[var(--outline-variant)]">
          
          {/* Card 1 */}
          <div className="flex items-start justify-between p-4 rounded-2xl hover:bg-[var(--surface-container-low)] transition-all">
            <div className="flex gap-4">
              <div className="p-3 bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-xl">
                <EyeOff className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[var(--on-surface)]">Private Profile</h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                  Hide your profile entirely from search results and match suggestions.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-2">
              <input 
                type="checkbox" 
                checked={isPrivate} 
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
            </label>
          </div>

          {/* Card 2 */}
          <div className="flex items-start justify-between p-4 rounded-2xl hover:bg-[var(--surface-container-low)] transition-all">
            <div className="flex gap-4">
              <div className="p-3 bg-[var(--secondary-container)] text-[var(--on-secondary-container)] rounded-xl">
                <PhoneOff className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[var(--on-surface)]">Restrict Contact Information</h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                  Only show your Phone Number & WhatsApp to premium/verified users.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-2">
              <input 
                type="checkbox" 
                checked={hideContactInfo} 
                onChange={(e) => setHideContactInfo(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
            </label>
          </div>

          {/* Card 3 */}
          <div className="flex items-start justify-between p-4 rounded-2xl hover:bg-[var(--surface-container-low)] transition-all">
            <div className="flex gap-4">
              <div className="p-3 bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[var(--on-surface)]">Hide Photos From Free Users</h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                  Require visitors to have an active premium package or mutual connection to view your gallery.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-2">
              <input 
                type="checkbox" 
                checked={hidePhotos} 
                onChange={(e) => setHidePhotos(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
            </label>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-[var(--outline-variant)] flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary)]/90 transition-all font-semibold"
            >
              {saving ? "Saving settings..." : "Save Privacy Settings"}
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
