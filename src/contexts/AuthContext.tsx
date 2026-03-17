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
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendPhoneOtp: (phone: string, containerId: string) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (result: ConfirmationResult, code: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function ensureUserDoc(user: User, extra?: { name?: string }) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: extra?.name || user.displayName || user.email?.split("@")[0] || "User",
      email: user.email || "",
      photoURL: user.photoURL || "",
      plan: "free",
      creditsRemaining: 3,
      creditsUsed: 0,
      flashGenerations: 0,
      proGenerations: 0,
      role: "user",
      createdAt: new Date(),
    });
  } else {
    const data = snap.data();
    const updates: Record<string, any> = {};
    if (user.photoURL && !data.photoURL) updates.photoURL = user.photoURL;
    if (user.displayName && !data.name) updates.name = user.displayName;
    if (Object.keys(updates).length > 0) {
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(ref, updates);
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          setIsAdmin(snap.exists() && snap.data().role === "admin");
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
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
    await ensureUserDoc(cred.user, { name });
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    const cred = await signInWithPopup(auth, provider);
    await ensureUserDoc(cred.user);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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
    await ensureUserDoc(cred.user, { name });
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading, isAdmin,
        signIn, signUp, signOut: signOutUser,
        signInWithGoogle, sendPasswordReset,
        sendPhoneOtp, confirmPhoneOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
