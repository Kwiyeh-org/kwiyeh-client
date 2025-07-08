import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For mobile
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// For web
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';
import { auth } from './firebaseConfig';

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : 'http://10.218.6.33:8080';

// Helper function to decode JWT token (for debugging)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[decodeJWT] Error decoding token:', error);
    return null;
  }
}

// Helper function to validate token format
function isValidToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    console.log('[isValidToken] Token is null, undefined, or not string:', token);
    return false;
  }
  if (token.length < 10) {
    console.log('[isValidToken] Token too short:', token.length);
    return false;
  }
  // Check if it looks like a JWT token (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.log('[isValidToken] Token does not have 3 parts:', parts.length);
    return false;
  }
  console.log('[isValidToken] Token is valid, length:', token.length);
  return true;
}

// Helper function to safely store user ID
async function storeUserId(userId: string) {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('userId', userId);
        console.log('[storeUserId] Stored userId in localStorage:', userId);
      }
    } else {
      await AsyncStorage.setItem('userId', userId);
      console.log('[storeUserId] Stored userId in AsyncStorage:', userId);
    }
  } catch (error) {
    console.warn('[storeUserId] Failed to store userId:', error);
  }
}

// Helper function to debug token storage
function debugTokenStorage() {
  if (Platform.OS === 'web') {
    const storedToken = localStorage.getItem('idToken');
    console.log('[debugTokenStorage] Web localStorage token:', storedToken ? 'EXISTS' : 'MISSING');
    if (storedToken) {
      console.log('[debugTokenStorage] Token length:', storedToken.length);
      console.log('[debugTokenStorage] Token preview:', storedToken.substring(0, 20) + '...');
    }
  } else {
    AsyncStorage.getItem('idToken').then(token => {
      console.log('[debugTokenStorage] Mobile AsyncStorage token:', token ? 'EXISTS' : 'MISSING');
      if (token) {
        console.log('[debugTokenStorage] Token length:', token.length);
        console.log('[debugTokenStorage] Token preview:', token.substring(0, 20) + '...');
      }
    });
  }
}

// Helper function to test token storage and retrieval
async function testTokenStorage(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem('idToken', token);
    const retrieved = localStorage.getItem('idToken');
    console.log('[testTokenStorage] Web storage test - stored:', !!token, 'retrieved:', !!retrieved, 'match:', token === retrieved);
  } else {
    await AsyncStorage.setItem('idToken', token);
    const retrieved = await AsyncStorage.getItem('idToken');
    console.log('[testTokenStorage] Mobile storage test - stored:', !!token, 'retrieved:', !!retrieved, 'match:', token === retrieved);
  }
}

export async function handleGoogleAuth(role: 'client' | 'talent') {
  console.log('[handleGoogleAuth] Called for role:', role);
  let idToken: string | null = null;
  let profile: { name?: string; photoURL?: string | null; email?: string } = {};
  let uid: string | null = null;

  if (Platform.OS === 'web') {
    // Web: Use Firebase popup and get Google ID token
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      // Get the Google ID token from Firebase result
      const googleIdToken = (result as any)._tokenResponse?.oauthIdToken;
      console.log('[handleGoogleAuth] (web) Google ID token (to backend):', googleIdToken);
      
      // Debug: Decode and log token contents
      const decodedToken = decodeJWT(googleIdToken);
      console.log('[handleGoogleAuth] (web) Decoded Google token payload:', decodedToken);
      
      // Web: Now sign in with credential like mobile to get complete user data
      const credential = GoogleAuthProvider.credential(googleIdToken);
      const userCred = await signInWithCredential(auth, credential);
      
      uid = userCred.user.uid;
      profile = {
        name: userCred.user.displayName || '',
        photoURL: userCred.user.photoURL || null,
        email: userCred.user.email || '',
      };
      
      idToken = googleIdToken;
    } catch (error) {
      console.error('[handleGoogleAuth] (web) Error:', error);
      throw error;
    }
  } else {
    // Mobile: Use native Google Sign-In (ORIGINAL WORKING FLOW)
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut(); // Always show the account picker
      const userInfo = await GoogleSignin.signIn();
      console.log('[handleGoogleAuth] (mobile) userInfo:', userInfo);
      
      // Extract Google ID token from nested structure
      const googleIdToken = (userInfo as any).data?.idToken || (userInfo as any).idToken;
      console.log('[handleGoogleAuth] (mobile) Google ID token (to backend):', googleIdToken);
      
      // Debug: Decode and log token contents
      const decodedToken = decodeJWT(googleIdToken);
      console.log('[handleGoogleAuth] (mobile) Decoded token payload:', decodedToken);
      
      if (!googleIdToken) {
        throw new Error('No Google ID token found in userInfo response');
      }
      
      // Sign in to Firebase Auth with Google credential
      const credential = GoogleAuthProvider.credential(googleIdToken);
      const userCred = await signInWithCredential(auth, credential);
      uid = userCred.user.uid;
      profile = {
        name: userCred.user.displayName || '',
        photoURL: userCred.user.photoURL || null,
        email: userCred.user.email || '',
      };
      idToken = googleIdToken;
    } catch (err) {
      console.error('[handleGoogleAuth] (mobile) GoogleSignin.signIn() error:', err);
      throw err;
    }
  }

  if (!idToken || !uid) throw new Error('No Google token or UID');

  // Debug log the payload
  const payload = { token: idToken, role };
  console.log('[handleGoogleAuth] Payload to backend:', payload);
  
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
    
    console.log('[handleGoogleAuth] Backend response:', data);
    console.log('[handleGoogleAuth] Backend response keys:', Object.keys(data));
    console.log('[handleGoogleAuth] Backend response has idToken:', 'idToken' in data);
    console.log('[handleGoogleAuth] Backend response has token:', 'token' in data);
    console.log('[handleGoogleAuth] Backend response has accessToken:', 'accessToken' in data);
    if ('idToken' in data) {
      console.log('[handleGoogleAuth] Backend idToken type:', typeof data.idToken);
      console.log('[handleGoogleAuth] Backend idToken length:', data.idToken?.length);
      console.log('[handleGoogleAuth] Backend idToken preview:', data.idToken?.substring(0, 20) + '...');
    }
    if ('token' in data) {
      console.log('[handleGoogleAuth] Backend token type:', typeof data.token);
      console.log('[handleGoogleAuth] Backend token length:', data.token?.length);
      console.log('[handleGoogleAuth] Backend token preview:', data.token?.substring(0, 20) + '...');
    }
    
    // Update user state with the response data
    console.log('[handleGoogleAuth] Backend response name fields:', {
      displayName: data.displayName,
      fullName: data.fullName,
      name: data.name
    });
    
    const userData = {
      id: data.uid || data.localId,
      name: data.displayName || data.fullName || data.name || profile.name || '',
      email: data.email,
      photoURL: role === 'talent' ? (data.talentImageUrl || data.photoURL) : (data.clientImageUrl || data.photoURL),
      role: data.role || role,
      phoneNumber: data.phoneNumber || '',
      location: data.location || null,
      // Talent-specific fields
      services: data.talentCategory ? data.talentCategory.split(', ') : [],
      pricing: data.pricing || '',
      availability: data.availability || '',
      experience: data.experience || '',
      isMobile: typeof data.isMobile === 'boolean' ? data.isMobile : false,
    };

    console.log('[handleGoogleAuth] Final user data to update:', userData);
    useAuthStore.getState().updateUser(userData);
    
    // Store UID in AsyncStorage for consistency
    await storeUserId(userData.id);
    
    // === STORE idToken for protected requests ===
    console.log('[handleGoogleAuth] Starting token storage...');
    console.log('[handleGoogleAuth] Backend data keys:', Object.keys(data));
    console.log('[handleGoogleAuth] Backend data.idToken exists:', !!data.idToken);
    console.log('[handleGoogleAuth] Backend data.token exists:', !!data.token);
    console.log('[handleGoogleAuth] Backend data.accessToken exists:', !!data.accessToken);
    
    if (Platform.OS === 'web') {
      // For web: prioritize backend token, fallback to Firebase token
      const backendToken = data.idToken || data.token || data.accessToken;
      console.log('[handleGoogleAuth] Web - backendToken found:', !!backendToken);
      console.log('[handleGoogleAuth] Web - backendToken valid:', isValidToken(backendToken));
      
      if (backendToken && isValidToken(backendToken)) {
        localStorage.setItem('idToken', backendToken);
        console.log('[handleGoogleAuth] Backend token stored in localStorage:', backendToken.substring(0, 20) + '...');
      } else if (auth.currentUser) {
        try {
          const firebaseIdToken = await auth.currentUser.getIdToken(true);
          localStorage.setItem('idToken', firebaseIdToken);
          console.log('[handleGoogleAuth] Firebase idToken stored in localStorage:', firebaseIdToken.substring(0, 20) + '...');
        } catch (tokenError) {
          console.warn('[handleGoogleAuth] Failed to get Firebase token for web:', tokenError);
        }
      } else {
        console.warn('[handleGoogleAuth] No valid token available to store for web user');
        console.warn('[handleGoogleAuth] Backend token was:', backendToken);
        console.warn('[handleGoogleAuth] Backend token valid:', isValidToken(backendToken));
      }
    } else {
      // For mobile: prioritize backend token, fallback to Firebase token
      const backendToken = data.idToken || data.token || data.accessToken;
      console.log('[handleGoogleAuth] Mobile - backendToken found:', !!backendToken);
      console.log('[handleGoogleAuth] Mobile - backendToken valid:', isValidToken(backendToken));
      
      if (backendToken && isValidToken(backendToken)) {
        await AsyncStorage.setItem('idToken', backendToken);
        console.log('[handleGoogleAuth] Backend token stored in AsyncStorage:', backendToken.substring(0, 20) + '...');
      } else if (auth.currentUser) {
        try {
          const firebaseIdToken = await auth.currentUser.getIdToken(true);
          await AsyncStorage.setItem('idToken', firebaseIdToken);
          console.log('[handleGoogleAuth] Firebase idToken stored in AsyncStorage:', firebaseIdToken.substring(0, 20) + '...');
        } catch (tokenError) {
          console.warn('[handleGoogleAuth] Failed to get Firebase token for mobile:', tokenError);
        }
      } else {
        console.warn('[handleGoogleAuth] No valid token available to store for mobile user');
        console.warn('[handleGoogleAuth] Backend token was:', backendToken);
        console.warn('[handleGoogleAuth] Backend token valid:', isValidToken(backendToken));
      }
    }
    // === END idToken storage ===
    
    // Debug token storage
    debugTokenStorage();
    
    // Verify token was stored correctly
    if (Platform.OS === 'web') {
      const storedToken = localStorage.getItem('idToken');
      console.log('[handleGoogleAuth] Token storage verification - stored:', !!storedToken);
      if (storedToken) {
        console.log('[handleGoogleAuth] Stored token length:', storedToken.length);
        console.log('[handleGoogleAuth] Stored token preview:', storedToken.substring(0, 20) + '...');
        await testTokenStorage(storedToken);
      }
    } else {
      const storedToken = await AsyncStorage.getItem('idToken');
      console.log('[handleGoogleAuth] Token storage verification - stored:', !!storedToken);
      if (storedToken) {
        console.log('[handleGoogleAuth] Stored token length:', storedToken.length);
        console.log('[handleGoogleAuth] Stored token preview:', storedToken.substring(0, 20) + '...');
        await testTokenStorage(storedToken);
      }
    }
    
    console.log('[handleGoogleAuth] Google Auth result:', { success: true, user: userData });
    return { success: true, user: userData };
  } catch (err: any) {
    // Log the backend error response for debugging
    if (err?.response) {
      console.error('[handleGoogleAuth] Error from backend:', err.response.data);
      console.error('[handleGoogleAuth] Error status:', err.response.status);
      console.error('[handleGoogleAuth] Error headers:', err.response.headers);
    } else {
      console.error('[handleGoogleAuth] Error from backend:', err);
    }
    throw err;
  }
} 