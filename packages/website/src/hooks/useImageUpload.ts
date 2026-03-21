import { useState, useCallback } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export function useImageUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      if (!user) return null;
      setUploading(true);
      setProgress(0);
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => {
            setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
          },
          (error) => {
            setUploading(false);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setUploadedUrl(url);
            setUploading(false);
            setProgress(100);
            resolve(url);
          }
        );
      });
    },
    [user]
  );

  const clearUpload = useCallback(() => {
    setUploadedUrl(null);
    setUploadedFile(null);
    setPreviewUrl(null);
    setProgress(0);
  }, []);

  return { upload, uploading, progress, uploadedUrl, uploadedFile, previewUrl, clearUpload };
}
