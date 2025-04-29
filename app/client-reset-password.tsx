 //app/client-reset-password.tsx

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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Formik } from "formik";
import * as Yup from "yup";
import Entypo from "@expo/vector-icons/Entypo";

// API Base URL
const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8080'
  : 'http://192.168.45.34:8080';

// Validation schema
const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

export default function ResetPassword() {
  const router = useRouter();
  const { email, passwordToken } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  // Handle password reset
  const handlePasswordReset = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setIsSubmitting(true);
      console.log("Resetting password for:", email);
      
      // Call API endpoint with token in Authorization header
      const response = await fetch(`${API_BASE_URL}/resetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${passwordToken}`,
        },
        body: JSON.stringify({
          email: email,
          password: values.password
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      Alert.alert(
        "Success",
        "Your password has been reset successfully.",
        [
          {
            text: "Login Now",
            onPress: () => router.push("/client-dashboard")
          }
        ]
      );
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Reset Failed",
        "Unable to reset your password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Background image based on platform
  const backgroundSource =
    Platform.OS === "web"
      ? require("@/assets/images/Desktop-password-reset.svg")
      : require("@/assets/images/password-reset.png");

  return (
    <ImageBackground
      source={backgroundSource}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        style={Platform.OS === "web" ? styles.webScrollView : undefined}
      >
        <View style={styles.container}>
          {/* Back Button - Mobile Only */}
          {Platform.OS !== "web" && (
            <TouchableOpacity 
              onPress={handleBack} 
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <Entypo name="chevron-left" size={24} color="black" />
              <Text style={styles.backText}>Reset Password</Text>
            </TouchableOpacity>
          )}
          
          {/* Header - Web Only */}
          {Platform.OS === "web" && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Reset Password</Text>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>Enter New Password</Text>
            <Text style={styles.instructionText}>
              Your new password must be different from the recently used password.
            </Text>
          </View>

          <Formik
            initialValues={{
              password: "",
              confirmPassword: "",
            }}
            validationSchema={PasswordSchema}
            onSubmit={handlePasswordReset}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
            }) => (
              <>
                <View style={styles.formFields}>
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
                      accessibilityLabel="New password input"
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="Confirm Password"
                      secureTextEntry
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
                      placeholderTextColor="#A0A0A0"
                      accessibilityLabel="Confirm password input"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}
                  </View>
                </View>

                {/* Reset Button */}
                <Button
                  className={`py-4 rounded-full ${
                    isValid ? "bg-green-800" : "bg-green-800 opacity-50"
                  }`}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || isSubmitting}
                  accessibilityLabel="Reset password button"
                >
                  <Text className="text-white text-lg font-semibold">
                    {isSubmitting ? "Processing..." : "Reset Password"}
                  </Text>
                </Button>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// Shared styles
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  webContainer: {
    minHeight: "100%",
    maxHeight: "100%",
    overflow: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  webScrollView: {
    maxHeight: "100%",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 24,
  },
  backText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
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
  instructionContainer: {
    marginBottom: 32,
  },
  instructionTitle: {
    fontSize: Platform.OS === "web" ? 24 : 20,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: Platform.OS === "web" ? 16 : 14,
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
});