 // app/signup-talent.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox as MobileCheckbox } from "~/components/ui/checkbox"; // Your existing checkbox
import { Checkbox as WebCheckbox } from "~/components/ui-web/web-checkbox"; // Your new web checkbox
import CountrySelect, { Country } from "~/components/country-component/CountrySelect";
import Entypo from "@expo/vector-icons/Entypo";
import { Formik } from "formik";
import * as Yup from "yup";
import { registerUser } from "~/app/services/firebase";

// Validation schema
const SignupSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
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

  // Handle signup submission with improved error handling
  const handleSubmit = async (values: any) => {
    try {
      setIsSigningUp(true);

      const formattedPhone = `${selectedCountry.dial_code}${values.phoneNumber}`;
      
      console.log("Attempting to register with:", {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: formattedPhone
      });

      await registerUser({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: formattedPhone,
        password: values.password,
      });

      router.push("/talent-skillForm");
    } catch (error: any) {
      console.error("Detailed error:", JSON.stringify(error, null, 2));
      
      if (error.message === "Email already in use") {
        Alert.alert("Signup Failed", "This email is already in use.");
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
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
      console.error("Signup error type:", typeof error);
      console.error("Signup error message:", error.message);
      console.error("Signup error code:", error.code);
      console.error("Signup error response:", error.response);
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
          {/* Back Button */}
          {Platform.OS !== "web" && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackNavigation}
              accessibilityLabel="Go back"
            >
              <Entypo name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Sign up
            </Text>
            <Text style={styles.headerSubtitle}>
              Create your Kwiyeh Talent account
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
                      <Text style={styles.errorText}>
                        {errors.fullName}
                      </Text>
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
                      <Text style={styles.errorText}>
                        {errors.email}
                      </Text>
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
                      <Text style={styles.errorText}>
                        {errors.phoneNumber}
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
                        onPress={() => Alert.alert("Terms & Conditions", "Terms and conditions will be displayed here.")}
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
                style={[styles.linkText, Platform.OS === "web" ? styles.webLinkText : {}]}
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

          {/* Google Button (placeholder) */}
          <Button
            className="flex-row items-center justify-center bg-transparent py-5 px-6 rounded-full border border-gray-300 mb-4"
            onPress={() =>
              Alert.alert("Google signup is temporarily disabled.")
            }
            accessibilityLabel="Sign up with Google"
          >
            <Image
              source={require("@/assets/images/google.png")}
              style={{ width: 20, height: 20, marginRight: 12 }}
              resizeMode="contain"
              accessibilityLabel="Google logo"
            />
            <Text className="text-base font-medium text-black">
              Sign up with Google
            </Text>
          </Button>
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 32,
    maxWidth: 520,
    marginHorizontal: 'auto',
    width: '100%',
  },
  backButton: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
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
    // Using gap instead of space-y for consistent spacing
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    color: 'black',
  },
  linkText: {
    color: 'blue',
  },
  webLinkText: {
    textDecorationLine: 'none' as any,
    cursor: 'pointer' as any,
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: 'black',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'black',
    opacity: 0.2,
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'black',
    opacity: 0.5,
  },
});