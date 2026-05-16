"use client";


import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";


interface Stats {
  totalUsers: number;
  pendingApprovals: number;
  activeReports: number;
  premiumUsers: number;
  recentActivity: { id: string; action: string; user: string; timestamp: string }[];
}


export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);


  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-2xl" /><div className="h-32 bg-gray-200 rounded-2xl" /></div>;
  }
  if (error) {
    return <div className="text-red-600 bg-red-50 p-4 rounded-xl">{error}</div>;
  }


  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, color: "bg-blue-50 text-blue-700" },
    { label: "Pending Approvals", value: stats?.pendingApprovals || 0, color: "bg-amber-50 text-amber-700" },
    { label: "Active Reports", value: stats?.activeReports || 0, color: "bg-red-50 text-red-700" },
    { label: "Premium Users", value: stats?.premiumUsers || 0, color: "bg-green-50 text-green-700" },
  ];


  return (
    <div>
      <h1 className="text-3xl font-serif text-[#800000] mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`${card.color} p-6 rounded-2xl`}>
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>


      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-serif text-[#800000] mb-4">Recent Activity</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <ul className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <li key={activity.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-gray-500 ml-2">{activity.action}</span>
                </div>
                <span className="text-sm text-gray-400">{activity.timestamp}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  );
}

