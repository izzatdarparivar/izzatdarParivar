"use client";


import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getFamilyProfile,
  createFamilyProfile,
  updateFamilyProfile,
  FamilyProfile,
  FamilyMember,
} from "@/lib/family-profile";


export default function FamilyPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);


  const [formData, setFormData] = useState({
    familyType: "nuclear" as FamilyProfile["familyType"],
    familyValues: [] as string[],
    siblings: 0,
    familyMembers: [] as FamilyMember[],
    fatherOccupation: "",
    motherOccupation: "",
    familyBio: "",
    ancestralOrigin: "",
    familyTraditions: [] as string[],
  });


  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);


  async function loadProfile() {
    if (!user) return;
    try {
      const data = await getFamilyProfile(user.uid);
      if (data) {
        setProfile(data);
        setFormData({
          familyType: data.familyType,
          familyValues: data.familyValues || [],
          siblings: data.siblings || 0,
          familyMembers: data.familyMembers || [],
          fatherOccupation: data.fatherOccupation || "",
          motherOccupation: data.motherOccupation || "",
          familyBio: data.familyBio || "",
          ancestralOrigin: data.ancestralOrigin || "",
          familyTraditions: data.familyTraditions || [],
        });
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }


  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      if (profile) {
        await updateFamilyProfile(user.uid, formData);
      } else {
        await createFamilyProfile(user.uid, formData);
      }
      await loadProfile();
      setEditing(false);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  }


  function addFamilyMember() {
    setFormData((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { name: "", relation: "", occupation: "" }],
    }));
  }


  function removeFamilyMember(index: number) {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
    }));
  }


  function updateMember(index: number, field: keyof FamilyMember, value: string | number) {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  }


  const FAMILY_VALUES = [
    "Traditional", "Modern", "Religious", "Liberal", "Conservative",
    "Education-focused", "Business-oriented", "Service-oriented",
  ];


  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f97316] border-t-transparent" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#fff9f0] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-[#800000]">Family Profile</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="gold-gradient text-white px-6 py-2 rounded-full">
              {profile ? "Edit" : "Create"}
            </button>
          )}
        </div>


        {editing ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            {/* Family Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Family Type</label>
              <select
                value={formData.familyType}
                onChange={(e) => setFormData((p) => ({ ...p, familyType: e.target.value as any }))}
                className="w-full p-3 border rounded-xl"
              >
                <option value="nuclear">Nuclear</option>
                <option value="joint">Joint</option>
                <option value="extended">Extended</option>
              </select>
            </div>


            {/* Family Values */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Family Values</label>
              <div className="flex flex-wrap gap-2">
                {FAMILY_VALUES.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        familyValues: p.familyValues.includes(val)
                          ? p.familyValues.filter((v) => v !== val)
                          : [...p.familyValues, val],
                      }))
                    }
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      formData.familyValues.includes(val)
                        ? "bg-[#f97316] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>


            {/* Parents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father&apos;s Occupation</label>
                <input
                  type="text"
                  value={formData.fatherOccupation}
                  onChange={(e) => setFormData((p) => ({ ...p, fatherOccupation: e.target.value }))}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother&apos;s Occupation</label>
                <input
                  type="text"
                  value={formData.motherOccupation}
                  onChange={(e) => setFormData((p) => ({ ...p, motherOccupation: e.target.value }))}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
            </div>


            {/* Siblings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Siblings</label>
              <input
                type="number"
                min={0}
                value={formData.siblings}
                onChange={(e) => setFormData((p) => ({ ...p, siblings: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border rounded-xl"
              />
            </div>


            {/* Family Members */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Family Members</label>
                <button type="button" onClick={addFamilyMember} className="text-[#f97316] text-sm font-medium">
                  + Add Member
                </button>
              </div>
              {formData.familyMembers.map((member, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => updateMember(idx, "name", e.target.value)}
                    className="flex-1 p-2 border rounded-lg text-sm"
                  />
                  <input
                    placeholder="Relation"
                    value={member.relation}
                    onChange={(e) => updateMember(idx, "relation", e.target.value)}
                    className="flex-1 p-2 border rounded-lg text-sm"
                  />
                  <input
                    placeholder="Occupation"
                    value={member.occupation || ""}
                    onChange={(e) => updateMember(idx, "occupation", e.target.value)}
                    className="flex-1 p-2 border rounded-lg text-sm"
                  />
                  <button onClick={() => removeFamilyMember(idx)} className="text-red-500 px-2">x</button>
                </div>
              ))}
            </div>


            {/* Family Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Your Family</label>
              <textarea
                value={formData.familyBio}
                onChange={(e) => setFormData((p) => ({ ...p, familyBio: e.target.value }))}
                className="w-full p-3 border rounded-xl h-32 resize-none"
                maxLength={500}
              />
            </div>


            {/* Ancestral Origin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ancestral Origin</label>
              <input
                type="text"
                value={formData.ancestralOrigin}
                onChange={(e) => setFormData((p) => ({ ...p, ancestralOrigin: e.target.value }))}
                className="w-full p-3 border rounded-xl"
                placeholder="e.g., Rajasthan, Punjab"
              />
            </div>


            {/* Save/Cancel */}
            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} disabled={saving} className="gold-gradient text-white px-6 py-3 rounded-full disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="px-6 py-3 border rounded-full text-gray-600">
                Cancel
              </button>
            </div>
          </div>
        ) : profile ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-gray-500">Family Type</span><p className="font-medium capitalize">{profile.familyType}</p></div>
              <div><span className="text-sm text-gray-500">Siblings</span><p className="font-medium">{profile.siblings}</p></div>
              <div><span className="text-sm text-gray-500">Father</span><p className="font-medium">{profile.fatherOccupation || "—"}</p></div>
              <div><span className="text-sm text-gray-500">Mother</span><p className="font-medium">{profile.motherOccupation || "—"}</p></div>
            </div>
            {profile.familyBio && (
              <div><span className="text-sm text-gray-500">About Family</span><p className="mt-1">{profile.familyBio}</p></div>
            )}
            {profile.familyValues.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Values</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.familyValues.map((v) => (
                    <span key={v} className="px-3 py-1 bg-orange-50 text-[#f97316] rounded-full text-sm">{v}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500 mb-4">No family profile created yet</p>
            <button onClick={() => setEditing(true)} className="gold-gradient text-white px-6 py-3 rounded-full">
              Create Family Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

