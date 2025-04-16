 // app/signup-client.tsx

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
import CountrySelect, { Country } from "~/components/country-component/CountrySelect";
import Entypo from '@expo/vector-icons/Entypo';

export default function SignupClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  const [phoneNumber, setPhoneNumber] = useState("");

  const handleInputChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Updated handleSignup: validates inputs then navigates to the client dashboard
  const handleSignup = () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !phoneNumber ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!formData.agreedToTerms) {
      Alert.alert("Error", "Please agree to terms and conditions");
      return;
    }
    
    // Navigate to client dashboard after successful signup
    router.push("/client-dashboard");
  };

  // New handleLogin: navigates to the login page
  const handleLogin = () => {
    router.push("/login-client");
  };

  // Back button navigation
  const handleBackNavigation = () => {
    router.back();
  };

  const initialCountry: Country = {
    name: "United States",
    dial_code: "+1",
    code: "US",
    flag: "🇺🇸",
  };
  const [selectedCountry, setSelectedCountry] = useState<Country>(initialCountry);

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
          {/* Back Button */}
          <TouchableOpacity className="mb-6" onPress={handleBackNavigation}>
            <Entypo name="chevron-left" size={24} color="black" />
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-6xl font-bold text-black mb-2">Sign up</Text>
            <Text className="text-xl text-black">Create your Kwiyeh account</Text>
          </View>

          {/* Input Fields with increased spacing */}
          <View className="space-y-6 flex gap-2">
            {/* Full Name Input */}
            <Input
              placeholder="Full name"
              value={formData.fullName}
              onChangeText={(text) => handleInputChange("fullName", text)}
              className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
              placeholderTextColor="#A0A0A0"
            />

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

            {/* Phone Number Input */}
            <View className="bg-white rounded-xl px-4 border border-[#90EE90] flex-row items-center">
              <CountrySelect
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
              />
              <Input
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor="#A0A0A0"
                className="flex-1 ml-2"
              />
            </View>

            {/* Password Input */}
            <Input
              placeholder="Password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
              className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
              placeholderTextColor="#A0A0A0"
            />

            {/* Confirm Password Input */}
            <Input
              placeholder="Confirm password"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange("confirmPassword", text)}
              className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          {/* Terms and Conditions */}
          <View className="flex-row items-center mt-6 mb-6">
            <Checkbox
              checked={formData.agreedToTerms}
              onCheckedChange={() =>
                handleInputChange("agreedToTerms", !formData.agreedToTerms)
              }
              className="mr-2"
            />
            <Text className="flex-1">
              I agree to the{" "}
              <Text className="text-blue-600">terms and conditions</Text>
            </Text>
          </View>

          {/* Signup Button */}
          <Button
            className="bg-green-800 py-4 rounded-full mb-4"
            onPress={handleSignup}
            disabled={!formData.agreedToTerms}
          >
            <Text className="text-white text-lg font-semibold">Sign up</Text>
          </Button>

          {/* Login Link */}
          <View className="items-center mb-4">
            <Text className="text-black">
              Already have an account?{" "}
              <Text className="text-blue-600" onPress={handleLogin}>
                Login
              </Text>
            </Text>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-black opacity-20" />
            <Text className="mx-4 text-black opacity-50">or</Text>
            <View className="flex-1 h-px bg-black opacity-20" />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
