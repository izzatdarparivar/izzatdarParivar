"use client";


import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


type Step = 1 | 2 | 3;


export default function QuickSignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    name: "",
    age: "",
    gender: "",
  });


  async function handleStep1() {
    if (!formData.phone || formData.phone.length < 10) {
      setError("Enter a valid phone number");
      return;
    }
    // In production, this would trigger OTP via Firebase Phone Auth
    setStep(2);
    setError("");
  }


  async function handleStep2() {
    if (!formData.name || !formData.age || !formData.gender) {
      setError("Please fill all fields");
      return;
    }
    setStep(3);
    setError("");
  }


  async function handleStep3() {
    setLoading(true);
    setError("");
    try {
      // Create account with phone auth + basic profile
      await signUp(`${formData.phone}@phone.izzatdarparivar.com`, formData.phone + "pass", formData.name);
      router.push("/profile/edit");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${s <= step ? "bg-[#f97316]" : "bg-gray-200"}`}
            />
          ))}
        </div>


        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-serif text-[#800000] mb-2">Welcome</h1>
              <p className="text-gray-500 mb-6">Enter your phone number to get started</p>
              <div className="flex gap-2 mb-4">
                <span className="flex items-center px-3 bg-gray-100 rounded-xl text-sm">+91</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                  placeholder="9876543210"
                  className="flex-1 p-3 border rounded-xl text-lg tracking-wider"
                  maxLength={10}
                />
              </div>
              <button onClick={handleStep1} className="w-full gold-gradient text-white py-3 rounded-full font-medium">
                Get OTP
              </button>
            </>
          )}


          {step === 2 && (
            <>
              <h1 className="text-2xl font-serif text-[#800000] mb-2">Basic Details</h1>
              <p className="text-gray-500 mb-6">Tell us about yourself</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Full Name"
                  className="w-full p-3 border rounded-xl"
                />
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData((p) => ({ ...p, age: e.target.value }))}
                  placeholder="Age"
                  className="w-full p-3 border rounded-xl"
                  min={18}
                  max={70}
                />
                <div className="flex gap-3">
                  {["Male", "Female"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData((p) => ({ ...p, gender: g }))}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        formData.gender === g ? "bg-[#f97316] text-white" : "border text-gray-600"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleStep2} className="w-full gold-gradient text-white py-3 rounded-full font-medium mt-6">
                Continue
              </button>
            </>
          )}


          {step === 3 && (
            <>
              <h1 className="text-2xl font-serif text-[#800000] mb-2">Almost Done!</h1>
              <p className="text-gray-500 mb-6">Review your details</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-6">
                <p><span className="text-gray-500">Name:</span> {formData.name}</p>
                <p><span className="text-gray-500">Age:</span> {formData.age}</p>
                <p><span className="text-gray-500">Gender:</span> {formData.gender}</p>
                <p><span className="text-gray-500">Phone:</span> +91 {formData.phone}</p>
              </div>
              <button
                onClick={handleStep3}
                disabled={loading}
                className="w-full gold-gradient text-white py-3 rounded-full font-medium disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </>
          )}


          {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}


          {step > 1 && (
            <button onClick={() => setStep((s) => (s - 1) as Step)} className="w-full text-gray-500 text-sm mt-4">
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

