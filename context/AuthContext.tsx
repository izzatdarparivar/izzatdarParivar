"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserProfile, getUserProfile, UserProfile } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setupRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneOtp: (phone: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Set cookie for proxy/middleware auth
        const token = await firebaseUser.getIdToken(true);
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;

        let profile = await getUserProfile(firebaseUser.uid);
       
        // Auto-create stub profile for new Phone/Google users caught by listener
        if (!profile) {
            await createUserProfile(firebaseUser.uid, {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.phoneNumber || "User",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || "",
              status: "pending",
              is_premium: false,
            });
            profile = await getUserProfile(firebaseUser.uid);
        }

        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName: name });
    await createUserProfile(newUser.uid, {
      uid: newUser.uid,
      name,
      email,
      photoURL: newUser.photoURL || "",
      status: "pending",
      is_premium: false,
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const { user: googleUser } = await signInWithPopup(auth, googleProvider);
    const existing = await getUserProfile(googleUser.uid);
    if (!existing) {
      await createUserProfile(googleUser.uid, {
        uid: googleUser.uid,
        name: googleUser.displayName || "",
        email: googleUser.email || "",
        photoURL: googleUser.photoURL || "",
        status: "pending",
        is_premium: false,
      });
    }
  };

  const setupRecaptcha = (containerId: string) => {
    return new RecaptchaVerifier(auth, containerId, {
      size: "invisible", // Changed to invisible so UI stays perfectly clean like Clerk
    });
  };

  const sendPhoneOtp = async (phone: string, appVerifier: RecaptchaVerifier) => {
    return await signInWithPhoneNumber(auth, phone, appVerifier);
  };

  const logOut = async () => {
    await signOut(auth);
    document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signUp, signIn, signInWithGoogle, logOut, refreshProfile, setupRecaptcha, sendPhoneOtp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
