"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createUserProfile, getUserProfile } from "@/lib/firestore";
import { toast } from "sonner";
import { User, MapPin, Heart, Briefcase, BookOpen, Users } from "lucide-react";
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
        className="rounded-xl border-[var(--outline-variant)]/40 bg-[var(--surface-container-low)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
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
        className="w-full h-10 rounded-xl border border-[var(--outline-variant)]/40 bg-[var(--surface-container-low)] px-3 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o.toLowerCase()}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 bg-gradient-to-r from-[var(--primary-container)]/40 to-[var(--secondary-container)]/20 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary-fixed)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)] relative">
            Your Profile
          </h1>
          <p className="text-[var(--on-surface-variant)] mt-1 relative">
            Complete your profile to get the best matches
          </p>
        </div>

        <div className="bg-[var(--surface-container-lowest)] rounded-3xl p-6 sm:p-8 shadow-ambient">
          {/* Photo placeholder */}
          <div className="flex items-center gap-5 mb-8 p-4 bg-[var(--surface-container-low)] rounded-2xl">
            <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center text-white text-2xl font-serif font-bold flex-shrink-0">
              {form.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-[var(--on-surface)]">Profile Photo</p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                Photo upload via Cloudinary — coming soon
              </p>
              <Button variant="outline" size="sm" className="mt-2 rounded-full text-xs border-[var(--outline-variant)]/50" disabled>
                Upload Photo
              </Button>
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-[var(--surface-container)]/60 rounded-2xl mb-8 h-auto p-1.5 border border-[var(--outline-variant)]/20">
              {[
                { value: "basic", label: "Basic Info", icon: User },
                { value: "professional", label: "Professional", icon: Briefcase },
                { value: "preferences", label: "Preferences", icon: Heart },
              ].map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
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
                      className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                        form.gender === g
                          ? "gold-gradient text-white border-0"
                          : "border-[var(--outline-variant)]/40 text-[var(--on-surface-variant)] bg-[var(--surface-container-low)]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="form-location" label="City / Location" value={form.location} onChange={(v) => set("location", v)} placeholder="e.g. Mumbai, Maharashtra" />
                <Field id="form-phone" label="Phone Number" type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
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
                  placeholder="Tell potential matches a little about yourself..."
                  rows={4}
                  className="w-full rounded-xl border border-[var(--outline-variant)]/40 bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="form-education" label="Highest Education" value={form.education} onChange={(v) => set("education", v)} placeholder="e.g. B.Tech, MBA, MBBS" />
                <Field id="form-occupation" label="Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} placeholder="e.g. Software Engineer" />
              </div>
              <Select id="form-income" label="Annual Income" value={form.annualIncome} options={incomeRanges} onChange={(v) => set("annualIncome", v)} />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="form-pref-min-age" label="Min Age Preference" type="number" value={form.prefMinAge} onChange={(v) => set("prefMinAge", v)} placeholder="22" />
                <Field id="form-pref-max-age" label="Max Age Preference" type="number" value={form.prefMaxAge} onChange={(v) => set("prefMaxAge", v)} placeholder="35" />
              </div>
              <Select id="form-pref-religion" label="Preferred Religion" value={form.prefReligion} options={["Any", ...religions]} onChange={(v) => set("prefReligion", v)} />
              <Field id="form-pref-location" label="Preferred Location" value={form.prefLocation} onChange={(v) => set("prefLocation", v)} placeholder="e.g. Mumbai, Delhi, or Any" />
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-6 border-t border-[rgba(208,197,175,0.2)] flex gap-3">
            <Button
              id="profile-save-btn"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 gold-gradient text-white rounded-full py-5 text-base font-semibold"
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="rounded-full border-[var(--outline-variant)]/50 text-[var(--on-surface-variant)]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
