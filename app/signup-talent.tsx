 // app/signup-talent.tsx

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
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { auth } from "@/services/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from "firebase/auth";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox as MobileCheckbox } from "~/components/ui/checkbox";
import { Checkbox as WebCheckbox } from "~/components/ui-web/web-checkbox";
import CountrySelect, { Country } from "~/components/country-component/CountrySelect";
import Entypo from "@expo/vector-icons/Entypo";
import { Formik } from "formik";
import * as Yup from "yup";
import { registerUser } from "@/services/firebase";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserRole } from '@/store/authStore';
import { useAuthStore } from '@/store/authStore'; 

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

export default function SignupTalent() {
  const router = useRouter();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isGoogleSignInAvailable, setIsGoogleSignInAvailable] = useState(true);

  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    webClientId:
      "526766693911-33hjbi26mjndnijda5fgg5iaehm07g54.apps.googleusercontent.com",
    offlineAccess: true,
  });

  // Default country
  const initialCountry: Country = {
    name: "United States",
    dial_code: "+1",
    code: "US",
    flag: "🇺🇸",
  };
  const [selectedCountry, setSelectedCountry] = useState<Country>(initialCountry);

  // Platform-specific checkbox component
  const PlatformCheckbox = Platform.OS === "web" ? WebCheckbox : MobileCheckbox;

  useEffect(() => {
    async function checkGoogleSignInAvailability() {
      if (Platform.OS !== "web") {
        try {
          require("@react-native-google-signin/google-signin");
          setIsGoogleSignInAvailable(true);
        } catch (error) {
          setIsGoogleSignInAvailable(false);
        }
      }
    }
    checkGoogleSignInAvailability();
  }, []);

  // Handle signup with email/password
  const handleSubmit = async (values: any) => {
    try {
      setIsSigningUp(true);
      const formattedPhone = `${selectedCountry.dial_code}${values.phoneNumber}`;

      await registerUser({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: formattedPhone,
        password: values.password,
        isTalent: true,
      }as any);

       const userId = await AsyncStorage.getItem('userId');

 const userData = {
   id:          userId!,
    name:        values.fullName,
    email:       values.email,
    photoURL:    null,
    role:         'talent' as UserRole,
    phoneNumber: formattedPhone,
  };
 useAuthStore.getState().updateUser(userData);                            // ← INSERT HERE
 router.push("/talent/modals/talent-skillForm");
      
    } catch (error: any) {
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
          `Error: ${error.message || "Unknown error occurred"}. Please try again.`
        );
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  // Google Sign-In handler for both web and mobile
const handleGoogleSignIn = async () => {
  try {
    setIsSigningUp(true);

    // --- MOBILE (React Native) ---
    if (Platform.OS !== "web") {
      try {
        await GoogleSignin.signOut();
      } catch {}

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error("No ID token present!");

      // Firebase login
      const credential = GoogleAuthProvider.credential(idToken);
      const userCred = await signInWithCredential(auth, credential);

      // Save display name as talentName ONLY if not present
      const displayName = userCred.user.displayName || "";
      const existingTalentName = await AsyncStorage.getItem("talentName");
      if (!existingTalentName || existingTalentName.trim() === "") {
        await AsyncStorage.setItem("talentName", displayName);
      }
      await AsyncStorage.setItem("userId", userCred.user.uid);

      router.replace("/talent/modals/talent-skillForm");
      return;
    }

    // --- WEB ---
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);

    const displayName = result.user.displayName || "";
    const existingTalentName = await AsyncStorage.getItem("talentName");
    if (!existingTalentName || existingTalentName.trim() === "") {
      await AsyncStorage.setItem("talentName", displayName);
    }
    await AsyncStorage.setItem("userId", result.user.uid);

    window.location.href = "/talent/modals/talent-skillForm";
  } catch (error: any) {
    if (Platform.OS !== "web" && error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
    } else if (Platform.OS !== "web" && error.code === statusCodes.IN_PROGRESS) {
      // operation (e.g. sign in) is in progress already
    } else if (Platform.OS !== "web" && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert("Google Play Services not available.");
    } else {
      Alert.alert("Google Sign In Failed", error.message || "Authentication failed");
    }
  } finally {
    setIsSigningUp(false);
  }
};

  // Navigate to login page
  const handleLogin = () => {
    router.push("/login-talent");
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

  // Define web-specific styles
  const webImageBackgroundStyle = Platform.OS === "web"
    ? ({
        minHeight: "100%",
        maxHeight: "100%",
        overflow: "hidden",
        backgroundSize: "cover",
        backgroundPosition: "center",
      } as unknown as ViewStyle)
    : undefined;

  const webScrollViewStyle = Platform.OS === "web"
    ? ({
        maxHeight: "100%",
      } as ViewStyle)
    : undefined;

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
            <Text style={styles.headerSubtitle}>Create your Kwiyeh account</Text>
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

          {/* Google Sign-In */}
          {Platform.OS === "web" ? (
            <Button
              className="bg-white border border-gray-300 rounded-full py-3 flex-row justify-center items-center mb-4"
              onPress={handleGoogleSignIn}
              disabled={isSigningUp}
              accessibilityLabel="Sign up with Google"
            >
              <View style={styles.googleButtonContent}>
                <View style={styles.googleIconContainer}>
                  {/* SVG Google Icon here */}
                  <svg
                    width="18"
                    height="18"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </View>
                <Text style={styles.googleButtonText}>
                  {isSigningUp ? "Processing..." : "Sign up with Google"}
                </Text>
              </View>
            </Button>
          ) : (
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignIn}
            />
          )}

          {/* Google Sign-In warning */}
          {Platform.OS !== "web" && !isGoogleSignInAvailable && (
            <Text style={styles.warningText}>
              Google Sign-In is not available. Please install the required module or sign up with email and password.
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