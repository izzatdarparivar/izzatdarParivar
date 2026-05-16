"use client";


import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";


const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/approvals", label: "Approvals", icon: "✓" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/reports", label: "Reports", icon: "⚠" },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function checkRole() {
      if (!user) { setLoading(false); return; }
      try {
        const tokenResult = await user.getIdTokenResult();
        const role = tokenResult.claims.role as string;
        setAuthorized(role === "admin" || role === "moderator");
      } catch {
        setAuthorized(false);
      }
      setLoading(false);
    }
    checkRole();
  }, [user]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f0]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f97316] border-t-transparent" />
      </div>
    );
  }


  if (!user || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f0]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <h1 className="text-2xl font-serif text-[#800000] mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin panel.</p>
          <Link href="/" className="gold-gradient text-white px-6 py-3 rounded-full inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#fff9f0] flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>


      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6 border-b">
          <h1 className="text-xl font-serif text-[#800000] font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Izzatdar Parivar</p>
        </div>
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                pathname === item.href
                  ? "bg-[#f97316] text-white"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => {
              import("firebase/auth").then(({ getAuth, signOut }) => {
                signOut(getAuth());
                window.location.href = "/auth/login";
              });
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full text-left transition-colors mt-auto"
          >
            <span>🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>


      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}


      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

