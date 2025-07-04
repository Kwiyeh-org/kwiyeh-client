// app/signup-client.tsx
 

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
import {
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Import Firebase authentication related modules
import { auth } from "@/services/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from "firebase/auth";
import { useAuthStore } from '@/store/authStore';
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox as MobileCheckbox } from "~/components/ui/checkbox";
import { Checkbox as WebCheckbox } from "~/components/ui-web/web-checkbox";
import CountrySelect, {
  Country,
} from "~/components/country-component/CountrySelect";
import Entypo from "@expo/vector-icons/Entypo";
import { Formik } from "formik";
import * as Yup from "yup";
import { registerUser } from "@/services/firebase";
import { signInWithGoogle } from "@/services/firebase";
// import { signInWithGoogleMobile } from "~/services/auth";
import { signInWithGoogleMobile } from "@/services/firebase";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserRole } from '@/store/authStore';
import { handleGoogleAuth } from '@/services/googleAuthHandler';



// Validation schema
const SignupSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required and it should be of atleast 6 characters"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  agreedToTerms: Yup.boolean()
    .oneOf([true], "You must agree to the terms and conditions")
    .required("You must agree to the terms and conditions"),
});

export default function SignupClient() {
  const router = useRouter();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isGoogleSignInAvailable, setIsGoogleSignInAvailable] = useState(true);
  const {user,updateUser,isAuthenticated} = useAuthStore();

  // Redirect if already authenticated as client
  useEffect(() => {
    if (isAuthenticated && user?.role === 'client') {
      router.replace('/client');
    } else if (isAuthenticated && user?.role === 'talent') {
      // User is authenticated as talent, don't let them access client area
      Alert.alert('Access Denied', 'You are signed in as a talent. Please log out to access client features.');
      router.replace('/talent');
    }
  }, [isAuthenticated, user?.role]);

  // Only configure GoogleSignin on mobile
  if (Platform.OS !== 'web') {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      webClientId:
        "526766693911-33hjbi26mjndnijda5fgg5iaehm07g54.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }

  // Default country
  const initialCountry: Country = {
    name: "United States",
    dial_code: "+1",
    code: "US",
    flag: "🇺🇸",
  };
  const [selectedCountry, setSelectedCountry] =
    useState<Country>(initialCountry);

  // Platform-specific checkbox component
  const PlatformCheckbox = Platform.OS === "web" ? WebCheckbox : MobileCheckbox;

  // Check Google Sign-In availability on mobile
  useEffect(() => {
    async function checkGoogleSignInAvailability() {
      if (Platform.OS !== "web") {
        try {
          // Try to dynamically require the module
          const GoogleSigninModule = require("@react-native-google-signin/google-signin");
          setIsGoogleSignInAvailable(true);
        } catch (error) {
          console.warn("Google Sign-In module not available:", error);
          setIsGoogleSignInAvailable(false);
        }
      }
    }

    checkGoogleSignInAvailability();
  }, []);

  // Handle signup submission with improved error handling
  const handleSubmit = async (values: any) => {
    try {
      setIsSigningUp(true);

      const formattedPhone = `${selectedCountry.dial_code}${values.phoneNumber}`;

      console.log("Attempting to register with:", {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: formattedPhone,
      });

      const response = await registerUser({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: formattedPhone,
        password: values.password,
        role: 'client',
      });
      
      // Extract Firebase UID from backend
              const userId = response.uid || response.localId;
      if (!userId) {
        throw new Error('No user ID received from server');
      }

      // === STORE idToken for protected requests ===
      if (Platform.OS === 'web') {
        if (response.idToken) {
          localStorage.setItem('idToken', response.idToken);
          console.log('[signup-client] idToken stored in localStorage:', response.idToken);
        } else if (auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken(true);
          localStorage.setItem('idToken', idToken);
          console.log('[signup-client] idToken stored in localStorage (from auth):', idToken);
        }
      } else {
        if (response.idToken) {
          await AsyncStorage.setItem('idToken', response.idToken);
          console.log('[signup-client] idToken stored in AsyncStorage:', response.idToken);
        } else if (auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken(true);
          await AsyncStorage.setItem('idToken', idToken);
          console.log('[signup-client] idToken stored in AsyncStorage (from auth):', idToken);
        }
      }
      // === END idToken storage ===

      const userData = {
        id: userId, // Use Firebase UID from backend
        name: response.fullName || response.displayName || response.name || values.fullName,
        email: response.email,
        photoURL: response.photoURL || null,
        role: response.role || 'client',
        phoneNumber: response.phoneNumber || '',
        location: response.location || null,
      };
      console.log(userData, "userData");
      updateUser(userData);
      
      // Validate UID consistency after signup
      try {
        const { validateUIDConsistency } = require('@/services/firebase');
        await validateUIDConsistency();
      } catch (validationError) {
        console.warn('[signup-client] UID validation failed:', validationError);
      }
      
      router.replace("/client");
    } catch (error: any) {
      console.error("Detailed error:", JSON.stringify(error, null, 2));

      if (error.message === "Email already in use") {
        Alert.alert("Signup Failed", "This email is already in use.");
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
          "Signup Failed",
          `Error: ${
            error.message || "Unknown error occurred"
          }. Please try again.`
        );
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  // Google Sign-In handler for both web and mobile
  const handleGoogleSignup = async () => {
    try {
      setIsSigningUp(true);
      const result = await handleGoogleAuth('client');
      if (result && result.success && result.user) {
        updateUser(result.user); // Ensure sync
        
        // Validate UID consistency after Google signup
        try {
          const { validateUIDConsistency } = require('@/services/firebase');
          await validateUIDConsistency();
        } catch (validationError) {
          console.warn('[signup-client-google] UID validation failed:', validationError);
        }
        
        router.replace('/client');
      } else {
        Alert.alert('Google Signup Failed', 'Could not authenticate user.');
      }
    } catch (error: any) {
      Alert.alert('Google Signup Failed', error.message || 'Authentication failed');
    } finally {
      setIsSigningUp(false);
    }
  };

  // Navigate to login page
  const handleLogin = () => {
    router.push("/login-client");
  };

  // Back button navigation
  const handleBackNavigation = () => {
    router.back();
  };

  // Background image per platform
  const backgroundSource =
    Platform.OS === "web"
      ? require("@/assets/images/Desktoplogin-background.svg")
      : require("@/assets/images/signup-background.png");

  // Define web-specific styles to use with proper typing
  const webImageBackgroundStyle =
    Platform.OS === "web"
      ? ({
          minHeight: "100%",
          maxHeight: "100%",
          overflow: "hidden",
          backgroundSize: "cover",
          backgroundPosition: "center",
        } as unknown as ViewStyle)
      : undefined;

  const webScrollViewStyle =
    Platform.OS === "web"
      ? ({
          maxHeight: "100%",
        } as ViewStyle)
      : undefined;

  // Google sign-in button text based on availability and platform
  const getGoogleButtonText = () => {
    if (isSigningUp) return "Processing...";
    if (Platform.OS !== "web" && !isGoogleSignInAvailable) {
      return "Google Sign-In Unavailable";
    }
    return "Sign up with Google";
  };

  return (
    <ImageBackground
      source={backgroundSource}
      style={[styles.backgroundImage, webImageBackgroundStyle]}
      resizeMode="cover"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        style={webScrollViewStyle}
      >
        <View style={styles.container}>
          {Platform.OS !== "web" && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackNavigation}
              accessibilityLabel="Go back"
            >
              <Entypo name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
          )}

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sign up</Text>
            <Text style={styles.headerSubtitle}>
              Create your Kwiyeh account
            </Text>
          </View>

          <Formik
            initialValues={{
              fullName: "",
              email: "",
              phoneNumber: "",
              password: "",
              confirmPassword: "",
              agreedToTerms: false,
            }}
            validationSchema={SignupSchema}
            onSubmit={handleSubmit}
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
                  {/* Full Name */}
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="Full name"
                      value={values.fullName}
                      onChangeText={handleChange("fullName")}
                      onBlur={handleBlur("fullName")}
                      className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
                      placeholderTextColor="#A0A0A0"
                      accessibilityLabel="Full name input"
                    />
                    {touched.fullName && errors.fullName && (
                      <Text style={styles.errorText}>{errors.fullName}</Text>
                    )}
                  </View>

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

                  {/* Phone Number */}
                  <View style={styles.inputContainer}>
                    <View className="bg-white rounded-xl px-4 border border-[#90EE90] flex-row items-center">
                      <CountrySelect
                        selectedCountry={selectedCountry}
                        setSelectedCountry={setSelectedCountry}
                      />
                      <Input
                        placeholder="Phone number"
                        keyboardType="phone-pad"
                        value={values.phoneNumber}
                        onChangeText={handleChange("phoneNumber")}
                        onBlur={handleBlur("phoneNumber")}
                        placeholderTextColor="#A0A0A0"
                        className="flex-1 ml-2"
                        accessibilityLabel="Phone number input"
                      />
                    </View>
                    {touched.phoneNumber && errors.phoneNumber && (
                      <Text style={styles.errorText}>{errors.phoneNumber}</Text>
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

                  {/* Confirm Password */}
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="Confirm password"
                      secureTextEntry
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
                      placeholderTextColor="#A0A0A0"
                      accessibilityLabel="Confirm password input"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Terms & Conditions */}
                <View style={styles.termsContainer}>
                  <View style={styles.checkboxContainer}>
                    <PlatformCheckbox
                      checked={values.agreedToTerms}
                      onCheckedChange={(checked) => {
                        setFieldValue("agreedToTerms", checked);
                      }}
                      className="mr-2"
                      accessibilityLabel="Agree to terms and conditions"
                    />
                  </View>
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      I agree to the{" "}
                      <Text
                        style={styles.linkText}
                        onPress={() =>
                          Alert.alert(
                            "Terms & Conditions",
                            "Terms and conditions will be displayed here."
                          )
                        }
                      >
                        terms and conditions
                      </Text>
                    </Text>
                    {touched.agreedToTerms && errors.agreedToTerms && (
                      <Text style={styles.errorText}>
                        {errors.agreedToTerms}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Signup Button */}
                <Button
                  className={`py-4 rounded-full mb-4 ${
                    values.agreedToTerms && isValid
                      ? "bg-green-800"
                      : "bg-green-800 opacity-50"
                  }`}
                  onPress={() => handleSubmit()}
                  disabled={!values.agreedToTerms || !isValid || isSigningUp}
                  accessibilityLabel="Sign up button"
                >
                  <Text className="text-white text-lg font-semibold">
                    {isSigningUp ? "Signing up..." : "Sign up"}
                  </Text>
                </Button>
              </>
            )}
          </Formik>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text
                style={[
                  styles.linkText,
                  Platform.OS === "web" ? styles.webLinkText : {},
                ]}
                onPress={handleLogin}
                accessibilityRole="link"
                accessibilityLabel="Login"
              >
                Login
              </Text>
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Conditional rendering based on platform */}
          {Platform.OS === "web" ? (
            /* Web Google Sign-In Button */
            <Button
              className="bg-white border border-gray-300 rounded-full py-3 flex-row justify-center items-center mb-4"
              onPress={handleGoogleSignup}
              disabled={isSigningUp}
              accessibilityLabel="Sign up with Google"
            >
              <Text style={{ color: '#757575', fontWeight: '500' }}>
                {isSigningUp ? 'Processing...' : 'Sign up with Google'}
              </Text>
            </Button>
          ) : (
            /* Mobile Google Sign-In Button */
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignup}
            />
          )}

          {/* Display a warning message if Google Sign-In is not available on mobile */}
          {Platform.OS !== "web" && !isGoogleSignInAvailable && (
            <Text style={styles.warningText}>
              Google Sign-In is not available. Please install the required
              module or sign up with email and password.
            </Text>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// Define combined style type
type Styles = {
  backgroundImage: ViewStyle;
  container: ViewStyle;
  backButton: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  formFields: ViewStyle;
  inputContainer: ViewStyle;
  errorText: TextStyle;
  warningText: TextStyle;
  termsContainer: ViewStyle;
  checkboxContainer: ViewStyle;
  termsTextContainer: ViewStyle;
  termsText: TextStyle;
  linkText: TextStyle;
  webLinkText: TextStyle;
  loginLinkContainer: ViewStyle;
  loginText: TextStyle;
  divider: ViewStyle;
  dividerLine: ViewStyle;
  dividerText: TextStyle;
  googleButtonContent: ViewStyle;
  googleIconContainer: ViewStyle;
  googleButtonText: TextStyle;
};

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
  backButton: {
    marginBottom: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
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
  warningText: {
    color: "orange",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 24,
    marginBottom: 24,
  },
  checkboxContainer: {
    marginTop: 4,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  termsText: {
    color: "black",
  },
  linkText: {
    color: "blue",
  },
  webLinkText: {
    textDecorationLine: "none",
    cursor: "pointer",
  },
  loginLinkContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  loginText: {
    color: "black",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "black",
    opacity: 0.2,
  },
  dividerText: {
    marginHorizontal: 16,
    color: "black",
    opacity: 0.5,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconContainer: {
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#757575",
  },
});