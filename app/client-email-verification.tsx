//app/client-email-verification.tsx

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  Platform,
  StyleSheet,
  TextInput,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "~/components/ui/button";
import Entypo from "@expo/vector-icons/Entypo";

export default function EmailVerification() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  // Handle input change and focus next input
  const handleInputChange = (text: string, index: number) => {
    if (text.length <= 1) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      
      // Move to next input if current input is filled
      if (text.length === 1 && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace and focus previous input
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && code[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Check if all code inputs are filled
  const isCodeComplete = () => {
    return code.every((digit) => digit.length === 1);
  };

  const handleBack = () => {
    router.back();
  };

  const handleVerify = async () => {
    if (!isCodeComplete()) {
      Alert.alert("Invalid Code", "Please enter all 4 digits of the verification code.");
      return;
    }
  
    try {
      setIsSubmitting(true);
      console.log("Verifying code:", code.join(""));
      
      // Call API endpoint to verify code
      const response = await fetch("/verifyCode", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email as string,
          forgetPasswordCode: code.join("")
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Parse the response to get passwordToken and expiresIn
      const data = await response.json();
      const { passwordToken, expiresIn } = data;
      
      // Navigate to reset password page with email, code, and passwordToken
      router.push({
        pathname: "/client-reset-password",
        params: { 
          email: email as string,
          code: code.join(""),
          passwordToken
        }
      });
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert(
        "Verification Failed",
        "Unable to verify your code. Please try again."
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
          {/* Back Button - Mobile Only */}
          {Platform.OS !== "web" && (
            <TouchableOpacity 
              onPress={handleBack} 
              style={styles.backButton as ViewStyle}
              accessibilityLabel="Go back"
            >
              <Entypo name="chevron-left" size={24} color="black" />
              <Text style={styles.backText as TextStyle}>Email Verification</Text>
            </TouchableOpacity>
          )}
          
          {/* Header - Web Only */}
          {Platform.OS === "web" && (
            <View style={styles.header as ViewStyle}>
              <Text style={styles.headerTitle as TextStyle}>Email Verification</Text>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionContainer as ViewStyle}>
            <Text style={styles.instructionTitle as TextStyle}>Get Your Code</Text>
            <Text style={styles.instructionText as TextStyle}>
              Please enter the 4 digits code sent to your email address.
            </Text>
          </View>

          {/* Code Input */}
          <View style={styles.codeContainer as ViewStyle}>
            {[0, 1, 2, 3].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.codeInput as TextStyle}
                value={code[index]}
                onChangeText={(text) => handleInputChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                accessibilityLabel={`Digit ${index + 1} input`}
              />
            ))}
          </View>

          {/* Verify Button */}
          <Button
            className={`py-4 rounded-full mt-6 ${
              isCodeComplete() ? "bg-green-800" : "bg-green-800 opacity-50"
            }`}
            onPress={handleVerify}
            disabled={!isCodeComplete() || isSubmitting}
            accessibilityLabel="Verify code button"
          >
            <Text className="text-white text-lg font-semibold">
              {isSubmitting ? "Processing..." : "Verify and Proceed"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// Define combined style type
type Styles = {
  backgroundImage: ViewStyle;
  webContainer: ViewStyle;
  webScrollView: ViewStyle;
  container: ViewStyle;
  backButton: ViewStyle;
  backText: TextStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  instructionContainer: ViewStyle;
  instructionTitle: TextStyle;
  instructionText: TextStyle;
  codeContainer: ViewStyle;
  codeInput: TextStyle;
}

// Shared styles
const styles = StyleSheet.create<Styles>({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  webContainer: {
    overflow: "hidden",
  },
  webScrollView: {
    // Empty for now, web-specific styling is handled inline
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
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  codeInput: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: "#90EE90",
    borderRadius: 8,
    backgroundColor: "white",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
});