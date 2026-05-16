"use client";


import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";


interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
}


const REASONS = [
  { value: "fake_profile", label: "Fake Profile" },
  { value: "harassment", label: "Harassment / Abusive Behavior" },
  { value: "inappropriate_photos", label: "Inappropriate Photos" },
  { value: "scam", label: "Scam / Fraud" },
  { value: "underage", label: "Underage User" },
  { value: "other", label: "Other" },
];


export default function ReportModal({ open, onClose, targetUserId, targetUserName }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);


  if (!open) return null;


  const handleSubmit = async () => {
    if (!user || !reason) { toast.error("Please select a reason"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reporterId: user.uid, reportedUserId: targetUserId, reason, details }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Report submitted. Our team will review it."); onClose(); setReason(""); setDetails(""); }
      else toast.error(data.error || "Failed to submit report");
    } catch { toast.error("Network error"); }
    finally { setSubmitting(false); }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Report {targetUserName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Why are you reporting this profile?</p>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${reason === r.value ? "border-[var(--primary)] bg-[var(--primary-container)]/20" : "border-gray-200 hover:border-gray-300"}`}>
                <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={(e) => setReason(e.target.value)} className="accent-[var(--primary)]" />
                <span className="text-sm font-medium text-gray-700">{r.label}</span>
              </label>
            ))}
          </div>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Additional details (optional)..." rows={3} className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[var(--primary)]" />
        </div>
        <div className="p-6 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!reason || submitting} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
}

