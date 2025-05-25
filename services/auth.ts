 //services/auth.ts

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '~/supabase/supabase';
import { useRouter } from 'expo-router';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin'

// Complete any in-progress browser auth sessions
WebBrowser.maybeCompleteAuthSession();


/**
 * Mobile Google OAuth flow using Expo AuthSession & Supabase
 * Simplified version that handles navigation internally
 */
export async function signInWithGoogleMobile() {

  // 1) Build the Expo redirect URI
  const redirectUri = AuthSession.makeRedirectUri({
    // @ts-ignore: useProxy is supported at runtime
    useProxy: true,
    scheme: 'kwiyeh',         
  });
  console.log(redirectUri)
  // 2) Get the OAuth URL from Supabase
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      scopes: 'openid email profile',
    },
  });
  if (error) throw error;

  // 3) Launch the browser / webview using WebBrowser instead of AuthSession.startAsync
  // This fixes the "AuthSession.startAsync is not a function" error
  try {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url!,
      redirectUri
    );
    
    // 4) Evaluate the result
    if (result.type !== 'success') {
      throw new Error('Authentication cancelled or failed');
    }
    
    // 5) Retrieve the session from Supabase client
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No active session found');

    // 6) Persist user ID locally
    const userId = session.user.id;
    await AsyncStorage.setItem('userId', userId);

    // 7) Handle navigation internally
    const isClient = session.user.app_metadata?.role === 'client';
    const redirectPath = isClient ? '/client' : '/talent/modals/talent-skillForm';
    
    // Use navigation method available in the current context
    // Note: When using this in a component, you'd import useRouter directly in the component
    const router = useRouter();
    router.push(redirectPath);
    
    return {
      success: true,
      userId,
      redirectPath
    };
  } catch (error) {
    console.error('Auth session error:', error);
    throw error;
  }
}