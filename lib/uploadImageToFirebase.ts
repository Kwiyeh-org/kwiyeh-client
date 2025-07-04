import { Platform } from 'react-native';
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../services/firebaseConfig.js';

/**
 * Uploads an image to Firebase Storage and returns the public download URL.
 * @param localUri Local file URI (from ImagePicker or file input)
 * @param userId Firebase UID of the user
 * @param role 'client' | 'talent' (for path separation)
 * @returns download URL string
 */
export async function uploadImageToFirebase(localUri: string, userId: string, role: 'client' | 'talent'): Promise<string> {
  try {
    const storage = getStorage(app);
    // Use a unique filename (timestamp)
    const filename = `${Date.now()}_${userId}.jpg`;
    const storageRef = ref(storage, `${role}-profile-images/${userId}/${filename}`);

    let blob: Blob;
    // Works for both web and native
    const response = await fetch(localUri);
    blob = await response.blob();

    // Upload the blob
    await uploadBytes(storageRef, blob);
    // Get the download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('[uploadImageToFirebase] Error uploading image:', error);
    throw error;
  }
} 