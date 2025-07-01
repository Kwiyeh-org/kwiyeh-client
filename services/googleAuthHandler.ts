import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';

// For mobile
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// For web
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';
import { auth } from './firebaseConfig';

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : 'http://192.168.208.33:8080';

export async function handleGoogleAuth(role: 'client' | 'talent') {
  let idToken: string | null = null;
  let profile: { name?: string; photoURL?: string | null; email?: string } = {};

  if (Platform.OS === 'web') {
    // Web: Use Firebase popup
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
    // Mobile: Use native Google Sign-In and always show account picker
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut(); // Always show the account picker
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();

    // Sign in to Firebase Auth with Google credential
    const credential = GoogleAuthProvider.credential(tokens.idToken);
    const userCred = await signInWithCredential(auth, credential);

    // Use Firebase Auth user info for backend/database
    profile = {
      name: userCred.user.displayName || '',
      photoURL: userCred.user.photoURL || null,
      email: userCred.user.email || '',
    };
    idToken = await userCred.user.getIdToken(true); // Always use Firebase ID token!
  }

  if (!idToken) throw new Error('No Google token');

  // Debug log the payload
  const payload = { token: idToken, role };
  try {
    const { data } = await axios.post(`${API_BASE_URL}/google-login`, payload, {
      headers: {
        'Authorization': idToken,
        'Content-Type': 'application/json'
      }
    });
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