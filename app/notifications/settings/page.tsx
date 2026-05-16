"use client";


import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getPreferences,
  updatePreferences,
  requestNotificationPermission,
  saveSubscription,
  NotificationPreferences,
} from "@/lib/push-notifications";


export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);


  useEffect(() => {
    if (!user) return;
    loadPrefs();
    checkPushStatus();
  }, [user]);


  async function loadPrefs() {
    if (!user) return;
    try {
      const data = await getPreferences(user.uid);
      setPrefs(data);
    } catch {} finally { setLoading(false); }
  }


  function checkPushStatus() {
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }


  async function enablePush() {
    if (!user) return;
    const token = await requestNotificationPermission();
    if (token) {
      await saveSubscription(user.uid, token);
      setPushEnabled(true);
    }
  }


  async function handleSave() {
    if (!user || !prefs) return;
    setSaving(true);
    try {
      const { userId, ...updates } = prefs;
      await updatePreferences(user.uid, updates);
    } catch {} finally { setSaving(false); }
  }


  function toggle(field: keyof NotificationPreferences) {
    setPrefs((p) => p ? { ...p, [field]: !p[field] } : p);
  }


  if (!user) return null;
  if (loading) return <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f97316] border-t-transparent" /></div>;


  return (
    <div className="min-h-screen bg-[#fff9f0] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif text-[#800000] mb-8">Notification Settings</h1>


        {/* Push permission */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">Push Notifications</h2>
              <p className="text-sm text-gray-500">Receive notifications even when the app is closed</p>
            </div>
            {pushEnabled ? (
              <span className="text-green-600 text-sm font-medium">Enabled</span>
            ) : (
              <button onClick={enablePush} className="gold-gradient text-white px-4 py-2 rounded-full text-sm">
                Enable
              </button>
            )}
          </div>
        </div>


        {/* Preferences */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-lg mb-4">Notification Types</h2>
          {[
            { field: "newMatch" as const, label: "New Matches", desc: "When someone matches with you" },
            { field: "newMessage" as const, label: "New Messages", desc: "When you receive a message" },
            { field: "interestReceived" as const, label: "Interest Received", desc: "When someone sends you interest" },
            { field: "profileView" as const, label: "Profile Views", desc: "When someone views your profile" },
            { field: "systemUpdates" as const, label: "System Updates", desc: "Important platform announcements" },
            { field: "promotions" as const, label: "Promotions", desc: "Special offers and discounts" },
          ].map(({ field, label, desc }) => (
            <div key={field} className="flex justify-between items-center py-3 border-b last:border-0">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
              <button
                onClick={() => toggle(field)}
                className={`w-12 h-6 rounded-full transition-colors relative ${prefs?.[field] ? "bg-[#f97316]" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${prefs?.[field] ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}


          {/* Quiet Hours */}
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Quiet Hours</h3>
            <div className="flex gap-4 items-center">
              <div>
                <label className="text-sm text-gray-500">From</label>
                <input
                  type="time"
                  value={prefs?.quietHoursStart || "22:00"}
                  onChange={(e) => setPrefs((p) => p ? { ...p, quietHoursStart: e.target.value } : p)}
                  className="block mt-1 p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">To</label>
                <input
                  type="time"
                  value={prefs?.quietHoursEnd || "08:00"}
                  onChange={(e) => setPrefs((p) => p ? { ...p, quietHoursEnd: e.target.value } : p)}
                  className="block mt-1 p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>


          <button onClick={handleSave} disabled={saving} className="w-full gold-gradient text-white py-3 rounded-full font-medium mt-6 disabled:opacity-50">
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}

