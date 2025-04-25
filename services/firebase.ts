import axios from 'axios';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '~/supabase/supabase';

// Complete any in-progress browser auth sessions
WebBrowser.maybeCompleteAuthSession();

// Base URL for your Spring Boot backend
const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8080'
  : 'http://192.168.115.33:8080';

// ─── Email / Password ────────────────────────────────────────────────────────

export const registerUser = async (userData: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/signup`,
    userData
  );
  // Backend returns: { "User created": "<uid>" } or { userId: '<uid>' }
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
  // data.localId is the UID, data.idToken may be needed for auth
  await AsyncStorage.multiSet([
    ['userId', data.localId],
    ['idToken', data.idToken],
  ]);
  return data;
};

// ─── Google OAuth (Supabase) ─────────────────────────────────────────────────

/**
 * Starts the Google sign-in flow.
 * On web, redirects to Supabase's OAuth endpoint;
 * on mobile, opens the system browser and then deep-links back.
 */
export const signInWithGoogle = async () => {
  console.log("signInWithGoogle called");
  try {
    const redirectPath = '/client-dashboard';
    const mobileRedirect = Linking.createURL(redirectPath);
    const webRedirect = window.location.origin + redirectPath;
    const redirectTo = Platform.OS === 'web' ? webRedirect : mobileRedirect;

    console.log("Using redirect URL:", redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      console.error("OAuth error:", error);
      throw error;
    }

    console.log("OAuth initiated successfully:", data);

    // Open the OAuth URL
    if (data.url) {
      if (Platform.OS === 'web') {
        window.location.href = data.url;
      } else {
        await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      }
    }

    return data;
  } catch (err) {
    console.error("signInWithGoogle failed:", err);
    throw err;
  }
};

/**
 * Call this with the full URL your app was opened with.
 * It will:
 *   • Complete the Supabase session
 *   • Extract Google's ID-token (`provider_token`)
 *   • Forward it to your Spring Boot backend (/google-login)
 */
export const handleGoogleRedirect = async (url: string) => {
  console.log("Processing redirect URL:", url);

  const { data, error } = await (supabase.auth as any).getSessionFromUrl({ url });
  if (error) {
    console.error("Supabase session error:", error);
    throw error;
  }

  console.log("Session obtained from URL:", data);

  if (!data?.session) {
    console.error("No session data obtained");
    throw new Error("Authentication failed: No session data");
  }

  const { provider_token, access_token } = data.session;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/google-login`,
      { request: provider_token },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    console.log("Backend response:", response.data);
    // Save the returned UID for future use
    if (response.data.UId) {
      await AsyncStorage.setItem('userId', response.data.UId);
    }
    return response.data;
  } catch (err) {
    console.error("Backend request failed:", err);
    throw err;
  }
};

// Export all functions individually AND as a default object
const firebaseServices = {
  registerUser,
  loginUser,
  signInWithGoogle,
  handleGoogleRedirect,
};

export default firebaseServices;
