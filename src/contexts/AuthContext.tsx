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
  OAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { mapFirebaseError } from "@/lib/authErrors";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ needsVerification: boolean }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
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
      phoneNumber: user.phoneNumber || "",
      photoURL: user.photoURL || "",
      plan: "free",
      creditsRemaining: 3,
      creditsUsed: 0,
      flashGenerations: 0,
      proGenerations: 0,
      role: "user",
      emailVerified: user.emailVerified,
      providers: user.providerData.map((p) => p.providerId),
      createdAt: new Date(),
    });
  } else {
    const data = snap.data();
    const updates: Record<string, any> = {};
    if (user.photoURL && !data.photoURL) updates.photoURL = user.photoURL;
    if (user.displayName && !data.name) updates.name = user.displayName;
    if (user.emailVerified && !data.emailVerified) updates.emailVerified = true;
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
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        throw Object.assign(new Error("Please verify your email before signing in. Check your inbox for the verification link."), { code: "auth/unverified-email" });
      }
    } catch (err: any) {
      if (err.code === "auth/unverified-email") throw err;
      throw new Error(mapFirebaseError(err));
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ needsVerification: boolean }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      try { await updateProfile(cred.user, { displayName: name }); } catch {}
      try { await sendEmailVerification(cred.user); } catch {}
      try { await ensureUserDoc(cred.user, { name }); } catch {}
      await firebaseSignOut(auth);
      return { needsVerification: true };
    } catch (err: any) {
      throw new Error(mapFirebaseError(err));
    }
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      const cred = await signInWithPopup(auth, provider);
      await ensureUserDoc(cred.user);
    } catch (err: any) {
      throw new Error(mapFirebaseError(err));
    }
  };

  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      const cred = await signInWithPopup(auth, provider);
      await ensureUserDoc(cred.user);
    } catch (err: any) {
      throw new Error(mapFirebaseError(err));
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/login` });
    } catch (err: any) {
      throw new Error(mapFirebaseError(err));
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
    } catch (err: any) {
      throw new Error(mapFirebaseError(err));
    }
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await reload(auth.currentUser);
    return auth.currentUser.emailVerified;
  };

  const sendPhoneOtp = async (phone: string, containerId: string): Promise<ConfirmationResult> => {
    try {
      const verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      return result;
    } catch (err: any) {
      throw new Error(mapFirebaseError(err));
    }
  };

  const confirmPhoneOtp = async (result: ConfirmationResult, code: string, name?: string) => {
    try {
      const cred = await result.confirm(code);
      if (name) await updateProfile(cred.user, { displayName: name });
      await ensureUserDoc(cred.user, { name });
    } catch (err: any) {
      throw new Error(mapFirebaseError(err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading, isAdmin,
        signIn, signUp, signOut: signOutUser,
        signInWithGoogle, signInWithApple,
        sendPasswordReset, resendVerificationEmail, checkEmailVerified,
        sendPhoneOtp, confirmPhoneOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
