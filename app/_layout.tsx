 // app/_layout.tsx
 
'use client';
import "~/global.css";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { ThemeToggle } from "~/components/ThemeToggle";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";


const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!hasMounted.current) {
      if (Platform.OS === "web") {
        // On web, apply a background class to the html element
        document.documentElement.classList.add("bg-background");
      }
      // Handle Android navigation bar styling
      setAndroidNavigationBar(colorScheme);
      setIsColorSchemeLoaded(true);
      hasMounted.current = true;
    }
  }, [colorScheme]);

  if (!isColorSchemeLoaded) {
    return null; // Wait until color scheme is set up
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      {/* The StatusBar adapts to light/dark theme accordingly */}
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />

      {/* Our main stack navigator - keeping index as initialRouteName */}
      <Stack initialRouteName="index">
        {/* Onboarding screen that displays slides - first screen users see */}
        <Stack.Screen
          name="index"
          options={{
            title: "Onboarding", 
            headerShown: false,
          }}
        />

        {/* Where the user chooses client or talent - comes after onboarding */}
        <Stack.Screen
          name="user-type"
          options={{
            title: "Select Your Role",
            headerShown: false,
            headerRight: () => <ThemeToggle />,
          }}
        />

        {/* Client signup - comes after choosing client role */}
        <Stack.Screen
          name="signup-client"
          options={{
            title: "Client Signup",
            headerShown: false,
            headerRight: () => <ThemeToggle />,
          }}
        />

        {/* Client login - accessible from client signup */}
        <Stack.Screen
          name="login-client"
          options={{
            title: "Client Login",
            headerShown: false,
          }}
        />

        {/* Client Dashboard - after successful client login */}
        <Stack.Screen
          name="client-dashboard"
          options={{
            title: "Client Dashboard",
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

        {/* Talent signup - comes after choosing talent role */}
        <Stack.Screen
          name="signup-talent"
          options={{
            title: "Talent Signup",
            headerShown: false,
            headerRight: () => <ThemeToggle />,
          }}
        />

        {/* Talent login - accessible from talent signup */}
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
            title: "talent-forgot-password",
            headerShown: false,
          }}
        />

        {/* Talent Skill Form - after successful talent login */}
        <Stack.Screen
          name="talent-skillForm"
          options={{
            title: "Talent Skills",
            headerShown: false,
          }}
        />


        

        {/* 
          The not-found screen is automatically handled 
          by expo-router's fallback, so no explicit route needed here. 
        */}
      </Stack>

      <PortalHost />
    </ThemeProvider>
  );
}