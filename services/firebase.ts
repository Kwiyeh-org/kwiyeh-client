 // service/firebase.ts

import axios from 'axios';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '~/supabase/supabase';

// Complete any in-progress browser auth sessions
WebBrowser.maybeCompleteAuthSession();

// Base URL for your Spring Boot backend
const API_BASE_URL = Platform.OS === 'web' ? 'http://localhost:8080' : 'http://192.168.45.34:8080';

// Google OAuth configuration
// You'll need to add these to your app.json/app.config.js
const GOOGLE_CLIENT_ID_WEB = "526766693911-33hjbi26mjndnijda5fgg5iaehm07g54.apps.googleusercontent.com"; // Replace with your actual web client ID
const GOOGLE_CLIENT_ID_ANDROID = "218913946141-98jbl2t3i0hqb22gjse3hgi80bat0f6j.apps.googleusercontent.com"; // Replace with your actual Android client ID
const GOOGLE_CLIENT_ID_IOS = "218913946141-do0qvari62vspdovqdhfqnuo7ot7he9a.apps.googleusercontent.com"; // Replace with your actual iOS client ID

// Define status codes for GoogleSignin if they're not exported by the library directly
const GOOGLE_SIGNIN_STATUS_CODES = {
  SIGN_IN_CANCELLED: 12501,
  IN_PROGRESS: 12502,
  PLAY_SERVICES_NOT_AVAILABLE: 12500
};

// Conditionally import GoogleSignin for mobile platforms
let GoogleSignin: any = null;
if (Platform.OS !== 'web') {
  try {
    // Dynamic import to prevent the module from being executed on web
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    
    // Initialize Google Sign In for mobile platforms
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID_WEB, // This is required for backend integration
      offlineAccess: true, // If you need offline access
      scopes: ['profile', 'email']
    });
  } catch (error) {
    console.warn('Google Sign-In module could not be loaded. Mobile Google Sign-In functionality will be disabled.', error);
  }
}

// ─── Email / Password ────────────────────────────────────────────────────────
export const registerUser = async (userData: { fullName: string; email: string; phoneNumber: string; password: string; }) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/signup`,
    userData
  );
  const userId = data.userId ?? data['User created'];
  if (userId) {
    await AsyncStorage.setItem('userId', userId);
  }
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/login`,
    { email, password }
  );
  await AsyncStorage.multiSet([
    ['userId', data.localId],
    ['idToken', data.idToken],
  ]);
  return data;
};

// ─── Google OAuth for Mobile ─────────────────────────────────────────────
/**
 * Sign in with Google for mobile platforms using @react-native-google-signin/google-signin
 * @param redirectPath Path to redirect after successful sign in
 * @returns Promise with auth result
 */
export const signInWithGoogleMobile = async (
  redirectPath: '/client-dashboard' | '/talent-dashboard'
): Promise<{
  success: boolean;
  userId: string;
  redirectPath: '/client-dashboard' | '/talent-dashboard';
}> => {
  // Check if GoogleSignin is available
  if (!GoogleSignin) {
    throw new Error('Google Sign-In is not available. The native module is missing. Make sure @react-native-google-signin/google-signin is properly installed and linked.');
  }

  try {
    // Check if Play Services are available (Android only)
    await GoogleSignin.hasPlayServices();
    
    // Perform the sign-in
    const userInfo = await GoogleSignin.signIn();
    
    // Get the ID token from tokens property instead of directly on the userInfo object
    const tokens = await GoogleSignin.getTokens();
    if (!tokens.idToken) {
      throw new Error('No ID token present in Google Sign-In response');
    }
    
    console.log('Google Sign-In successful, processing with Supabase...');
    
    // Sign in with Supabase using the Google ID token
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.idToken,
    });
    
    if (supabaseError) {
      console.error('Supabase auth error:', supabaseError);
      throw supabaseError;
    }
    
    // Forward the token to your backend
    const response = await axios.post(
      `${API_BASE_URL}/google-login`,
      { token: tokens.idToken },
      { headers: { Authorization: `Bearer ${tokens.idToken}` } }
    );
    
    if (response.data.UId) {
      await AsyncStorage.setItem('userId', response.data.UId);
      return {
        success: true,
        userId: response.data.UId,
        redirectPath
      };
    } else {
      throw new Error('No user ID returned from backend');
    }
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    
    // Handle specific Google Sign-In errors using our defined status codes
    if (error.code) {
      switch (error.code) {
        case GOOGLE_SIGNIN_STATUS_CODES.SIGN_IN_CANCELLED:
          throw new Error('Google Sign-In was cancelled');
        case GOOGLE_SIGNIN_STATUS_CODES.IN_PROGRESS:
          throw new Error('Google Sign-In operation is in progress');
        case GOOGLE_SIGNIN_STATUS_CODES.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('Play Services not available or outdated');
        default:
          throw error;
      }
    }
    
    throw error;
  }
};

// For web only: Supabase OAuth flow
/**
 * Sign in with Google - routes to appropriate platform implementation
 * @param redirectPath Path to redirect after successful sign in
 */
export const signInWithGoogle = async (
  redirectPath: '/client-dashboard' | '/talent-dashboard'
): Promise<void | {
  success: boolean;
  userId: string;
  redirectPath: '/client-dashboard' | '/talent-dashboard';
}> => {
  if (Platform.OS === 'web') {
    // Web implementation using Supabase OAuth
    const redirectTo = window.location.origin + redirectPath;
    console.log(`[${Platform.OS}] Redirect URI:`, redirectTo);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'email profile',
        },
      });

      if (error) throw error;

      if (data.url) {
        // For web: full page navigation
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw error;
    }
  } else {
    try {
      // For mobile platforms, use the new signInWithGoogleMobile method
      return signInWithGoogleMobile(redirectPath);
    } catch (error: any) {
      // If the error is about missing module, provide a fallback
      if (error.message?.includes('native module is missing')) {
        console.warn('Falling back to email/password authentication due to missing Google Sign-In module');
        throw new Error('Google Sign-In is not available on this device. Please try another sign-in method.');
      }
      throw error;
    }
  }
};

/**
 * Handle the OAuth redirect for web platform
 */
export const handleGoogleRedirect = async (url: string) => {
  if (Platform.OS !== 'web') {
    console.warn("handleGoogleRedirect is only for web platform");
    return;
  }
  
  console.log("Processing redirect URL:", url);
  
  try {
    const urlParams = new URL(url).searchParams;
    const code = urlParams.get('code');
    
    if (!code) {
      throw new Error("No authorization code found in redirect URL");
    }
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Supabase session error:", error);
      throw error;
    }
    
    if (!data?.session) {
      console.error("No session data obtained");
      throw new Error("Authentication failed: No session data");
    }
    
    // Extract tokens from session
    const { provider_token, access_token } = data.session;
    
    // Log successful auth and tokens (truncated for security)
    console.log("Auth successful: Token obtained", {
      provider_token: provider_token ? `${provider_token.substring(0, 10)}...` : 'none',
      access_token: access_token ? `${access_token.substring(0, 10)}...` : 'none'
    });

    // Send tokens to your backend
    const response = await axios.post(
      `${API_BASE_URL}/google-login`,
      { request: provider_token },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    
    console.log("Backend response:", response.data);
    
    if (response.data.UId) {
      await AsyncStorage.setItem('userId', response.data.UId);
    }
    
    return response.data;
  } catch (err) {
    console.error("Google redirect handler error:", err);
    throw err;
  }
};

// Export all functions individually AND as a default object
const firebaseServices = {
  registerUser,
  loginUser,
  signInWithGoogle,
  signInWithGoogleMobile,
  handleGoogleRedirect
};

export default firebaseServices;