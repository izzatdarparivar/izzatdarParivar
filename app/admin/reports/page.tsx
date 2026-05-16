"use client";


import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ShieldAlert, CheckCircle2, XCircle, Loader2 } from "lucide-react";


interface ReportEntry {
  id: string;
  reportedBy: string;
  reportedByName: string;
  reportedUser: string;
  reportedUserName: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
}


type ReportFilter = "all" | "pending" | "reviewed" | "action_taken" | "dismissed";


export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportFilter>("pending");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);


  useEffect(() => {
    fetchReports();
  }, [user, filter]);


  async function fetchReports() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReports(data.reports);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }


  async function handleReportAction(reportId: string, status: string, actionTaken?: string) {
    if (!user) return;
    setActionLoading(reportId);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status, actionTaken }),
      });
      if (!res.ok) throw new Error("Failed to process report");
      toast.success("Report updated");
      fetchReports();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(null);
    }
  }


  const REASON_LABELS: Record<string, string> = {
    fake_profile: "Fake Profile",
    harassment: "Harassment",
    inappropriate_content: "Inappropriate Content",
    underage: "Underage",
    spam: "Spam",
    other: "Other",
  };


  return (
    <div>
      <h1 className="text-3xl font-serif text-[#800000] mb-2">Reports</h1>
      <p className="text-gray-500 mb-8">Review and manage user reports</p>


      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "reviewed", "action_taken", "dismissed"] as ReportFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f ? "bg-[#f97316] text-white" : "bg-white text-gray-600 border hover:bg-orange-50"
            }`}
          >
            {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>


      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl"><p className="text-gray-500">No reports found</p></div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === report.id ? null : report.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
                      {REASON_LABELS[report.reason] || report.reason}
                    </span>
                    <span className="text-sm text-gray-500">{report.createdAt}</span>
                  </div>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">{report.reportedByName}</span>
                    {" reported "}
                    <span className="font-medium">{report.reportedUserName}</span>
                  </p>
                </div>
                <span className="text-gray-400">{expanded === report.id ? "▲" : "▼"}</span>
              </div>


              {expanded === report.id && (
                <div className="px-4 pb-4 border-t">
                  <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">{report.details || "No additional details"}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleReportAction(report.id, "dismissed")}
                      disabled={actionLoading === report.id}
                      className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-50 disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleReportAction(report.id, "reviewed", "Warning sent")}
                      disabled={actionLoading === report.id}
                      className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50"
                    >
                      Warn User
                    </button>
                    <button
                      onClick={() => handleReportAction(report.id, "action_taken", "User suspended")}
                      disabled={actionLoading === report.id}
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                    >
                      Suspend User
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

