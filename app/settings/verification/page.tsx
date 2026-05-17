"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertCircle, Clock, Upload, ArrowLeft } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface VerificationItem {
  type: string;
  label: string;
  description: string;
  status: "none" | "pending" | "verified" | "rejected";
}

export default function VerificationSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const verTypes = [
    { type: "aadhaar", label: "Aadhaar / ID Card", description: "Verify your identity using government issued Aadhaar card." },
    { type: "pan", label: "PAN Card", description: "Verify taxation record details to prove financial legitimacy." },
    { type: "education", label: "Education Certificate", description: "Verify college degree or educational certificates." },
    { type: "employment", label: "Employment Proof", description: "Verify payslip or employment offer letter." },
    { type: "photo", label: "Selfie Verification", description: "A real-time selfie verification to authenticate photo matches." }
  ];

  const loadVerificationStatus = async () => {
    if (!user) return;
    try {
      const loaded: VerificationItem[] = [];
      for (const t of verTypes) {
        const docRef = doc(db, "verifications", `${user.uid}_${t.type}`);
        const snap = await getDoc(docRef);
        const status = snap.exists() ? snap.data().status : "none";
        loaded.push({ ...t, status });
      }
      setItems(loaded);
    } catch (err: any) {
      toast.error("Failed to load verification files");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      loadVerificationStatus();
    }
  }, [user, loading, router]);

  if (loading || !user || fetching) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleUploadClick = async (type: string) => {
    setUploading(type);
    try {
      // Simulate file picker / upload process
      const docRef = doc(db, "verifications", `${user.uid}_${type}`);
      await setDoc(docRef, {
        userId: user.uid,
        type,
        status: "pending",
        uploadedAt: new Date(),
        documentUrl: "https://example.com/mock-doc.jpg"
      });
      toast.success(`Verification documents submitted for ${type}`);
      await loadVerificationStatus();
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3.5 h-3.5" /> Verified
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            Not Verified
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)] flex items-center gap-2">
            <Shield className="w-8 h-8 text-[var(--primary)]" /> Document Verification
          </h1>
          <p className="text-[var(--on-surface-variant)] mt-1">
            Increase your trust score and matchmaking priority by uploading verified proofs.
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.type} 
              className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-base text-[var(--on-surface)]">{item.label}</h3>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex sm:justify-end">
                {item.status === "none" || item.status === "rejected" ? (
                  <Button 
                    onClick={() => handleUploadClick(item.type)}
                    disabled={uploading !== null}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary)]/5 font-semibold transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading === item.type ? "Uploading..." : "Upload Proof"}
                  </Button>
                ) : item.status === "pending" ? (
                  <span className="text-sm text-[var(--on-surface-variant)] italic">
                    Awaiting administrator review
                  </span>
                ) : (
                  <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Verification Complete
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
