"use client";


import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  Star,
  Users,
  CheckCircle,
  ArrowRight,
  Crown,
  Phone,
  MessageCircle,
  UserPlus,
  Search,
  MessageSquareHeart,
  Info,
  ShieldCheck,
  FileText,
  Mail
} from "lucide-react";
import ProfileCard from "@/components/ProfileCard";


const stats = [
  { value: "50,000+", label: "Registered Profiles" },
  { value: "12,000+", label: "Successful Matches" },
  { value: "150+", label: "Cities Covered" },
  { value: "4.9★", label: "User Rating" },
];


const howItWorks = [
  {
    icon: UserPlus,
    title: "1. Create Profile",
    description: "Sign up and build an authentic profile for you or your family member.",
  },
  {
    icon: Search,
    title: "2. Browse Matches",
    description: "Explore verified, compatible profiles that share your core values.",
  },
  {
    icon: MessageSquareHeart,
    title: "3. Connect with Families",
    description: "Reach out with dignity and take the next step together.",
  },
];


const testimonials = [
  {
    name: "Priya & Arjun",
    location: "Mumbai, Maharashtra",
    text: "We found each other on Izzatdar Parivar. The verified profiles gave us confidence, and the process was so dignified.",
    initials: "PA",
  },
  {
    name: "Sunita & Rahul",
    location: "Jaipur, Rajasthan",
    text: "Our families are very traditional. This platform understood our values and helped us find the perfect match.",
    initials: "SR",
  },
  {
    name: "Meera & Kiran",
    location: "Bengaluru, Karnataka",
    text: "Premium membership was worth every rupee. Direct contact details made it so much easier to connect.",
    initials: "MK",
  },
];


// Sample Profile Previews for the frontpage
const previewProfiles = [
  {
    uid: "dummy1",
    name: "Rahul S.",
    age: 28,
    gender: "male",
    location: "Delhi",
    occupation: "Software Engineer",
    photoURL: "https://ui-avatars.com/api/?name=Rahul+S&background=f97316&color=fff",
    is_premium: true,
  },
  {
    uid: "dummy2",
    name: "Poooja M.",
    age: 26,
    gender: "female",
    location: "Mumbai",
    occupation: "Doctor",
    photoURL: "https://ui-avatars.com/api/?name=Pooja+M&background=800000&color=fff",
    is_premium: false,
  },
  {
    uid: "dummy3",
    name: "Vikram R.",
    age: 30,
    gender: "male",
    location: "Bangalore",
    occupation: "Entrepreneur",
    photoURL: "https://ui-avatars.com/api/?name=Vikram+R&background=f97316&color=fff",
    is_premium: true,
  },
  {
    uid: "dummy4",
    name: "Neha K.",
    age: 27,
    gender: "female",
    location: "Pune",
    occupation: "Marketing Head",
    photoURL: "https://ui-avatars.com/api/?name=Neha+K&background=800000&color=fff",
    is_premium: false,
  }
];

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!loading && user) {
      router.push("/matches");
    }
  }, [user, loading, router]);


  if (loading) return null;


  return (

    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />


      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-fixed)]/30 via-[var(--background)] to-[var(--secondary-container)]/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--primary-container)]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--secondary-container)]/20 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4" />


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <Badge className="mb-6 bg-[var(--primary-fixed)] text-[var(--on-primary-container)] border-0 font-medium text-sm px-4 py-1.5 rounded-full">
              ✨ Growing among families across India
            </Badge>


            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--on-surface)] leading-[1.1] tracking-tight mb-6">
              Find Your Life Partner <br /> Built on <span className="text-[var(--primary)]">Trust</span>
            </h1>


            <p className="text-lg sm:text-xl text-[var(--on-surface-variant)] leading-relaxed max-w-xl mb-10">
              A premium, secure platform connecting genuine Indian families. Create your profile with confidence and discover matches that align with your values.
            </p>


            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {user ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="gold-gradient text-white rounded-full px-8 py-6 text-base font-semibold shadow-ambient hover:opacity-90 transition-opacity"
                  >
                    <Link href="/dashboard" id="hero-dashboard-btn">
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 py-6 text-base font-semibold border-[var(--outline-variant)] text-[var(--primary)] hover:bg-[var(--surface-container-low)]"
                  >
                    <Link href="/matches" id="hero-browse-btn">
                      Find Matches
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="gold-gradient text-white rounded-full px-8 py-6 text-base font-semibold shadow-ambient hover:opacity-90 transition-opacity"
                  >
                    <Link href="/auth/signup" id="hero-get-started-btn">
                      Create Profile
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 py-6 text-base font-semibold border-[var(--outline-variant)] text-[var(--primary)] hover:bg-[var(--surface-container-low)]"
                  >
                    <Link href="/matches" id="hero-browse-btn">
                      Browse Matches
                    </Link>
                  </Button>
                </>
              )}
            </div>



            {/* Trust indicators */}
            <div className="flex items-center gap-4 text-sm font-medium text-[var(--on-surface-variant)]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[var(--primary)]"/> Private</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[var(--primary)]"/> Verified</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-[var(--primary)]"/> Easy to use</span>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white"
          >
             {/* Using the generated image */}
             <Image
                src="/images/hero_family.png"
                alt="Happy family and newlywed couple"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
             />
          </motion.div>
        </div>
      </section>


      {/* ─── Add Emotional Section ─── */}
      <section className="bg-gradient-to-b from-[var(--background)] to-[var(--surface-container)] py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <Heart className="w-10 h-10 mx-auto mb-6 text-[var(--primary)]" />
          <h2 className="font-serif text-3xl md:text-5xl font-bold leading-snug mb-4 text-[var(--on-surface)]">
            "Marriage connects families, <br className="hidden sm:block"/> not just individuals."
          </h2>
          <p className="text-xl text-[var(--on-surface-variant)] max-w-2xl mx-auto leading-relaxed">
            We honor the traditions and values that make marriages meaningful, providing a platform designed for serious, long-term commitment.
          </p>
        </motion.div>
      </section>


      {/* ─── Trust & Contact Section ─── */}
      <section className="py-20 bg-[var(--surface-container-lowest)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
             className="grid md:grid-cols-2 gap-16 items-center"
           >
              <div>
                 <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-6">
                   Why families trust our platform
                 </h2>
                 <div className="space-y-6 mb-8">
                    <div className="flex items-start gap-4">
                       <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] p-3 rounded-full">
                          <Shield className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-[var(--on-surface)]">100% Verified Accounts</h3>
                          <p className="text-[var(--on-surface-variant)]">Every profile is manually checked for authenticity, ensuring a safe environment.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] p-3 rounded-full">
                          <Crown className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-[var(--on-surface)]">Absolute Privacy</h3>
                          <p className="text-[var(--on-surface-variant)]">Your contact details and sensitive information are never shared publicly.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] p-3 rounded-full">
                          <Users className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-[var(--on-surface)]">Dignified Experience</h3>
                          <p className="text-[var(--on-surface-variant)]">Built to respect cultural sensitivities and familial involvement.</p>
                       </div>
                    </div>
                 </div>
              </div>


              <div className="bg-[var(--surface-container-low)] rounded-[30px] p-8 md:p-10 text-center shadow-ambient border border-[rgba(249,115,22,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-fixed)]/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <h3 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-4">Need Reassurance? We're Here.</h3>
                <p className="text-[var(--on-surface-variant)] mb-8">
                  Our support team is ready to assist you or your parents with any questions you might have about the platform.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                   <Button variant="outline" className="rounded-full py-6 px-8 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors" asChild>
                      <a href="tel:+917061785692">
                        <Phone className="w-5 h-5 mr-2" />
                        +91 70617 85692
                      </a>
                   </Button>
                   <Button className="rounded-full py-6 px-8 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg" asChild>
                      <a href="https://wa.me/917061785692?text=Hello! I have some questions about Izzatdar Parivar." target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        WhatsApp Us
                      </a>
                   </Button>
                </div>
              </div>
           </motion.div>
        </div>
      </section>


      {/* ─── How It Works ─── */}
      <section className="py-20 lg:py-28 bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-4">
              Simple. Secure. Dignified.
            </h2>
            <p className="text-[var(--on-surface-variant)] max-w-xl mx-auto">
              We've made the process straightforward so you can focus on what matters.
            </p>
          </div>


          <div className="grid md:grid-cols-3 gap-8 relative">
             <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-[var(--outline-variant)] -translate-y-1/2 z-0" />
            {howItWorks.map((step) => (
              <div
                key={step.title}
                className="bg-[var(--surface-container-lowest)] rounded-2xl p-8 shadow-ambient text-center relative z-10 border border-[var(--border)]"
              >
                <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[var(--on-surface)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--on-surface-variant)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>


          <div className="text-center mt-12">
             <Button
                asChild
                size="lg"
                className="gold-gradient text-white rounded-full px-10 py-6 text-base font-semibold shadow-ambient sticky bottom-4 z-50 md:static md:bottom-auto"
              >
                <Link href="/auth/signup">Create Profile</Link>
              </Button>
          </div>
        </motion.div>
      </section>


      {/* ─── Profile Preview (Social Proof) ─── */}
      <section className="py-24 bg-[var(--surface-container-low)]">
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
         >
             <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                  <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)] mb-3">Recently Joined Profiles</h2>
                  <p className="text-[var(--on-surface-variant)] text-lg">Join thousands of verified families looking for a genuine connection.</p>
                </div>
                <Button variant="link" asChild className="text-[var(--primary)] font-semibold mt-4 md:mt-0 px-0">
                    <Link href="/matches">View all profiles <ArrowRight className="w-4 h-4 ml-1"/></Link>
                </Button>
             </div>


             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-none select-none blur-[1px] opacity-90 transition-all duration-300 hover:blur-0 hover:opacity-100">
               {previewProfiles.map((p) => (
                 <ProfileCard key={p.uid} profile={p as any} isPremiumViewer={false} />
               ))}
             </div>
             <div className="text-center mt-10">
               <p className="text-sm font-medium text-[var(--on-surface-variant)] mb-4 bg-white/50 inline-block px-4 py-2 rounded-full border border-[rgba(208,197,175,0.2)] shadow-sm">Sign up to view complete details and contact them directly.</p>
             </div>
         </motion.div>
      </section>




      {/* ─── Stats Strip ─── */}
      <section className="bg-[var(--surface-container-highest)] py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-container)]/50 to-[var(--secondary-container)]/50 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-3xl font-bold text-[var(--secondary)]">
                  {stat.value}
                </p>
                <p className="text-sm text-[var(--on-surface)] mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* ─── Premium CTA ─── */}
      <section className="bg-[var(--background)] py-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <div className="bg-[var(--surface-container-lowest)] rounded-[40px] p-10 lg:p-16 shadow-lg relative overflow-hidden border border-[var(--outline-variant)]">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--primary-fixed)]/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--secondary-container)]/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
           
            <Crown className="w-12 h-12 text-[var(--primary)] mx-auto mb-6 drop-shadow-sm" />
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[var(--on-surface)] mb-4">
              Unlock Premium Membership
            </h2>
            <p className="text-[var(--on-surface-variant)] mb-2 max-w-lg mx-auto">
              Get access to contact details, send unlimited expressions of interest,
              and get priority listing.
            </p>
            <p className="font-serif text-4xl font-bold text-[var(--primary)] mb-8">
              ₹999 <span className="text-lg font-normal text-[var(--on-surface-variant)]">/ year</span>
            </p>
            <Button
              asChild
              size="lg"
              className="gold-gradient text-white rounded-full px-10 py-6 text-base font-semibold shadow-ambient"
              id="premium-cta-btn"
            >
              <Link href="/auth/signup">Get Premium Access</Link>
            </Button>
          </div>
        </motion.div>
      </section>


      {/* ─── Testimonials ─── */}
      <section className="py-20 bg-[var(--surface-container-low)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl font-bold text-[var(--on-surface)]">
              Love Stories
            </h2>
            <p className="text-[var(--on-surface-variant)] mt-3">
              Thousands of families have found happiness through us.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-[var(--surface-container-lowest)] rounded-2xl p-8 shadow-ambient border border-[rgba(208,197,175,0.1)]"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 gold-gradient rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--on-surface)]">{t.name}</p>
                    <p className="text-sm text-[var(--on-surface-variant)]">{t.location}</p>
                  </div>
                </div>
                <p className="text-[var(--on-surface-variant)] leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex mt-4 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[var(--primary)] fill-[var(--primary)]" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── Footer ─── */}
      <footer className="bg-[var(--foreground)] text-[var(--surface)] py-16 border-t border-[rgba(208,197,175,0.2)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid md:grid-cols-4 gap-10">
             
             <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-serif font-bold text-xl text-[var(--surface)] tracking-wide">Izzatdar Parivar</span>
                </div>
                <p className="text-[var(--surface-variant)] mb-6 leading-relaxed">
                  Connecting families with dignity, respect, and trust across India.
                </p>
                <div className="flex items-center gap-4 text-[var(--surface-variant)]">
                   <Phone className="w-5 h-5"/>
                   <span>+91 70617 85692</span>
                </div>
                <div className="flex items-center gap-4 text-[var(--surface-variant)] mt-3">
                   <Mail className="w-5 h-5"/>
                   <span>support@izzatdar.com</span>
                </div>
             </div>


             <div>
                <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                <ul className="space-y-3 text-[var(--surface-variant)]">
                   <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                   <li><Link href="/matches" className="hover:text-white transition-colors">Browse Profiles</Link></li>
                   <li><Link href="/auth/signup" className="hover:text-white transition-colors">Create Profile</Link></li>
                   <li><Link href="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
                </ul>
             </div>


             <div>
                <h4 className="font-bold text-lg mb-6">Legal</h4>
                <ul className="space-y-3 text-[var(--surface-variant)]">
                   <li><Link href="/about" className="hover:text-white transition-colors flex items-center gap-2"><Info className="w-4 h-4"/> About Us</Link></li>
                   <li><Link href="/privacy" className="hover:text-white transition-colors flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Privacy Policy</Link></li>
                   <li><Link href="/terms" className="hover:text-white transition-colors flex items-center gap-2"><FileText className="w-4 h-4"/> Terms of Service</Link></li>
                   <li><Link href="/contact" className="hover:text-white transition-colors flex items-center gap-2"><MessageCircle className="w-4 h-4"/> Contact Us</Link></li>
                </ul>
             </div>
             
             <div>
                 <h4 className="font-bold text-lg mb-6">Start Your Journey</h4>
                 <p className="text-[var(--surface-variant)] mb-6">Join today to find verified profiles matching your preferences.</p>
                 <Button asChild className="gold-gradient text-[var(--on-primary)] w-full rounded-full font-bold">
                    <Link href="/auth/signup">Create Free Profile</Link>
                 </Button>
             </div>
             
          </div>


          <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.1)] flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-sm text-[var(--surface-variant)]">
               © {new Date().getFullYear()} Izzatdar Parivar. All rights reserved.
             </p>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}



