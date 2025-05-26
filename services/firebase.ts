 // services/firebase.ts

   import axios from 'axios';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : 'http://192.168.70.33:8080';

// ---- GOOGLE SIGN-IN: Separate for client/talent ----

export async function signInWithGoogleMobile(
  redirectPath: '/client' | '/talent/modals/talent-skillForm' = '/client',
  isTalent?: boolean
): Promise<{ success: boolean; userId: string; redirectPath: string }> {
  const redirectUri = AuthSession.makeRedirectUri({
    // @ts-ignore
    useProxy: true,
    scheme: 'kwiyeh',
  });

  try {
    const firebaseConfig = require('./firebaseConfig').default || require('./firebaseConfig');
    const clientId = process.env.GOOGLE_WEB_CLIENT_ID || firebaseConfig.apiKey;

    const result = await WebBrowser.openAuthSessionAsync(
      `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token id_token&` +
        `scope=openid%20email%20profile&` +
        `nonce=${Date.now()}`,
      redirectUri
    );

    if (result.type !== 'success') {
      throw new Error('Authentication cancelled or failed');
    }

    const [, hash] = result.url.split('#');
    const params = Object.fromEntries(new URLSearchParams(hash));
    const idToken = params.id_token;
    if (!idToken) throw new Error('No ID token returned');

    const credential = GoogleAuthProvider.credential(idToken);
    const userCred = await signInWithCredential(auth, credential);
    const userId = userCred.user.uid;
    const displayName = userCred.user.displayName || "";

    // --- CRUCIAL LOGIC: set only one ---
    if (isTalent) {
  const existingTalentName = await AsyncStorage.getItem('talentName');
  if (!existingTalentName || existingTalentName.trim() === "") {
    await AsyncStorage.setItem('talentName', displayName);
  }
} else {
  const existingUserName = await AsyncStorage.getItem('userName');
  if (!existingUserName || existingUserName.trim() === "") {
    await AsyncStorage.setItem('userName', displayName);
  }
}
    await AsyncStorage.setItem('userId', userId);

    return {
      success: true,
      userId,
      redirectPath,
    };
  } catch (error) {
    console.error('Auth session error:', error);
    throw error;
  }
}

// ---- EMAIL/PASSWORD SIGNUP ----
export const registerUser = async (userData: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  isTalent?: boolean;
}) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/signup`,
    userData
  );
  const userId = data.userId ?? data['User created'];
  const userName = userData.fullName || "";
  if (userId) {
    await AsyncStorage.setItem('userId', userId);
    if (userData.isTalent) {
      await AsyncStorage.setItem('talentName', userName);
      // DO NOT set userName
    } else {
      await AsyncStorage.setItem('userName', userName);
      // DO NOT set talentName
    }
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
    // Name is not available at this step
  ]);
  return data;
};

// ---- UNIFIED GOOGLE SIGN-IN HANDLER ----
export const signInWithGoogle = async (
  redirectPath: '/client' | '/talent/modals/talent-skillForm' = '/client',
  isTalent?: boolean
) => {
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const userId = result.user.uid;
      const displayName = result.user.displayName || "";
      if (isTalent) {
        const existingTalentName = await AsyncStorage.getItem('talentName');
        if (!existingTalentName || existingTalentName.trim() === "") {
          await AsyncStorage.setItem('talentName', displayName);
        }
      } else {
        const existingUserName = await AsyncStorage.getItem('userName');
        if (!existingUserName || existingUserName.trim() === "") {
          await AsyncStorage.setItem('userName', displayName);
        }
      }
      await AsyncStorage.setItem('userId', userId);

      window.location.href = redirectPath;
      return { success: true, userId, redirectPath };
    } catch (e: any) {
      console.error('Web Google Sign-In error', e);
      throw e;
    }
  } else {
    return await signInWithGoogleMobile(redirectPath, isTalent);
  }
};

export default {
  registerUser,
  loginUser,
  signInWithGoogle,
  signInWithGoogleMobile,
};
