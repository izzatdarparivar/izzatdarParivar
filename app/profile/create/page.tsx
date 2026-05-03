"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserProfile, getUserProfile } from "@/lib/firestore";
import { toast } from "sonner";
import { User, Heart, Briefcase, Camera } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface FormData {
  name: string;
  gender: string;
  dob: string;
  location: string;
  religion: string;
  caste: string;
  motherTongue: string;
  education: string;
  occupation: string;
  annualIncome: string;
  bio: string;
  phone: string;
  prefMinAge: string;
  prefMaxAge: string;
  prefReligion: string;
  prefLocation: string;
}

const religions = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi", "Jewish", "Other"];
const incomeRanges = ["Below ₹2L", "₹2L–5L", "₹5L–10L", "₹10L–20L", "₹20L–50L", "₹50L+"];

export default function CreateProfilePage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "", gender: "", dob: "", location: "", religion: "", caste: "",
    motherTongue: "", education: "", occupation: "", annualIncome: "", bio: "",
    phone: "", prefMinAge: "22", prefMaxAge: "35", prefReligion: "", prefLocation: "",
  });

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    getUserProfile(user.uid).then((p) => {
      if (p) {
        setForm((prev) => ({
          ...prev,
          name: p.name || "",
          gender: p.gender || "",
          location: p.location || "",
          religion: p.religion || "",
          caste: p.caste || "",
          motherTongue: p.motherTongue || "",
          education: p.education || "",
          occupation: p.occupation || "",
          annualIncome: p.annualIncome || "",
          bio: p.bio || "",
          phone: p.phone || "",
          prefMinAge: String(p.preferences?.minAge || 22),
          prefMaxAge: String(p.preferences?.maxAge || 35),
          prefReligion: p.preferences?.religion || "",
          prefLocation: p.preferences?.location || "",
          dob: p.dob
            ? new Date((p.dob as Timestamp).toDate()).toISOString().split("T")[0]
            : "",
        }));
      }
    });
  }, [user, router]);

  const set = (key: keyof FormData, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!user) return;
    if (!form.name || !form.gender) {
      toast.error("Name and gender are required");
      return;
    }
    setSaving(true);
    try {
      await createUserProfile(user.uid, {
        uid: user.uid,
        name: form.name,
        gender: form.gender as "male" | "female" | "other",
        dob: form.dob ? Timestamp.fromDate(new Date(form.dob)) : null,
        location: form.location,
        religion: form.religion,
        caste: form.caste,
        motherTongue: form.motherTongue,
        education: form.education,
        occupation: form.occupation,
        annualIncome: form.annualIncome,
        bio: form.bio,
        phone: form.phone,
        email: user.email || "",
        photoURL: user.photoURL || "",
        preferences: {
          minAge: parseInt(form.prefMinAge) || 22,
          maxAge: parseInt(form.prefMaxAge) || 35,
          religion: form.prefReligion,
          location: form.prefLocation,
        },
      });
      await refreshProfile();
      toast.success("Profile saved! Our team will review it soon.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({
    id, label, type = "text", value, onChange, placeholder,
  }: { id: string; label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-[var(--on-surface-variant)]">{label}</Label>
      <Input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-base sm:text-sm shadow-sm"
      />
    </div>
  );

  const Select = ({
    id, label, value, options, onChange,
  }: { id: string; label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-[var(--on-surface-variant)]">{label}</Label>
      <select
        id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl border border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] px-3 text-base sm:text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all shadow-sm"
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o.toLowerCase()}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 sm:pb-10">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        
        {/* Unified Hero & Photo Section */}
        <div className="bg-gradient-to-r from-[var(--primary-container)]/60 to-[var(--secondary-container)]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-ambient border border-white/50">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary-fixed)]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Photo placeholder */}
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 sm:w-28 sm:h-28 gold-gradient rounded-full flex items-center justify-center text-white text-3xl font-serif font-bold shadow-lg border-4 border-white/80">
                {form.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-[var(--outline-variant)]/50">
                <Camera className="w-4 h-4 text-[var(--primary)]" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)]">
                Your Profile
              </h1>
              <p className="text-[var(--on-surface-variant)] mt-1 mb-4 text-sm sm:text-base">
                A complete profile gets 5x more matches. Let&apos;s make yours stand out!
              </p>
              <Button variant="outline" size="sm" className="rounded-full text-xs border-[var(--outline-variant)]/50 bg-white/50 backdrop-blur-sm" disabled>
                Upload Real Photo
              </Button>
            </div>
          </div>
        </div>

        {/* Section: Basic Info */}
        <div className="bg-[var(--surface-container-low)] rounded-3xl p-6 shadow-sm border border-[var(--outline-variant)]/30 space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--outline-variant)]/20 pb-4 mb-2">
            <div className="p-2 bg-[var(--primary-container)]/50 rounded-lg text-[var(--primary)]">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[var(--on-surface)]">Basic Info</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field id="form-name" label="Full Name *" value={form.name} onChange={(v) => set("name", v)} placeholder="Your full name" />
            <Field id="form-dob" label="Date of Birth" type="date" value={form.dob} onChange={(v) => set("dob", v)} />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[var(--on-surface-variant)]">Gender *</Label>
            <div className="flex gap-3">
              {["male", "female", "other"].map((g) => (
                <button
                  key={g}
                  id={`gender-${g}`}
                  type="button"
                  onClick={() => set("gender", g)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                    form.gender === g
                      ? "gold-gradient text-white border-0 shadow-md"
                      : "border-[var(--outline-variant)]/40 text-[var(--on-surface-variant)] bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container)]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field id="form-location" label="City / Location" value={form.location} onChange={(v) => set("location", v)} placeholder="e.g. Mumbai, Maharashtra" />
            <Field id="form-phone" label="Phone Number" type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+91 XXXXX XXXXX" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Select id="form-religion" label="Religion" value={form.religion} options={religions} onChange={(v) => set("religion", v)} />
            <Field id="form-caste" label="Caste / Community" value={form.caste} onChange={(v) => set("caste", v)} placeholder="e.g. Brahmin, Yadav" />
          </div>

          <Field id="form-mother-tongue" label="Mother Tongue" value={form.motherTongue} onChange={(v) => set("motherTongue", v)} placeholder="e.g. Hindi, Marathi, Tamil" />

          <div className="space-y-1.5">
            <Label htmlFor="form-bio" className="text-sm font-medium text-[var(--on-surface-variant)]">About Me</Label>
            <textarea
              id="form-bio"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Tell potential matches a little about yourself, your hobbies, and values..."
              rows={4}
              className="w-full rounded-xl border border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] px-4 py-3 text-base sm:text-sm text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none shadow-sm"
            />
          </div>
        </div>

        {/* Section: Professional Details */}
        <div className="bg-[var(--surface-container-low)] rounded-3xl p-6 shadow-sm border border-[var(--outline-variant)]/30 space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--outline-variant)]/20 pb-4 mb-2">
            <div className="p-2 bg-[var(--tertiary-container)]/50 rounded-lg text-[var(--tertiary)]">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[var(--on-surface)]">Professional</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field id="form-education" label="Highest Education" value={form.education} onChange={(v) => set("education", v)} placeholder="e.g. B.Tech, MBA, MBBS" />
            <Field id="form-occupation" label="Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} placeholder="e.g. Software Engineer" />
          </div>
          <Select id="form-income" label="Annual Income" value={form.annualIncome} options={incomeRanges} onChange={(v) => set("annualIncome", v)} />
        </div>

        {/* Section: Partner Preferences */}
        <div className="bg-[var(--surface-container-low)] rounded-3xl p-6 shadow-sm border border-[var(--outline-variant)]/30 space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--outline-variant)]/20 pb-4 mb-2">
            <div className="p-2 bg-[var(--secondary-container)]/50 rounded-lg text-[var(--secondary)]">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[var(--on-surface)]">Partner Preferences</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field id="form-pref-min-age" label="Min Age Preference" type="number" value={form.prefMinAge} onChange={(v) => set("prefMinAge", v)} placeholder="22" />
            <Field id="form-pref-max-age" label="Max Age Preference" type="number" value={form.prefMaxAge} onChange={(v) => set("prefMaxAge", v)} placeholder="35" />
          </div>
          <Select id="form-pref-religion" label="Preferred Religion" value={form.prefReligion} options={["Any", ...religions]} onChange={(v) => set("prefReligion", v)} />
          <Field id="form-pref-location" label="Preferred Location" value={form.prefLocation} onChange={(v) => set("prefLocation", v)} placeholder="e.g. Mumbai, Delhi, or Any" />
        </div>

        {/* Desktop Save Actions (Hidden on mobile where sticky bar is used) */}
        <div className="hidden sm:flex gap-4 pt-4">
          <Button
            id="profile-save-btn-desktop"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 gold-gradient text-white rounded-full py-6 text-lg font-semibold shadow-ambient"
          >
            {saving ? "Saving Profile..." : "Save Profile"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="rounded-full border-[var(--outline-variant)]/50 text-[var(--on-surface-variant)] py-6 px-8"
          >
            Cancel
          </Button>
        </div>
      </main>

      {/* Mobile Sticky Save Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[var(--outline-variant)]/30 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="rounded-full border-[var(--outline-variant)]/50 text-[var(--on-surface-variant)] py-6 flex-shrink-0"
          >
            Cancel
          </Button>
          <Button
            id="profile-save-btn-mobile"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 gold-gradient text-white rounded-full py-6 text-base font-semibold shadow-ambient"
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
