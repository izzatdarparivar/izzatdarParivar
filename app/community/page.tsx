"use client";


import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getGroups,
  joinGroup,
  leaveGroup,
  isMember,
  CommunityGroup,
} from "@/lib/community-groups";


export default function CommunityPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [membershipMap, setMembershipMap] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);


  useEffect(() => {
    loadGroups();
  }, [category]);


  async function loadGroups() {
    setLoading(true);
    try {
      const data = await getGroups(category || undefined);
      setGroups(data);
      if (user) {
        const map: Record<string, boolean> = {};
        await Promise.all(
          data.map(async (g) => {
            map[g.id!] = await isMember(user.uid, g.id!);
          })
        );
        setMembershipMap(map);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }


  async function handleJoinLeave(groupId: string) {
    if (!user) return;
    setActionLoading(groupId);
    try {
      if (membershipMap[groupId]) {
        await leaveGroup(user.uid, groupId);
        setMembershipMap((p) => ({ ...p, [groupId]: false }));
      } else {
        await joinGroup(user.uid, groupId);
        setMembershipMap((p) => ({ ...p, [groupId]: true }));
      }
    } catch {
      // Error
    } finally {
      setActionLoading(null);
    }
  }


  const CATEGORIES = [
    { value: "", label: "All" },
    { value: "caste", label: "Caste" },
    { value: "region", label: "Region" },
    { value: "profession", label: "Profession" },
    { value: "interest", label: "Interest" },
    { value: "religion", label: "Religion" },
  ];


  return (
    <div className="min-h-screen bg-[#fff9f0] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif text-[#800000] mb-2">Community Groups</h1>
        <p className="text-gray-500 mb-8">Connect with people from your community</p>


        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat.value
                  ? "bg-[#f97316] text-white"
                  : "bg-white text-gray-600 border hover:bg-orange-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>


        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">No groups found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-orange-50 text-[#f97316] rounded-full capitalize">
                      {group.category}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{group.memberCount} members</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                <button
                  onClick={() => handleJoinLeave(group.id!)}
                  disabled={actionLoading === group.id}
                  className={`w-full py-2 rounded-full text-sm font-medium transition-colors ${
                    membershipMap[group.id!]
                      ? "border border-gray-300 text-gray-600 hover:bg-gray-50"
                      : "gold-gradient text-white"
                  }`}
                >
                  {actionLoading === group.id ? "..." : membershipMap[group.id!] ? "Leave" : "Join"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

