 // app/_layout.tsx
 
  'use client';
import "~/global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
// Add these imports:
import { useAuthStore } from "@/store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Catch errors as before
export {
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // --- HYDRATE ZUSTAND STORE ON LOAD ---
  const { updateUser, logout } = useAuthStore();

  useEffect(() => {
    async function hydrateUser() {
      let userData = null;
      // Platform detection: window === undefined means native
      if (typeof window !== "undefined" && window.localStorage) {
        // Web
        const stored = localStorage.getItem("auth-storage");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            userData = parsed.state?.user || null;
          } catch (e) {
            userData = null;
          }
        }
      } else {
        // Mobile/Native
        const stored = await AsyncStorage.getItem("auth-storage");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            userData = parsed.state?.user || null;
          } catch (e) {
            userData = null;
          }
        }
      }
      if (userData) {
        updateUser(userData);
      } else {
        logout();
      }
    }
    hydrateUser();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- REST OF LAYOUT AS BEFORE ---
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack initialRouteName="index">
        <Stack.Screen
          name="index"
          options={{
            title: "Onboarding", 
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user-type"
          options={{
            title: "Select Your Role",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup-client"
          options={{
            title: "Client Signup",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login-client"
          options={{
            title: "Client Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="client-forgot-password"
          options={{
            title: "client-forgot-password",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="client-email-verification"
          options={{
            title: "client-email-verification",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="client-reset-password"
          options={{
            title: "client-reset-password",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup-talent"
          options={{
            title: "Talent Signup",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login-talent"
          options={{
            title: "Talent Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="talent-forget-password"
          options={{
            title: "talent forgot password",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="talent-email-verification"
          options={{
            title: "talent email verification",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="talent-reset-password"
          options={{
            title: "talent reset password",
            headerShown: false,
          }}
        />
        <Stack.Screen name="client" options={{ headerShown: false }} />
        <Stack.Screen name="talent" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
