// app/login-client.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox as MobileCheckbox } from "~/components/ui/checkbox"; // Your existing checkbox
import { Checkbox as WebCheckbox } from "~/components/ui-web/web-checkbox"; // Your new web checkbox
import { Formik } from "formik";
import * as Yup from "yup";
import { loginUser } from "~/services/firebase";
import { useAuthStore } from '@/store/authStore';
import { handleGoogleAuth } from '@/services/googleAuthHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  rememberMe: Yup.boolean(),
});

export default function Login() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const {updateUser,user,isAuthenticated} = useAuthStore();

  // Redirect if already authenticated as client
  useEffect(() => {
    // Add a small delay to ensure root layout is mounted
    const timer = setTimeout(() => {
      if (isAuthenticated && user?.role === 'client') {
        router.replace('/client');
      } else if (isAuthenticated && user?.role === 'talent') {
        // User is authenticated as talent, don't let them access client area
        Alert.alert('Access Denied', 'You are signed in as a talent. Please log out to access client features.');
        router.replace('/talent');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user?.role]);

  // Platform-specific checkbox component
  const PlatformCheckbox = Platform.OS === "web" ? WebCheckbox : MobileCheckbox;

  // Handle login with proper validation
  const handleLogin = async (values: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    try {
      setIsLoggingIn(true);

      console.log("Attempting to login with:", {
        email: values.email,
      });

      const data = await loginUser(values.email, values.password, 'client');
      console.log("[login-client] loginUser response:", data);
      
      // Extract Firebase UID from backend response
      const userId = data.uid || data.localId;
      if (!userId) {
        throw new Error('No user ID received from server');
      }
      
      // Store idToken for protected requests
      if (Platform.OS === 'web') {
        localStorage.setItem('idToken', data.idToken);
        console.log('[login] idToken stored in localStorage (web)');
      } else {
        await AsyncStorage.setItem('idToken', data.idToken);
        console.log('[login] idToken stored in AsyncStorage (mobile)');
      }
      
      updateUser({
        id: userId, // Use Firebase UID from backend
        name: data.fullName || data.displayName || data.name || '',
        email: data.email,
        photoURL: data.clientImageUrl || data.photoURL || null,
        role: data.role || 'client',
        phoneNumber: data.phoneNumber || '',
        location: data.location || null,
      });
      console.log('[login-client] updateUser called with:', {
        id: userId,
        name: data.fullName || data.displayName || data.name || '',
        email: data.email,
        photoURL: data.clientImageUrl || data.photoURL || null,
        role: data.role || 'client',
        phoneNumber: data.phoneNumber || '',
        location: data.location || null,
      });
      
      // Validate UID consistency after login
      try {
        const { validateUIDConsistency } = require('@/services/firebase');
        await validateUIDConsistency();
        console.log('[login-client] UID consistency validated');
      } catch (validationError) {
        console.warn('[login-client] UID validation failed:', validationError);
      }
      
      console.log(user,"user data")
      
      // Navigate to client dashboard after successful login
      router.replace("/client");
    } catch (error: any) {
      console.error("Login error details:", JSON.stringify(error, null, 2));
      console.log('[login-client] Login error:', error);

      if (error.message?.includes("This email is registered as a")) {
        Alert.alert("Login Failed", error.message);
      } else if (error.response?.status === 401) {
        Alert.alert("Login Failed", "Invalid email or password.");
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.message?.includes("Network Error")
      ) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        Alert.alert(
          "Login Failed",
          `Error: ${
            error.message || "Unknown error occurred"
          }. Please try again.`
        );
      }
      console.error("Login error type:", typeof error);
      console.error("Login error message:", error.message);
      console.error("Login error code:", error.code);
    } finally {
      setIsLoggingIn(false);
      console.log('[login-client] Login process finished');
    }
  };

  const handleCreateAccount = () => {
    // Navigate directly to client signup
    router.push("/signup-client");
  };

  const handleForgotPassword = () => {
    // Navigate to the client-forgot-password page
    router.push("/client-forgot-password");
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      console.log('[login-client] Attempting Google login');
      const result = await handleGoogleAuth('client');
      console.log('[login-client] Google login result:', result);
      if (result && result.success && result.user) {
        updateUser(result.user); // Ensure sync
        console.log('[login-client] updateUser called with Google user:', result.user);
        
        // Validate UID consistency after Google login
        try {
          const { validateUIDConsistency } = require('@/services/firebase');
          await validateUIDConsistency();
          console.log('[login-client-google] UID consistency validated');
        } catch (validationError) {
          console.warn('[login-client-google] UID validation failed:', validationError);
        }
        
        router.replace('/client');
      } else {
        Alert.alert('Google Login Failed', 'Could not authenticate user.');
        console.log('[login-client] Google login failed: No user in result');
      }
    } catch (error: any) {
      if (error.message?.includes("This email is already in use for this role.")) {
        Alert.alert('Google Login Failed', 'This email is already in use for this role.');
      } else if (error.message?.includes("This email is registered as a")) {
        Alert.alert('Google Login Failed', error.message);
      } else {
        Alert.alert('Google Login Failed', error.message || 'Authentication failed');
      }
      console.error('[login-client] Google login error:', error);
    } finally {
      setIsLoggingIn(false);
      console.log('[login-client] Google login process finished');
    }
  };

  // Background image based on platform
  const backgroundSource =
    Platform.OS === "web"
      ? require("@/assets/images/Desktoplogin-background.svg")
      : require("@/assets/images/signup-background.png");

  // Define web-specific styles to use with proper typing
  const webImageBackgroundStyle = Platform.OS === "web" ? {
    minHeight: "100%",
    maxHeight: "100%",
    overflow: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
  } as unknown as ViewStyle : undefined;

  const webScrollViewStyle = Platform.OS === "web" ? {
    maxHeight: "100%",
  } as ViewStyle : undefined;

  return (
    <ImageBackground
      source={backgroundSource}
      style={[
        styles.backgroundImage,
        webImageBackgroundStyle,
      ]}
      resizeMode="cover"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        style={webScrollViewStyle}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Login</Text>
            <Text style={styles.headerSubtitle}>Welcome back to Kwiyeh</Text>
          </View>

          <Formik
            initialValues={{
              email: "",
              password: "",
              rememberMe: false,
            }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
              isValid,
            }) => (
              <>
                {/* Input Fields */}
                <View style={styles.formFields}>
                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="Email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
                      placeholderTextColor="#A0A0A0"
                      accessibilityLabel="Email input"
                    />
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  {/* Password */}
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="Password"
                      secureTextEntry
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
                      placeholderTextColor="#A0A0A0"
                      accessibilityLabel="Password input"
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>
                </View>

                {/* Remember Me and Forgot Password */}
                <View style={styles.rememberContainer}>
                  <View style={styles.checkboxContainer}>
                    <View style={styles.checkboxWrapper}>
                      <PlatformCheckbox
                        checked={values.rememberMe}
                        onCheckedChange={(checked) => {
                          setFieldValue("rememberMe", checked);
                        }}
                        className="mr-2"
                        accessibilityLabel="Remember me"
                      />
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    accessibilityLabel="Forgot password"
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot your password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <Button
                  className={`py-4 rounded-full mb-4 ${
                    isValid ? "bg-green-800" : "bg-green-800 opacity-50"
                  }`}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || isLoggingIn}
                  accessibilityLabel="Login button"
                >
                  <Text className="text-white text-lg font-semibold">
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </Text>
                </Button>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  className="bg-white border border-gray-300 rounded-full py-3 flex-row justify-center items-center mb-4"
                  onPress={handleGoogleLogin}
                  disabled={isLoggingIn}
                  accessibilityLabel="Sign in with Google"
                >
                  <Text style={{ color: '#757575', fontWeight: '500' }}>
                    {isLoggingIn ? 'Processing...' : 'Sign in with Google'}
                  </Text>
                </Button>
              </>
            )}
          </Formik>

          {/* Create Account Link */}
          <View style={styles.createAccountContainer}>
            <Text style={styles.createAccountText}>
              Don't have an account?{" "}
              <Text
                style={[
                  styles.linkText,
                  Platform.OS === "web" ? styles.webLinkText : {},
                ]}
                onPress={handleCreateAccount}
                accessibilityRole="link"
                accessibilityLabel="Create account"
              >
                Create an account
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// Define combined style type
type Styles = {
  backgroundImage: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  formFields: ViewStyle;
  inputContainer: ViewStyle;
  errorText: TextStyle;
  rememberContainer: ViewStyle;
  checkboxContainer: ViewStyle;
  checkboxWrapper: ViewStyle;
  rememberText: TextStyle;
  forgotPasswordText: TextStyle;
  createAccountContainer: ViewStyle;
  createAccountText: TextStyle;
  linkText: TextStyle;
  webLinkText: TextStyle;
  divider: ViewStyle;
  dividerLine: ViewStyle;
  dividerText: TextStyle;
}

// StyleSheet with responsive values and platform-specific styles
const styles = StyleSheet.create<Styles>({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "web" ? 48 : 24,
    paddingBottom: 32,
    maxWidth: 520,
    marginHorizontal: "auto",
    width: "100%",
  },
  header: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: Platform.OS === "web" ? 40 : 32,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: Platform.OS === "web" ? 20 : 18,
    color: "black",
  },
  formFields: {
    marginBottom: 24,
    gap: Platform.OS === "web" ? 12 : 6,
  },
  inputContainer: {
    marginBottom: Platform.OS === "web" ? 16 : 12,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
  rememberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxWrapper: {
    marginTop: 1,
    marginRight: 8,
  },
  rememberText: {
    color: "black",
  },
  forgotPasswordText: {
    color: "blue",
  },
  createAccountContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  createAccountText: {
    color: "black",
  },
  linkText: {
    color: "blue",
  },
  webLinkText: {
    textDecorationLine: "none",
    cursor: "pointer",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#757575",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#757575",
  },
});