import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminDb = null;
let adminAuth = null;
let initialized = false;

export function initFirebaseAdmin() {
  if (initialized || getApps().length > 0) {
    adminDb = getFirestore();
    adminAuth = getAuth();
    initialized = true;
    return true;
  }

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      initializeApp({ credential: cert(serviceAccount) });
      console.log("Firebase Admin SDK initialized with service account.");
    } else {
      initializeApp({
        projectId: "pixaleraai",
        databaseURL: "https://pixaleraai-default-rtdb.firebaseio.com",
      });
      console.warn("Firebase Admin SDK initialized without credentials — Firestore writes will fail in production.");
    }

    adminDb = getFirestore();
    adminAuth = getAuth();
    initialized = true;
    return true;
  } catch (err) {
    console.error("Firebase Admin init error:", err.message);
    return false;
  }
}

export function getAdminDb() {
  return adminDb;
}

export function getAdminAuth() {
  return adminAuth;
}
