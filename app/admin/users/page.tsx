"use client";


import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Search, Filter, MoreVertical, Shield, UserX, UserCheck, Crown, Loader2 } from "lucide-react";


interface AdminUserEntry {
  uid: string;
  displayName: string;
  email: string;
  status: string;
  role: string;
  is_premium: boolean;
  createdAt: string;
}


type StatusFilter = "all" | "pending" | "approved" | "rejected" | "suspended";


export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);


  useEffect(() => {
    fetchUsers();
  }, [user, search, statusFilter, page]);


  async function fetchUsers() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers(data.users);
      setHasMore(data.hasMore);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }


  async function updateUser(uid: string, updates: Partial<AdminUserEntry>) {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, updates }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      toast.success("User updated successfully");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  }


  const STATUS_COLORS: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-gray-100 text-gray-700",
  };


  return (
    <div>
      <h1 className="text-3xl font-serif text-[#800000] mb-8">User Management</h1>


      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="flex-1 px-4 py-2 border rounded-xl"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
          className="px-4 py-2 border rounded-xl bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>


      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Premium</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{u.displayName}</td>
                    <td className="p-4 text-sm text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[u.status] || ""}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{u.role || "user"}</td>
                    <td className="p-4">{u.is_premium ? "✓" : "—"}</td>
                    <td className="p-4">
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "suspend") updateUser(u.uid, { status: "suspended" });
                          else if (val === "approve") updateUser(u.uid, { status: "approved" });
                          else if (val === "make_admin") updateUser(u.uid, { role: "admin" });
                          else if (val === "make_mod") updateUser(u.uid, { role: "moderator" });
                          e.target.value = "";
                        }}
                        className="text-sm border rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="" disabled>Action...</option>
                        <option value="approve">Approve</option>
                        <option value="suspend">Suspend</option>
                        <option value="make_mod">Make Moderator</option>
                        <option value="make_admin">Make Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-xl disabled:opacity-50">
          Previous
        </button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={!hasMore} className="px-4 py-2 border rounded-xl disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
}

