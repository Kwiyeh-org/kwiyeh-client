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
  console.log('[handleGoogleAuth] Called for role:', role);
  let idToken: string | null = null;
  let profile: { name?: string; photoURL?: string | null; email?: string } = {};
  let uid: string | null = null;

  if (Platform.OS === 'web') {
    // Web: Use Firebase popup
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    idToken = await result.user.getIdToken();
    uid = result.user.uid; // Always use Firebase Auth UID
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

    // Always use Firebase Auth UID, never Google's subject
    uid = userCred.user.uid;
    profile = {
      name: userCred.user.displayName || '',
      photoURL: userCred.user.photoURL || null,
      email: userCred.user.email || '',
    };
    idToken = await userCred.user.getIdToken(true); // Always use Firebase ID token!
  }

  if (!idToken || !uid) throw new Error('No Google token or UID');

  // Debug log the payload
  const payload = { token: idToken, role };
  try {
    // Log outgoing request
    console.log('[handleGoogleAuth] POST', `${API_BASE_URL}/google-login`, { 
      payload, 
      uid,
      headers: { 'Authorization': idToken, 'Content-Type': 'application/json' } 
    });
    
    const { data } = await axios.post(`${API_BASE_URL}/google-login`, payload, {
      headers: {
        'Authorization': idToken,
        'Content-Type': 'application/json'
      }
    });
    
    // Safety: validate UID is a proper Firebase UID
    if (!uid || typeof uid !== 'string' || uid.length > 40) {
      console.warn('[handleGoogleAuth] Invalid UID detected, clearing user and forcing logout. UID:', uid);
      if (typeof window !== 'undefined') {
        const { useAuthStore } = require('@/store/authStore');
        useAuthStore.getState().logout();
        if (window.location) window.location.href = '/login-client';
      }
      return null;
    }
    
    const userObj = {
      id: uid, // Always use Firebase Auth UID
      email: profile.email || '',
      name: profile.name || '',
      photoURL: profile.photoURL || null,
      role,
    };
    
    // Store UID in AsyncStorage for consistency
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('userId', uid);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('userId', uid);
    }
    
    useAuthStore.getState().updateUser(userObj);
    
    // Validate UID consistency after authentication
    try {
      const { validateUIDConsistency } = require('./firebase');
      await validateUIDConsistency();
    } catch (validationError) {
      console.warn('[handleGoogleAuth] UID validation failed:', validationError);
    }
    
    console.log('[handleGoogleAuth] Google Auth result:', { success: true, user: userObj });
    return { success: true, user: userObj };
  } catch (err: any) {
    console.error('[GoogleAuth] Error from /google-login:', err?.response?.data || err);
    throw new Error(err?.response?.data?.message || 'Google login failed.');
  }
} 