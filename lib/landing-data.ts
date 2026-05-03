import { UserPlus, Search, MessageSquareHeart } from "lucide-react";
import { ElementType } from "react";

export const stats = [
  { value: "50,000+", label: "Registered Profiles" },
  { value: "12,000+", label: "Successful Matches" },
  { value: "150+", label: "Cities Covered" },
  { value: "4.9★", label: "User Rating" },
];

export interface HowItWorksStep {
  icon: ElementType;
  title: string;
  description: string;
}

export const howItWorks: HowItWorksStep[] = [
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

export interface Testimonial {
  name: string;
  location: string;
  text: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
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

export interface PreviewProfile {
  uid: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  occupation: string;
  photoURL: string;
  is_premium: boolean;
}

export const previewProfiles: PreviewProfile[] = [
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
    name: "Pooja M.",
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
  },
];
