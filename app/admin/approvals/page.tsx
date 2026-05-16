"use client";


import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";


interface PendingProfile {
  uid: string;
  displayName: string;
  age: number;
  photoURL: string;
  gender: string;
  createdAt: string;
}


export default function ApprovalsPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ uid: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchPending();
  }, [user]);

  async function fetchPending() {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/approvals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProfiles(data.profiles);
    } catch {
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(userId: string, action: "approve" | "reject", reason?: string) {
    if (!user) return;
    setActionLoading(userId);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/approvals", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, reason }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success(`Profile ${action}d successfully`);
      setProfiles((prev) => prev.filter((p) => p.uid !== userId));
      setRejectModal(null);
      setRejectReason("");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#800000]" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-serif text-[#800000] mb-2">Profile Approvals</h1>
      <p className="text-gray-500 mb-8">{profiles.length} profiles pending review</p>

      {profiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No pending profiles</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Background</th>
                  <th className="px-6 py-4">Occupation</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profiles.map((profile) => (
                  <tr key={profile.uid} className="hover:bg-gray-50 transition-colors">
                    {/* Profile & Basic Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          {profile.photoURL ? (
                            <Image src={profile.photoURL} alt={profile.name || profile.displayName || "Photo"} width={48} height={48} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-base">{profile.name || profile.displayName || "Unknown"}</div>
                          <div className="text-xs mt-0.5">
                            {profile.age ? `${profile.age} yrs` : "Age N/A"} • {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "N/A"}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">Joined {profile.createdAt}</div>
                        </div>
                      </div>
                    </td>

                    {/* Background */}
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <div><span className="font-medium text-gray-800">Religion:</span> {profile.religion || "N/A"}</div>
                        <div><span className="font-medium text-gray-800">Caste:</span> {profile.caste || "N/A"}</div>
                        <div><span className="font-medium text-gray-800">Location:</span> {profile.location || profile.city || "N/A"}</div>
                      </div>
                    </td>

                    {/* Occupation */}
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <div><span className="font-medium text-gray-800">Job:</span> {profile.occupation || "N/A"}</div>
                        <div><span className="font-medium text-gray-800">Education:</span> {profile.education || "N/A"}</div>
                        <div><span className="font-medium text-gray-800">Income:</span> {profile.income || "N/A"}</div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1 break-all">
                        <div><span className="font-medium text-gray-800">Email:</span> <br/>{profile.email || "N/A"}</div>
                        {profile.phone && <div><span className="font-medium text-gray-800">Phone:</span> <br/>{profile.phone}</div>}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right align-middle">
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => handleAction(profile.uid, "approve")}
                          disabled={actionLoading === profile.uid}
                          className="w-24 px-3 py-1.5 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ uid: profile.uid, name: profile.name || profile.displayName || "User" })}
                          disabled={actionLoading === profile.uid}
                          className="w-24 px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-medium hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-red-500 w-6 h-6" />
              <h2 className="text-xl font-serif text-[#800000]">Reject {rejectModal.name}</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this profile. This will be logged for auditing purposes.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Incomplete profile, fake photo, etc."
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleAction(rejectModal.uid, "reject", rejectReason)}
                disabled={!rejectReason.trim() || actionLoading === rejectModal.uid}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {actionLoading === rejectModal.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

