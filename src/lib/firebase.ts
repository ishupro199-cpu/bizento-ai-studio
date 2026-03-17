import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_fgFYx0W35VtmUrTkKAtE_YSPtaxw6Pk",
  authDomain: "pixaleraai.firebaseapp.com",
  databaseURL: "https://pixaleraai-default-rtdb.firebaseio.com",
  projectId: "pixaleraai",
  storageBucket: "pixaleraai.firebasestorage.app",
  messagingSenderId: "167299328782",
  appId: "1:167299328782:web:28cb3aef8b46c31d51055f",
  measurementId: "G-GZ2XT3YXED",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
