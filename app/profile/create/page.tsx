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
import { User, Heart, Briefcase, Camera, Users, Sparkles, X, Plus, Trash2 } from "lucide-react";
import { uploadImageAction } from "@/app/actions/cloudinary";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { sanitizeBio, sanitizeProfileData } from "@/lib/sanitize";


interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  height: string;
  maritalStatus: string;
  location: string;
  religion: string;
  caste: string;
  motherTongue: string;
  education: string;
  occupation: string;
  annualIncome: string;
  bio: string;
  phone: string;
  countryCode: string;
  familyType: string;
  diet: string;
  lifestyle: string;
  aboutFamily: string;
  gotra: string;
  prefMinAge: string;
  prefMaxAge: string;
  prefReligion: string;
  prefLocation: string;
  photos: string[];
  whatsapp: string;
}


const religions = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi", "Jewish", "Other"];
const incomeRanges = ["Below ₹2L", "₹2L–5L", "₹5L–10L", "₹10L–20L", "₹20L–50L", "₹50L+"];
const maritalStatuses = ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"];
const familyTypes = ["Nuclear", "Joint", "Other"];
const dietOptions = ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian"];
const lifestyleOptions = ["Traditional", "Moderate", "Liberal"];
const heightOptions = (() => {
  const heights: string[] = [];
  for (let ft = 4; ft <= 6; ft++) {
    for (let inch = 0; inch <= 11; inch++) {
      if (ft === 6 && inch > 6) break;
      heights.push(`${ft}'${inch}"`);
    }
  }
  return heights;
})();


const PRESET_HOBBIES = [
  "🎵 Music", "📚 Reading", "✈️ Traveling", "🍳 Cooking", "🏋️ Fitness",
  "🎬 Movies", "📷 Photography", "🎨 Art & Painting", "🧘 Yoga & Meditation",
  "🎮 Gaming", "💃 Dancing", "⚽ Sports", "🌱 Gardening", "✍️ Writing",
  "🎸 Playing Instruments", "🐾 Pet Lover", "🚗 Road Trips", "☕ Chai & Conversations",
];


const compressAndResizeImage = (file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context is null"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL("image/jpeg", quality);
      resolve(base64);
    };
    img.onerror = (err) => reject(err);
  });
};


export default function CreateProfilePage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState("");
  const [form, setForm] = useState<FormData>({
    firstName: "", middleName: "", lastName: "",
    gender: "", dob: "", height: "", maritalStatus: "",
    location: "", religion: "", caste: "",
    motherTongue: "", education: "", occupation: "", annualIncome: "", bio: "",
    phone: "", countryCode: "+91", familyType: "", diet: "", lifestyle: "", aboutFamily: "",
    gotra: "",
    prefMinAge: "22", prefMaxAge: "35", prefReligion: "", prefLocation: "", photos: [],
    whatsapp: "",
  });


  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    getUserProfile(user.uid).then((p) => {
      if (p) {
        setForm((prev) => ({
          ...prev,
          firstName: p.firstName || p.name?.split(" ")[0] || "",
          middleName: p.middleName || "",
          lastName: p.lastName || p.name?.split(" ").slice(1).join(" ") || "",
          gender: p.gender || "",
          height: p.height || "",
          maritalStatus: p.maritalStatus || "",
          location: p.location || "",
          religion: p.religion || "",
          caste: p.caste || "",
          motherTongue: p.motherTongue || "",
          education: p.education || "",
          occupation: p.occupation || "",
          annualIncome: p.annualIncome || "",
          bio: p.bio || "",
          phone: p.phone?.replace(/^\+\d+\s?/, "") || "",
          whatsapp: p.whatsapp?.replace(/^\+\d+\s?/, "") || "",
          countryCode: p.phone?.match(/^\+\d+/)?.[0] || "+91",
          familyType: p.familyType || "",
          diet: p.diet || "",
          lifestyle: p.lifestyle || "",
          photos: p.photos || (p.photoURL ? [p.photoURL] : []),
          aboutFamily: p.aboutFamily || "",
          gotra: p.gotra || "",
          prefMinAge: String(p.preferences?.minAge || 22),
          prefMaxAge: String(p.preferences?.maxAge || 35),
          prefReligion: p.preferences?.religion || "",
          prefLocation: p.preferences?.location || "",
          dob: p.dob
            ? (() => {
                try {
                  const dateObj = (p.dob as any).toDate
                    ? (p.dob as any).toDate()
                    : (p.dob as any).seconds
                    ? new Date((p.dob as any).seconds * 1000)
                    : new Date(p.dob as any);
                  return dateObj.toISOString().split("T")[0];
                } catch (e) {
                  console.error("Error parsing DOB:", e);
                  return "";
                }
              })()
            : "",
        }));
        if (p.hobbies) setSelectedHobbies(p.hobbies);
      }
    });
  }, [user, router]);


  const set = (key: keyof FormData, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));


  const computedName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");


  const handleSave = async () => {
    if (!user) return;
    if (!form.firstName || !form.gender) {
      toast.error("First name and gender are required");
      return;
    }
    setSaving(true);
    try {
      const rawData = {
        uid: user.uid,
        name: computedName,
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        gender: form.gender as "male" | "female" | "other",
        dob: form.dob ? Timestamp.fromDate(new Date(form.dob)) : null,
        height: form.height,
        maritalStatus: form.maritalStatus,
        location: form.location,
        religion: form.religion,
        caste: form.caste,
        motherTongue: form.motherTongue,
        education: form.education,
        occupation: form.occupation,
        annualIncome: form.annualIncome,
        phone: `${form.countryCode} ${form.phone.replace(/\s/g, "")}`,
        whatsapp: form.whatsapp ? `${form.countryCode} ${form.whatsapp.replace(/\s/g, "")}` : "",
        email: user.email || "",
        photos: form.photos,
        familyType: form.familyType,
        diet: form.diet,
        lifestyle: form.lifestyle,
        gotra: form.gotra,
        hobbies: selectedHobbies,
        preferences: {
          minAge: parseInt(form.prefMinAge) || 22,
          maxAge: parseInt(form.prefMaxAge) || 35,
          religion: form.prefReligion,
          location: form.prefLocation,
        },
      };
      const sanitizedData = sanitizeProfileData(rawData);

      await createUserProfile(user.uid, {
        ...sanitizedData,
        bio: sanitizeBio(form.bio),
        aboutFamily: sanitizeBio(form.aboutFamily),
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


  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 sm:pb-10">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
       
        {/* Unified Hero & Photo Section */}
        <div className="bg-gradient-to-r from-[var(--primary-container)]/60 to-[var(--secondary-container)]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-ambient border border-white/50">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary-fixed)]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
         
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 w-full">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-[var(--on-surface)]">
                    Your Photos
                  </h1>
                  <p className="text-[var(--on-surface-variant)] mt-1 text-sm sm:text-base">
                    Add up to 6 pictures. ({form.photos.length}/6)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={form.photos.length >= 6}
                  className="rounded-full text-xs border-[var(--outline-variant)]/50 bg-white/50 backdrop-blur-sm"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Photo
                </Button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <AnimatePresence>
                  {form.photos.map((photo, index) => (
                    <motion.div
                      key={photo}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="relative aspect-square rounded-xl overflow-hidden shadow-sm group border border-white/50"
                    >
                      <Image src={photo} alt={`Profile ${index + 1}`} fill sizes="100px" className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => set("photos", form.photos.filter(p => p !== photo) as any)}
                          className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {form.photos.length < 6 && (
                    <motion.div
                      layout
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      className="relative aspect-square rounded-xl overflow-hidden shadow-inner bg-[var(--surface-container-lowest)] border-2 border-dashed border-[var(--outline-variant)]/40 hover:border-[var(--primary)]/50 hover:bg-[var(--primary-container)]/10 cursor-pointer flex items-center justify-center transition-all group"
                    >
                      <Camera className="w-6 h-6 text-[var(--on-surface-variant)]/50 group-hover:text-[var(--primary)] transition-colors" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (form.photos.length >= 6) {
                    toast.error("Maximum 6 photos allowed");
                    return;
                  }
                 
                  const toastId = toast.loading("Compressing and uploading photo...");
                  
                  try {
                    const base64 = await compressAndResizeImage(file);
                    
                    // 1. Try Cloudinary via secure signature
                    const sigRes = await fetch("/api/upload", { method: "POST" });
                    const sigData = await sigRes.json();
                    
                    if (sigRes.ok && sigData.signature) {
                      const uploadFormData = new FormData();
                      uploadFormData.append("file", base64);
                      uploadFormData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
                      uploadFormData.append("timestamp", sigData.timestamp);
                      uploadFormData.append("signature", sigData.signature);
                      uploadFormData.append("folder", `profiles/${user?.uid}`);
                      
                      const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                        method: "POST",
                        body: uploadFormData
                      });
                      const cldData = await cldRes.json();
                      
                      if (cldRes.ok && cldData.secure_url) {
                        setForm(prev => ({ ...prev, photos: [...prev.photos, cldData.secure_url] }));
                        toast.success("Photo uploaded successfully!", { id: toastId });
                        return;
                      }
                    }
                    
                    console.warn("Cloudinary direct upload failed. Falling back to Server Action.");

                    const res = await uploadImageAction(base64);
                    if (res.success && res.url) {
                      setForm(prev => ({ ...prev, photos: [...prev.photos, res.url!] }));
                      toast.success("Photo uploaded successfully!", { id: toastId });
                      return;
                    }
                    
                    throw new Error("Upload failed in both pipelines");
                  } catch (err: any) {
                    console.error("Upload failed:", err);
                    toast.error("Photo upload failed. Please try again.", { id: toastId });
                  }
                }}
              />
            </div>
          </div>
        </div>


        {/* Section: Personal Details */}
        <div className="bg-[var(--surface-container-low)] rounded-3xl p-6 shadow-sm border border-[var(--outline-variant)]/30 space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--outline-variant)]/20 pb-4 mb-2">
            <div className="p-2 bg-[var(--primary-container)]/50 rounded-lg text-[var(--primary)]">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[var(--on-surface)]">Personal Details</h2>
          </div>


          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            <Field id="form-first-name" label="First Name *" value={form.firstName} onChange={(v) => set("firstName", v)} placeholder="e.g. Rahul" />
            <Field id="form-middle-name" label="Middle Name" value={form.middleName} onChange={(v) => set("middleName", v)} placeholder="(optional)" />
            <Field id="form-last-name" label="Last Name" value={form.lastName} onChange={(v) => set("lastName", v)} placeholder="e.g. Sharma" />
          </div>


          <div className="grid sm:grid-cols-2 gap-5">
            <Field id="form-dob" label="Date of Birth" type="date" value={form.dob} onChange={(v) => set("dob", v)} />
            <Field
              id="form-height"
              label="Height (e.g. 5.6)"
              value={form.height}
              placeholder="Enter height (e.g. 5.10)"
              onChange={(v) => {
                // Auto-format 5.6 -> 5'6''
                let formatted = v.replace(/[^0-9.]/g, "");
                if (formatted.includes(".") && !v.includes("'")) {
                  const parts = formatted.split(".");
                  if (parts[0] && parts[1]) {
                    formatted = `${parts[0]}'${parts[1]}''`;
                  }
                }
                set("height", formatted);
              }}
            />
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
            <Select id="form-marital" label="Marital Status" value={form.maritalStatus} options={maritalStatuses} onChange={(v) => set("maritalStatus", v)} />
            <Field id="form-location" label="City / Location" value={form.location} onChange={(v) => set("location", v)} placeholder="e.g. Mumbai, Maharashtra" />
          </div>


          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[var(--on-surface-variant)]">Phone Number</Label>
              <div className="flex gap-2">
                <div className="w-24">
                  <Input
                    value={form.countryCode}
                    onChange={(e) => set("countryCode", e.target.value)}
                    placeholder="+91"
                    className="h-12 rounded-xl border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] text-center font-medium"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={form.phone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 5) {
                        val = val.slice(0, 5) + " " + val.slice(5, 10);
                      }
                      set("phone", val);
                    }}
                    placeholder="XXXXX XXXXX"
                    className="h-12 rounded-xl border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] tracking-widest font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[var(--on-surface-variant)]">WhatsApp Number (Optional)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 5) {
                        val = val.slice(0, 5) + " " + val.slice(5, 10);
                      }
                      set("whatsapp", val);
                    }}
                    placeholder="Same as phone or different"
                    className="h-12 rounded-xl border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] tracking-widest font-medium"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[var(--on-surface-variant)]/60 italic">If different from your phone number</p>
            </div>
          </div>


          <div className="grid sm:grid-cols-2 gap-5">
            <Select id="form-religion" label="Religion" value={form.religion} options={religions} onChange={(v) => set("religion", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field id="form-caste" label="Caste" value={form.caste} onChange={(v) => set("caste", v)} placeholder="e.g. Brahmin" />
              <Field id="form-gotra" label="Gotra" value={form.gotra} onChange={(v) => set("gotra", v)} placeholder="e.g. Kashyap" />
            </div>
          </div>


          <Field id="form-mother-tongue" label="Mother Tongue" value={form.motherTongue} onChange={(v) => set("motherTongue", v)} placeholder="e.g. Hindi, Marathi, Tamil" />


          <div className="space-y-1.5">
            <Label htmlFor="form-bio" className="text-sm font-medium text-[var(--on-surface-variant)]">About Me</Label>
            <textarea
              id="form-bio"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Tell potential matches about yourself, your hobbies, values, and what you're looking for..."
              rows={4}
              className="w-full rounded-xl border border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] px-4 py-3 text-base sm:text-sm text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none shadow-sm"
            />
          </div>
        </div>


        {/* Section: Family & Lifestyle */}
        <div className="bg-[var(--surface-container-low)] rounded-3xl p-6 shadow-sm border border-[var(--outline-variant)]/30 space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--outline-variant)]/20 pb-4 mb-2">
            <div className="p-2 bg-[var(--primary-container)]/50 rounded-lg text-[var(--primary)]">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[var(--on-surface)]">Family &amp; Lifestyle</h2>
          </div>


          <div className="grid sm:grid-cols-3 gap-5">
            <Select id="form-family-type" label="Family Type" value={form.familyType} options={familyTypes} onChange={(v) => set("familyType", v)} />
            <Select id="form-diet" label="Diet" value={form.diet} options={dietOptions} onChange={(v) => set("diet", v)} />
            <Select id="form-lifestyle" label="Lifestyle" value={form.lifestyle} options={lifestyleOptions} onChange={(v) => set("lifestyle", v)} />
          </div>


          <div className="space-y-1.5">
            <Label htmlFor="form-about-family" className="text-sm font-medium text-[var(--on-surface-variant)]">About Family</Label>
            <textarea
              id="form-about-family"
              value={form.aboutFamily}
              onChange={(e) => set("aboutFamily", e.target.value)}
              placeholder="Briefly describe your family background, values, and what's important to your family..."
              rows={3}
              className="w-full rounded-xl border border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] px-4 py-3 text-base sm:text-sm text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none shadow-sm"
            />
          </div>
        </div>


        {/* Section: Hobbies & Interests */}
        <div className="bg-[var(--surface-container-low)] rounded-3xl p-6 shadow-sm border border-[var(--outline-variant)]/30 space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--outline-variant)]/20 pb-4 mb-2">
            <div className="p-2 bg-[var(--secondary-container)]/50 rounded-lg text-[var(--secondary)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[var(--on-surface)]">Hobbies &amp; Interests</h2>
            <span className="ml-auto text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container)] px-2 py-0.5 rounded-full">
              {selectedHobbies.length} selected
            </span>
          </div>


          {/* Preset hobby tags */}
          <div className="flex flex-wrap gap-2">
            {PRESET_HOBBIES.map((hobby) => {
              const isSelected = selectedHobbies.includes(hobby);
              return (
                <button
                  key={hobby}
                  type="button"
                  onClick={() => {
                    setSelectedHobbies((prev) =>
                      isSelected ? prev.filter((h) => h !== hobby) : [...prev, hobby]
                    );
                  }}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isSelected
                      ? "gold-gradient text-white border-transparent shadow-sm scale-[1.03]"
                      : "bg-[var(--surface-container-lowest)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]/30 hover:border-[var(--primary)]/40 hover:bg-[var(--primary-container)]/20"
                  }`}
                >
                  {hobby}
                </button>
              );
            })}
          </div>


          {/* Custom hobby input */}
          <div className="flex gap-2">
            <Input
              id="form-custom-hobby"
              value={customHobby}
              onChange={(e) => setCustomHobby(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const tag = customHobby.trim();
                  if (tag && !selectedHobbies.includes(tag)) {
                    setSelectedHobbies((prev) => [...prev, tag]);
                    setCustomHobby("");
                  }
                }
              }}
              placeholder="Add your own hobby..."
              className="h-11 rounded-full border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] text-sm flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const tag = customHobby.trim();
                if (tag && !selectedHobbies.includes(tag)) {
                  setSelectedHobbies((prev) => [...prev, tag]);
                  setCustomHobby("");
                }
              }}
              className="w-11 h-11 rounded-full bg-[var(--primary-container)] text-[var(--primary)] flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>


          {/* Selected hobbies preview */}
          {selectedHobbies.length > 0 && (
            <div className="pt-3 border-t border-[var(--outline-variant)]/20">
              <Label className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2 block">Your hobbies preview</Label>
              <div className="flex flex-wrap gap-2">
                {selectedHobbies.map((hobby) => (
                  <span
                    key={hobby}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-container)]/40 text-[var(--on-primary-container)] text-xs font-medium rounded-full border border-[var(--primary)]/20"
                  >
                    {hobby}
                    <button
                      type="button"
                      onClick={() => setSelectedHobbies((prev) => prev.filter((h) => h !== hobby))}
                      className="w-4 h-4 rounded-full bg-[var(--on-primary-container)]/10 hover:bg-[var(--on-primary-container)]/20 flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
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


        {/* Desktop Save Actions */}
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
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-xl pointer-events-none group-hover:from-[var(--primary)]/10 group-hover:to-[var(--secondary)]/10 transition-all" />
      <select
        id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl border border-[var(--outline-variant)]/40 bg-transparent px-3 text-base sm:text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all shadow-sm relative z-10 appearance-none"
      >
        <option value="" className="bg-white">Select...</option>
        {options.map((o) => <option key={o} value={o.toLowerCase()} className="bg-white">{o}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20">
        <svg className="w-4 h-4 text-[var(--on-surface-variant)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);



