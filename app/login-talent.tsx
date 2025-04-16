 // app/login-talent.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    // Navigate to talent skill form after successful login
    router.push("/talent-skillForm");
  };

  const handleCreateAccount = () => {
    // Navigate directly to talent signup
    router.push("/signup-talent");
  };

  const handleForgotPassword = () => {
    Alert.alert("Reset Password", "Password reset functionality will be implemented soon.");
  };

  return (
    <ImageBackground
      source={require("@/assets/images/signup-background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-6 pt-12 pb-8">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-6xl font-bold text-black mb-2">login</Text>
          </View>

          {/* Input Fields with spacing */}
          <View className="space-y-6 flex gap-2">
            {/* Email Input */}
            <Input
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
              placeholderTextColor="#A0A0A0"
            />

            {/* Password Input */}
            <Input
              placeholder="Password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
              className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          {/* Remember Me and Forgot Password */}
          <View className="flex-row justify-between items-center mt-4 mb-6">
            <View className="flex-row items-center">
              <Checkbox
                checked={formData.rememberMe}
                onCheckedChange={() =>
                  handleInputChange("rememberMe", !formData.rememberMe)
                }
                className="mr-2"
              />
              <Text className="text-black">Remember me</Text>
            </View>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text className="text-blue-600">Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            className="bg-green-800 py-4 rounded-full mb-4"
            onPress={handleLogin}
          >
            <Text className="text-white text-lg font-semibold">Login</Text>
          </Button>

          {/* Sign Up Link */}
          <View className="items-center mb-4">
            <Text className="text-black">
              Don't have an account?{" "}
              <Text 
                className="text-blue-600"
                onPress={handleCreateAccount}
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
