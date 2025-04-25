 // supabase/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Your Supabase credentials
export const SUPABASE_URL = 'https://ujmvrowdpgqlkrjbwcdo.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbXZyb3dkcGdxbGtyamJ3Y2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NjE1NTIsImV4cCI6MjA2MTAzNzU1Mn0.dFO2cnN31uoXGAn59lpd0KmzXtAIXZUGcrB6PgzjM6c';

// Conditionally pick storage to avoid AsyncStorage on server
const getStorage = () => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } else {
    // require inside non-web branch to avoid SSR loading
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: getStorage(),
    detectSessionInUrl: Platform.OS === 'web',
    autoRefreshToken: true,
    persistSession: true,
  },
});