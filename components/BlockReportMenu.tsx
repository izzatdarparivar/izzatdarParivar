"use client";


import { useState } from "react";
import { MoreVertical, Ban, Flag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";


interface BlockReportMenuProps {
  targetUserId: string;
  targetUserName: string;
  onReportClick: () => void;
}


export default function BlockReportMenu({ targetUserId, targetUserName, onReportClick }: BlockReportMenuProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);


  const handleBlock = async () => {
    if (!user) return;
    const confirmed = confirm(`Are you sure you want to block ${targetUserName}? They won't be able to see your profile or contact you.`);
    if (!confirmed) return;


    setBlocking(true);
    try {
      const res = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockerId: user.uid, blockedId: targetUserId }),
      });
      const data = await res.json();
      if (data.success) toast.success(`${targetUserName} has been blocked`);
      else toast.error(data.error || "Failed to block user");
    } catch {
      toast.error("Network error");
    } finally {
      setBlocking(false);
      setOpen(false);
    }
  };


  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-full hover:bg-gray-100 transition-all" title="More options">
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
            <button onClick={handleBlock} disabled={blocking} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all">
              <Ban className="w-4 h-4 text-red-500" /> Block User
            </button>
            <button onClick={() => { setOpen(false); onReportClick(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all">
              <Flag className="w-4 h-4 text-amber-500" /> Report Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
}

