import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { ModelId } from "@/contexts/AppContext";

export interface FirestoreGeneration {
  id: string;
  userId: string;
  prompt: string;
  tool: string;
  style: string;
  model: ModelId;
  creditsConsumed: number;
  gradient: string;
  imageUrls: string[];
  status: "completed" | "failed";
  createdAt: Date;
}

export function useGenerations() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<FirestoreGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGenerations([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "generations"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          prompt: data.prompt,
          tool: data.tool,
          style: data.style,
          model: data.model,
          creditsConsumed: data.creditsConsumed,
          gradient: data.gradient,
          imageUrls: data.imageUrls || [],
          status: data.status,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        } as FirestoreGeneration;
      });
      setGenerations(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addGeneration = useCallback(
    async (record: Omit<FirestoreGeneration, "id" | "userId">) => {
      if (!user) return;
      await addDoc(collection(db, "generations"), {
        ...record,
        userId: user.uid,
        createdAt: Timestamp.fromDate(record.createdAt),
      });
    },
    [user]
  );

  const removeGeneration = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "generations", id));
  }, []);

  return { generations, loading, addGeneration, removeGeneration };
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const updateCredits = useCallback(
    async (creditsToDeduct: number, model: ModelId) => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      await updateDoc(ref, {
        creditsRemaining: Math.max(0, data.creditsRemaining - creditsToDeduct),
        creditsUsed: (data.creditsUsed || 0) + creditsToDeduct,
        flashGenerations: model === "flash" ? (data.flashGenerations || 0) + 1 : data.flashGenerations || 0,
        proGenerations: model === "pro" ? (data.proGenerations || 0) + 1 : data.proGenerations || 0,
      });
    },
    [user]
  );

  const switchPlan = useCallback(
    async (plan: string, credits: number) => {
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid), {
        plan,
        creditsRemaining: credits,
        creditsUsed: 0,
      });
    },
    [user]
  );

  return { profile, loading, updateCredits, switchPlan };
}
