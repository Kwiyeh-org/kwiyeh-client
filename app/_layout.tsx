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
import * as React from "react";
import { useColorScheme } from "react-native";
// Remove all references to ~/lib/*

export {
  // Catch any errors thrown by the Layout component
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      {/* The StatusBar adapts to light/dark theme accordingly */}
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
            // Remove headerRight if it used ThemeToggle from ~/components/ThemeToggle
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
          name="talent-forgot-password"
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
