 // app/_layout.tsx

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

      {/* 
        CHANGE: 'initialRouteName' set to 'index' 
        so that your 'index.tsx' will load first 
      */}
      <Stack initialRouteName="index">
        {/* 'index.tsx' instantly redirects to '/user-type' */}
        <Stack.Screen
          name="index"
          options={{
            title: "Start", 
            headerShown: false,
            headerRight: () => <ThemeToggle />,
          }}
        />

        {/* Where the user chooses client or talent */}
        <Stack.Screen
          name="user-type"
          options={{
            title: "Select Your Role",
            headerShown: false,
            headerRight: () => <ThemeToggle />,
          }}
        />

        {/* Client signup */}
        <Stack.Screen
          name="signup-client"
          options={{
            title: "Client Signup",
            headerShown: false,
            headerRight: () => <ThemeToggle />,
          }}
        />

        {/* Talent signup */}
        <Stack.Screen
          name="signup-talent"
          options={{
            title: "Talent Signup",
            headerShown: false,
            headerRight: () => <ThemeToggle />,
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
