 //app/talent-forgot-password.tsx
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
import { Formik } from "formik";
import * as Yup from "yup";
import Entypo from "@expo/vector-icons/Entypo";

// API Base URL
const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8080'
  : 'http://192.168.216.33:8080';

// Validation schema
const EmailSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotPassword() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle forgot password request
  const handleResetRequest = async (values: { email: string }) => {
    try {
      setIsSubmitting(true);
      console.log("Requesting password reset for:", values.email);
      
      // Call API endpoint
      const response = await fetch(`${API_BASE_URL}/forgetPassword?email=${encodeURIComponent(values.email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Navigate to verification page passing email as param
      router.push({
        pathname: "/talent-email-verification",
        params: { email: values.email }
      });
    } catch (error: any) {
      console.error("Password reset request error:", error);
      Alert.alert(
        "Request Failed",
        "Unable to process your request. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Background image based on platform
  const backgroundSource =
    Platform.OS === "web"
      ? require("@/assets/images/Desktop-password-reset.svg")
      : require("@/assets/images/password-reset.png");

  return (
    <ImageBackground
      source={backgroundSource}
      style={[
        styles.backgroundImage,
        Platform.OS === "web" ? styles.webContainer : null,
      ]}
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
              <Text style={styles.backText}>Forgot Password</Text>
            </TouchableOpacity>
          )}
          
          {/* Header - Web Only */}
          {Platform.OS === "web" && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Forgot Password</Text>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>Mail Address Here</Text>
            <Text style={styles.instructionText}>
              Enter the email address associated with your account.
            </Text>
          </View>

          <Formik
            initialValues={{
              email: "",
            }}
            validationSchema={EmailSchema}
            onSubmit={handleResetRequest}
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
                {/* Email Input */}
                <View style={styles.formFields}>
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
                </View>

                {/* Submit Button */}
                <Button
                  className={`py-4 rounded-full ${
                    isValid ? "bg-green-800" : "bg-green-800 opacity-50"
                  }`}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || isSubmitting}
                  accessibilityLabel="Recover password button"
                >
                  <Text className="text-white text-lg font-semibold">
                    {isSubmitting ? "Processing..." : "Recover Password"}
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