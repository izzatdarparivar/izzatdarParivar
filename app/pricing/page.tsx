"use client";


import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PLANS, PlanFeatures, calculatePrice } from "@/lib/pricing";
import Navbar from "@/components/Navbar";


export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [userState] = useState("Maharashtra"); // Would come from user profile


  async function handleSubscribe(plan: PlanFeatures) {


    if (!user || plan.tier === "free") return;
    setLoading(plan.tier);
    try {
      const token = await user.getIdToken();
      const price = calculatePrice(plan, userState);
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price * 100, plan: plan.tier, duration: plan.duration }),
      });
      const { orderId } = await res.json();


      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: price * 100,
        currency: "INR",
        name: "Izzatdar Parivar",
        description: `${plan.name} Plan - ${plan.duration} days`,
        order_id: orderId,
        handler: () => { window.location.reload(); },
        prefill: { email: user.email },
        notes: { uid: user.uid, plan: plan.tier },
        theme: { color: "#f97316" },
      };


      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch {} finally { setLoading(null); }
  }


  const FEATURE_LABELS: Record<string, string> = {
    dailyLikes: "Daily Likes",
    messagesPerDay: "Messages/Day",
    seeWhoLiked: "See Who Liked You",
    advancedFilters: "Advanced Filters",
    prioritySupport: "Priority Support",
    profileBoost: "Profile Boost",
    verifiedBadge: "Verified Badge",
    videoCall: "Video Calls",
    undoSwipe: "Undo Swipe",
    hideOnlineStatus: "Hide Online Status",
    readReceipts: "Read Receipts",
    profileHighlight: "Profile Highlight",
    dedicatedRM: "Dedicated Manager",
    familyMeetingAssist: "Family Meeting Assist",
  };


  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-4">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-[#800000] mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg">Find your perfect match with the right plan</p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={`bg-white rounded-2xl p-6 shadow-sm relative ${
                plan.tier === "gold" ? "ring-2 ring-[#f97316] scale-105" : ""
              }`}
            >
              {plan.tier === "gold" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f97316] text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h2 className="text-xl font-serif text-[#800000] mb-1">{plan.name}</h2>
              <div className="mb-4">
                {plan.price === 0 ? (
                  <span className="text-3xl font-bold">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">₹{calculatePrice(plan, userState)}</span>
                    <span className="text-gray-500 text-sm">/{plan.duration} days</span>
                  </>
                )}
              </div>


              <ul className="space-y-2 mb-6">
                {Object.entries(plan.features).map(([key, value]) => {
                  let display = "";
                  if (typeof value === "boolean") display = value ? "✓" : "—";
                  else if (value === -1) display = "Unlimited";
                  else if (key === "profileBoost") display = value === 0 ? "—" : `${[0, 2, 5, 10][value]}x`;
                  else display = String(value);


                  return (
                    <li key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{FEATURE_LABELS[key]}</span>
                      <span className={value ? "text-green-600 font-medium" : "text-gray-400"}>{display}</span>
                    </li>
                  );
                })}
              </ul>


              <button
                onClick={() => handleSubscribe(plan)}
                disabled={plan.tier === "free" || loading === plan.tier}
                className={`w-full py-3 rounded-full font-medium transition-colors ${
                  plan.tier === "free"
                    ? "bg-gray-100 text-gray-500 cursor-default"
                    : plan.tier === "gold"
                    ? "gold-gradient text-white"
                    : "border-2 border-[#f97316] text-[#f97316] hover:bg-orange-50"
                } disabled:opacity-50`}
              >
                {plan.tier === "free" ? "Current" : loading === plan.tier ? "Processing..." : "Subscribe"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

