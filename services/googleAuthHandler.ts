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
  let profile: { name?: string; photoURL?: string | null; email?: string } = {};

  if (Platform.OS === 'web') {
    console.log('[GoogleAuth] Platform: web');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    idToken = await result.user.getIdToken();
    profile = {
      name: result.user.displayName || '',
      photoURL: result.user.photoURL || null,
      email: result.user.email || '',
    };
  } else {
    console.log('[GoogleAuth] Platform: native');
    await GoogleSignin.hasPlayServices();
    // Use 'any' to avoid linter error due to type mismatch in library typings
    const userInfo: any = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens.idToken;
    profile = {
      name: userInfo.user?.name || '',
      photoURL: userInfo.user?.photo || null,
      email: userInfo.user?.email || '',
    };
  }

  if (!idToken) throw new Error('No Google token');

  // Debug log the payload
  const payload = { token: idToken, role };
  console.log('[GoogleAuth] Sending to /google-login:', payload);

  try {
    const { data } = await axios.post(`${API_BASE_URL}/google-login`, payload);
    console.log('[GoogleAuth] Backend response:', data);
    // Only proceed if backend responds successfully
    // Use Google profile info for Zustand
    const userObj = {
      id: idToken, // Use idToken as a unique identifier (or you can use result.user.uid if available)
      email: profile.email || '',
      name: profile.name || '',
      photoURL: profile.photoURL || null,
      role,
    };
    useAuthStore.getState().updateUser(userObj);
    return { success: true, user: userObj };
  } catch (err: any) {
    console.error('[GoogleAuth] Error from /google-login:', err?.response?.data || err);
    throw new Error(err?.response?.data?.message || 'Google login failed.');
  }
} 