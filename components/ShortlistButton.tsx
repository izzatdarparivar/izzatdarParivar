"use client";


import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isShortlisted, addToShortlist, removeFromShortlist } from "@/lib/shortlist";
import { toast } from "sonner";


interface ShortlistButtonProps {
  profileId: string;
  className?: string;
}


export default function ShortlistButton({ profileId, className = "" }: ShortlistButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!user) { setLoading(false); return; }
    isShortlisted(user.uid, profileId).then(setSaved).finally(() => setLoading(false));
  }, [user, profileId]);


  const handleToggle = async () => {
    if (!user) { toast.error("Please sign in to save profiles"); return; }
    setLoading(true);
    try {
      if (saved) {
        await removeFromShortlist(user.uid, profileId);
        setSaved(false);
        toast.success("Removed from saved profiles");
      } else {
        await addToShortlist(user.uid, profileId);
        setSaved(true);
        toast.success("Added to saved profiles");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full transition-all ${saved ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-white/80 text-gray-400 hover:text-red-400 hover:bg-red-50"} ${className}`}
      title={saved ? "Remove from saved" : "Save profile"}
    >
      <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}

