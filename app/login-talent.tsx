 // app/login-talent.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox as MobileCheckbox } from "~/components/ui/checkbox"; // Your existing checkbox
import { Checkbox as WebCheckbox } from "~/components/ui-web/web-checkbox"; // Your new web checkbox
import { Formik } from "formik";
import * as Yup from "yup";
import { loginUser } from "~/app/services/firebase";

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  rememberMe: Yup.boolean(),
});

export default function Login() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Platform-specific checkbox component
  const PlatformCheckbox = Platform.OS === "web" ? WebCheckbox : MobileCheckbox;

  // Handle login with proper validation
  const handleLogin = async (values: { email: string; password: string; rememberMe: boolean }) => {
    try {
      setIsLoggingIn(true);

      console.log("Attempting to login with:", {
        email: values.email
      });

      await loginUser(values.email, values.password);

      // Navigate to talent dashboard after successful login
      router.push("/talent-skillForm");
    } catch (error: any) {
      console.error("Login error details:", JSON.stringify(error, null, 2));
      
      if (error.response?.status === 401) {
        Alert.alert("Login Failed", "Invalid email or password.");
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        Alert.alert(
          "Network Error", 
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        Alert.alert(
          "Login Failed", 
          `Error: ${error.message || "Unknown error occurred"}. Please try again.`
        );
      }
      console.error("Login error type:", typeof error);
      console.error("Login error message:", error.message);
      console.error("Login error code:", error.code);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateAccount = () => {
    // Navigate directly to talent signup
    router.push("/signup-talent");
  };

  const handleForgotPassword = () => {
    Alert.alert("Reset Password", "Password reset functionality will be implemented soon.");
  };

  // Background image based on platform
  const backgroundSource =
    Platform.OS === "web"
      ? require("@/assets/images/Desktoplogin-background.png")
      : require("@/assets/images/signup-background.png");

  return (
    <ImageBackground
      source={backgroundSource}
      style={[styles.backgroundImage, Platform.OS === 'web' ? styles.webContainer : null]}
      resizeMode="cover"
    >
      <ScrollView 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        style={Platform.OS === 'web' ? styles.webScrollView : {}}
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
                      <Text style={styles.errorText}>
                        {errors.email}
                      </Text>
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
                      <Text style={styles.errorText}>
                        {errors.password}
                      </Text>
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
                  <TouchableOpacity onPress={handleForgotPassword} accessibilityLabel="Forgot password">
                    <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <Button
                  className={`py-4 rounded-full mb-4 ${
                    isValid
                      ? "bg-green-800"
                      : "bg-green-800 opacity-50"
                  }`}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || isLoggingIn}
                  accessibilityLabel="Login button"
                >
                  <Text className="text-white text-lg font-semibold">
                    {isLoggingIn ? "Logging in..." : "Login"}
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
                style={[styles.linkText, Platform.OS === "web" ? styles.webLinkText : {}]}
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

// StyleSheet with responsive values and platform-specific styles
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  webContainer: {
    minHeight: '100vh' as any,
    maxHeight: '100vh' as any,
    overflow: 'hidden' as any,
  },
  webScrollView: {
    maxHeight: '100vh' as any,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    maxWidth: 520,
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: Platform.OS === 'web' ? 40 : 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    color: 'black',
  },
  formFields: {
    marginBottom: 24,
    gap: Platform.OS === 'web' ? 12 : 6,
  },
  inputContainer: {
    marginBottom: Platform.OS === 'web' ? 16 : 12,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxWrapper: {
    marginTop: 1,
    marginRight: 8,
  },
  rememberText: {
    color: 'black',
  },
  forgotPasswordText: {
    color: 'blue',
  },
  createAccountContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  createAccountText: {
    color: 'black',
  },
  linkText: {
    color: 'blue',
  },
  webLinkText: {
    textDecorationLine: 'none' as any,
    cursor: 'pointer' as any,
  },
});