import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  ConfirmationResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPhoneOtp: (phone: string, containerId: string) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (result: ConfirmationResult, code: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      plan: "free",
      creditsRemaining: 3,
      creditsUsed: 0,
      flashGenerations: 0,
      proGenerations: 0,
      createdAt: new Date(),
    });
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
  };

  const sendPhoneOtp = async (phone: string, containerId: string): Promise<ConfirmationResult> => {
    const verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
    const result = await signInWithPhoneNumber(auth, phone, verifier);
    return result;
  };

  const confirmPhoneOtp = async (result: ConfirmationResult, code: string, name?: string) => {
    const cred = await result.confirm(code);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) {
      await setDoc(doc(db, "users", cred.user.uid), {
        name: name || cred.user.phoneNumber || "User",
        email: cred.user.email || "",
        plan: "free",
        creditsRemaining: 3,
        creditsUsed: 0,
        flashGenerations: 0,
        proGenerations: 0,
        createdAt: new Date(),
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: signOutUser, sendPhoneOtp, confirmPhoneOtp }}>
      {children}
    </AuthContext.Provider>
  );
}
