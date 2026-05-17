"use client";


import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  MessageCircle, 
  MessageSquare,
  ChevronLeft,
  Crown,
  ShieldCheck,
  Calendar,
  Languages,
  Banknote,
  Info,
  Share2,
  Download,
  EyeOff,
  PhoneOff
} from "lucide-react";
import Image from "next/image";
import InterestButton from "@/components/InterestButton";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";


export default function ProfileViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestStatus, setInterestStatus] = useState<"none" | "sent" | "mutual">("none");



  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await getUserProfile(id as string);
      setProfile(data);
      
      if (user && data) {
        const { getInterestBetween } = await import("@/lib/interests");
        const existing = await getInterestBetween(user.uid, data.uid);
        if (existing) {
          setInterestStatus(existing.status === "accepted" ? "mutual" : "sent");
        } else {
          // Check reverse for mutual
          const reverse = await getInterestBetween(data.uid, user.uid);
          if (reverse && reverse.status === "accepted") setInterestStatus("mutual");
        }
      }
      
      setLoading(false);
    }
    load();
  }, [id, user]);



  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff9f0]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f97316] border-t-transparent" />
        </div>
      </div>
    );
  }


  if (!profile) {
    return (
      <div className="min-h-screen bg-[#fff9f0]">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="bg-white rounded-3xl p-8 shadow-ambient">
            <h1 className="text-2xl font-serif text-[#800000] font-bold mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-8">The profile you are looking for might have been moved or deleted.</p>
            <Button onClick={() => router.push("/matches")} className="gold-gradient text-white rounded-full px-8">
              Back to Matches
            </Button>
          </div>
        </div>
      </div>
    );
  }


  const age = profile.age || (profile.dob ? Math.floor((Date.now() - (profile.dob.toDate ? profile.dob.toDate() : new Date(profile.dob as any)).getTime()) / 31557600000) : 0);

  const isPremiumOrVerified = (userProfile as any)?.isPremium || (userProfile as any)?.status === "approved" || (user as any)?.is_premium;
  const isOwnProfile = user?.uid === profile.uid;
  const showPhotos = !(profile as any).hidePhotos || isPremiumOrVerified || isOwnProfile || interestStatus === "mutual";
  const showContact = !(profile as any).hideContactInfo || isPremiumOrVerified || isOwnProfile || interestStatus === "mutual";


  return (
    <div className="min-h-screen bg-[#fff9f0] pb-20">
      <Navbar />
      
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#3A2D27]/60 hover:text-[#f97316] transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Results
        </button>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Photos & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass rounded-[2rem] overflow-hidden shadow-ambient relative aspect-[4/5] bg-white">
              <Image 
                src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=800&background=f3e8d5&color=800000`}
                alt={profile.name}
                fill
                className={`object-cover ${!showPhotos ? "blur-3xl scale-105 pointer-events-none select-none" : ""}`}
                priority
                loading="eager"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {profile.is_premium && (
                <div className="absolute top-6 right-6 gold-gradient p-2.5 rounded-2xl shadow-lg border border-white/20 z-10">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              )}
              {!showPhotos && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6 text-white z-20 space-y-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg animate-bounce">
                    <EyeOff className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Photo Hidden by User</h3>
                    <p className="text-xs text-white/80 mt-1 max-w-[240px] mx-auto leading-relaxed font-sans">
                      This user has restricted photo visibility. Upgrade to premium or connect with them to view their photos.
                    </p>
                  </div>
                  {!(user as any)?.is_premium && (
                    <Button onClick={() => router.push("/pricing")} className="bg-white text-[#800000] hover:bg-white/90 rounded-full font-bold px-6 shadow-md transition-all font-sans">
                      Upgrade to View
                    </Button>
                  )}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30">
                    {profile.religion} · {profile.caste}
                  </Badge>
                  {profile.status === "approved" && (
                    <Badge className="bg-green-500/20 backdrop-blur-md text-green-100 border-green-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-serif font-bold tracking-tight">{profile.name}, {age}</h1>
                <p className="text-lg text-white/80 font-medium mt-1">{profile.occupation}</p>
              </div>
            </div>


            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#f97316]/5 text-center">
                <Calendar className="w-5 h-5 text-[#f97316] mx-auto mb-2" />
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Age</p>
                <p className="text-sm font-bold text-[#3A2D27]">{age} Yrs</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#f97316]/5 text-center">
                <MapPin className="w-5 h-5 text-[#f97316] mx-auto mb-2" />
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Height</p>
                <p className="text-sm font-bold text-[#3A2D27]">{profile.height || "—"}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#f97316]/5 text-center">
                <Languages className="w-5 h-5 text-[#f97316] mx-auto mb-2" />
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Tongue</p>
                <p className="text-sm font-bold text-[#3A2D27]">{profile.motherTongue || "—"}</p>
              </div>
            </div>


            {/* Action Bar */}
            <div className="flex gap-3 pt-2">
              <InterestButton 
                key={interestStatus}
                toUserId={profile.uid} 
                initialStatus={interestStatus} 
              />


              <Button 
                onClick={() => router.push(`/chat?with=${profile.uid}`)}
                className="flex-1 bg-white border-2 border-[#800000] text-[#800000] hover:bg-red-50 rounded-2xl h-14 font-bold text-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message
              </Button>


              {profile.phone && showContact ? (
                <Button
                  className="w-14 h-14 rounded-2xl bg-[#25D366] text-white hover:bg-[#25D366]/90 shadow-lg animate-pulse"
                  onClick={() => {
                    const text = encodeURIComponent(`Hi ${profile.name}, I found your profile on Izzatdar Parivar and would like to connect.`);
                    window.open(`https://wa.me/${profile.phone.replace(/\D/g, '')}?text=${text}`, '_blank');
                  }}
                  title="Chat on WhatsApp"
                >
                  <MessageSquare className="w-6 h-6" />
                </Button>
              ) : profile.phone ? (
                <Button
                  className="w-14 h-14 rounded-2xl bg-gray-200 text-gray-400 border border-gray-300 shadow-none cursor-not-allowed hover:bg-gray-200"
                  onClick={() => toast.error("Contact details are restricted. Connect or upgrade to premium to contact this user.")}
                  title="Contact info restricted by user"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              ) : null}


              <Button
                variant="outline"
                className="w-14 h-14 rounded-2xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                onClick={async () => {
                  try {
                    const { mapProfileToBiodata } = await import("@/lib/biodata-pdf");
                    const { generateBiodataPDF, downloadBiodataPDF } = await import("@/components/BiodataPDF");
                    // Secure phone and whatsapp if not allowed to show contact info
                    const secureProfile = {
                      ...profile,
                      phone: showContact ? profile.phone : "Restricted",
                      whatsapp: showContact ? profile.whatsapp : "Restricted",
                    };
                    const biodata = mapProfileToBiodata(secureProfile);
                    const blob = await generateBiodataPDF(biodata);
                    downloadBiodataPDF(blob, profile.name.replace(/\s+/g, '_'));
                  } catch (err) {
                    console.error("PDF Generation failed:", err);
                  }
                }}
                title="Download PDF Biodata"
              >
                <Download className="w-6 h-6" />
              </Button>


              <Button
                variant="outline"
                className="w-14 h-14 rounded-2xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50"
                onClick={() => {
                  const summary = `${profile.name}, ${age} years, ${profile.occupation} from ${profile.location}. ${profile.religion} ${profile.caste}.`;
                  const text = encodeURIComponent(`*Izzatdar Parivar Profile Summary*\n\n*Name:* ${profile.name}\n*Age:* ${age}\n*Profession:* ${profile.occupation}\n*Location:* ${profile.location}\n*Background:* ${profile.religion} ${profile.caste}\n\nView full profile here: ${window.location.href}`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
                title="Share via WhatsApp"
              >
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </div>


          {/* Right Column: Detailed Info */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* About Section */}
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#f97316]/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Heart className="w-32 h-32 text-[#800000]" />
               </div>
               <h2 className="text-2xl font-serif text-[#800000] font-bold mb-6 flex items-center gap-2">
                 <Info className="w-6 h-6" /> About {profile.name}
               </h2>
               <p className="text-lg text-[#3A2D27]/80 leading-relaxed font-medium italic">
                 &ldquo;{profile.bio || "No bio provided."}&rdquo;
               </p>
               {profile.tagline && (
                 <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100/50">
                    <p className="text-orange-700 font-bold text-sm">✨ {profile.tagline}</p>
                 </div>
               )}
            </section>


            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Education & Career */}
              <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#f97316]/5">
                <h3 className="text-xl font-serif text-[#800000] font-bold mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" /> Career & Education
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Education</p>
                    <p className="font-bold text-[#3A2D27]">{profile.education || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Occupation</p>
                    <p className="font-bold text-[#3A2D27]">{profile.occupation || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Annual Income</p>
                    <p className="font-bold text-[#3A2D27] flex items-center gap-1">
                      <Banknote className="w-4 h-4 text-green-600" /> {profile.annualIncome || "Private"}
                    </p>
                  </div>
                </div>
              </section>


              {/* Lifestyle & Background */}
              <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#f97316]/5">
                <h3 className="text-xl font-serif text-[#800000] font-bold mb-6 flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5" /> Lifestyle
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Marital Status</p>
                    <p className="font-bold text-[#3A2D27]">{profile.maritalStatus || "Never Married"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Diet</p>
                    <p className="font-bold text-[#3A2D27]">{profile.diet || "Vegetarian"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Lifestyle</p>
                    <p className="font-bold text-[#3A2D27]">{profile.lifestyle || "Traditional"}</p>
                  </div>
                </div>
              </section>
            </div>


            {/* Family Section */}
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#f97316]/5">
               <h3 className="text-xl font-serif text-[#800000] font-bold mb-4 flex items-center gap-2">
                 🏘️ Family Background
               </h3>
               <p className="text-[#3A2D27]/70 leading-relaxed font-medium">
                 {profile.aboutFamily || "Detailed family information is available upon request."}
               </p>
               <div className="mt-6 flex flex-wrap gap-2">
                 <Badge variant="outline" className="rounded-xl px-4 py-1.5 border-[#f97316]/20 bg-orange-50/30">
                    Family Type: {profile.familyType || "Nuclear"}
                 </Badge>
                 {profile.gotra && (
                   <Badge variant="outline" className="rounded-xl px-4 py-1.5 border-[#f97316]/20 bg-orange-50/30">
                     Gotra: {profile.gotra}
                   </Badge>
                 )}
               </div>
            </section>


            {/* Hobbies Section */}
            {profile.hobbies && profile.hobbies.length > 0 && (
              <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#f97316]/5">
                 <h3 className="text-xl font-serif text-[#800000] font-bold mb-6 flex items-center gap-2">
                   🎨 Interests & Hobbies
                 </h3>
                 <div className="flex flex-wrap gap-3">
                   {profile.hobbies.map((hobby, i) => (
                     <span key={i} className="px-5 py-2.5 bg-gray-50 rounded-2xl text-sm font-bold text-[#3A2D27]/80 border border-gray-100">
                       {hobby}
                     </span>
                   ))}
                 </div>
              </section>
            )}


            {/* Contact Security Note */}
            <div className="p-6 bg-[#800000] rounded-3xl text-white flex items-center gap-4">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                 <p className="font-bold">Contact Privacy Protected</p>
                 <p className="text-xs text-white/70">Phone numbers and emails are only visible to verified premium members.</p>
               </div>
               {!(user as any)?.is_premium && (
                 <Button onClick={() => router.push("/pricing")} className="ml-auto bg-white text-[#800000] hover:bg-white/90 rounded-full font-bold px-6">
                   Upgrade
                 </Button>
               )}
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
