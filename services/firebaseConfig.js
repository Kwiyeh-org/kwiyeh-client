 //services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa7ktXpOkuvnSozAlZYHfdxXjZ_bpvBoc",
  authDomain: "kwiyeh-26c18.firebaseapp.com",
  databaseURL: "https://kwiyeh-26c18-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kwiyeh-26c18",
  storageBucket: "kwiyeh-26c18.firebasestorage.app",
  messagingSenderId: "526766693911",
  appId: "1:526766693911:web:672827425f1a52bc4ec652"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Platform-specific auth initialization
export const auth = Platform.OS === 'web' 
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });