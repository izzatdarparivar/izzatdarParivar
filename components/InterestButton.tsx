"use client";


import { useState } from "react";
import { Heart, HeartOff, Loader2, CheckCircle } from "lucide-react";
import { sendInterest } from "@/lib/interests";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";


interface InterestButtonProps {
  toUserId: string;
  initialStatus?: "none" | "sent" | "mutual";
  onMutualMatch?: () => void;
}



export default function InterestButton({
  toUserId,
  initialStatus = "none",
  onMutualMatch,
}: InterestButtonProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"none" | "sent" | "mutual" | "loading">(initialStatus);

  async function handleSendInterest() {
    if (!user) return toast.error("Please login to send interest");
    if (status !== "none") return;
    setStatus("loading");

    try {
      const result = await sendInterest(user.uid, toUserId);

      if (!result.success) {
        toast.error(result.error || "Could not send interest");
        setStatus("none");
        return;
      }
      if (result.isMutual) {
        setStatus("mutual");
        toast.success("🎉 It's a mutual match! You can now chat.");
        onMutualMatch?.();
      } else {
        setStatus("sent");
        toast.success("Interest sent!");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setStatus("none");
    }
  }

  if (status === "loading") {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Sending…
      </button>
    );
  }

  if (status === "mutual") {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold border border-green-200"
      >
        <CheckCircle className="w-4 h-4" />
        Mutual Match
      </button>
    );
  }

  if (status === "sent") {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-sm font-medium border border-orange-200"
      >
        <HeartOff className="w-4 h-4" />
        Interest Sent
      </button>
    );
  }

  return (
    <button
      onClick={handleSendInterest}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
    >
      <Heart className="w-4 h-4" />
      Send Interest
    </button>
  );
}
