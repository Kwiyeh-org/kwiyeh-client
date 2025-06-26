import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';

// For mobile
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// For web
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseConfig';

// Use the same API_BASE_URL logic as in services/firebase.ts
const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : 'http://192.168.103.33:8080';

export async function handleGoogleAuth(role: 'client' | 'talent') {
  let idToken: string | null = null;
  let profile: { name?: string; photoURL?: string | null } = {};

  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    idToken = await result.user.getIdToken();
    profile = {
      name: result.user.displayName || '',
      photoURL: result.user.photoURL || null,
    };
  } else {
    await GoogleSignin.hasPlayServices();
    // Use 'any' to avoid linter error due to type mismatch in library typings
    const userInfo: any = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens.idToken;
    profile = {
      name: userInfo.user?.name || '',
      photoURL: userInfo.user?.photo || null,
    };
  }

  if (!idToken) throw new Error('No Google token');

  // Send token to backend using the correct API_BASE_URL
  const { data } = await axios.post(`${API_BASE_URL}/google-login`, { request: idToken });

  if (data && data.UId) {
    useAuthStore.getState().updateUser({
      id: data.UId,
      email: data.email,
      name: profile.name || '',
      photoURL: profile.photoURL || null,
      role,
    });
    return { success: true };
  } else {
    throw new Error('No account found. Please sign up first.');
  }
} 