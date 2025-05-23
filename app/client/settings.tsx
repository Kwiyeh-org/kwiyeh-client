//app/client/settings.tsx

import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Image,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

export default function ClientSettings() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const storedName = await AsyncStorage.getItem("userName");
        const storedImage = await AsyncStorage.getItem("userProfileImage");
        const storedLocation = await AsyncStorage.getItem("userLocation");
        
        if (storedName) setFullName(storedName);
        if (storedImage) setProfileImage(storedImage);
        if (storedLocation) setLocation(storedLocation);
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert("Error", "Failed to load your profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Image picker function
  const pickImage = async () => {
    try {
      // Request permissions first
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await AsyncStorage.setItem("userProfileImage", uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Save profile changes
  const saveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem("userName", fullName);
      await AsyncStorage.setItem("userLocation", location);
      
      // In a real app, you would also save to your backend here
      
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear necessary storage items (don't clear profile data)
      await AsyncStorage.removeItem("idToken");
      
      // Navigate to login screen
      router.replace("/login-client");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  // Show location picker
 

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#166534" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-6">
          <Text className="text-3xl font-bold mb-8">Settings</Text>
          
          {/* Profile Photo */}
          <View className="items-center mb-8">
            <TouchableOpacity 
              onPress={pickImage}
              className="relative mb-2"
              accessibilityLabel="Change profile picture"
            >
              <View className="h-24 w-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image 
                    source={{ uri: profileImage }} 
                    className="h-full w-full" 
                    resizeMode="cover"
                  />
                ) : (
                  <FontAwesome name="user" size={40} color="#666666" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-green-800 p-2 rounded-full">
                <Feather name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text className="text-sm text-gray-500">Tap to change profile photo</Text>
          </View>
          
          {/* Profile Information */}
          <View className="space-y-6">
            {/* Name */}
            <View>
              <Text className="text-base font-medium mb-2">Full Name</Text>
              <Input 
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
                className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
              />
            </View>
            
            {/* Location */}
            <View>
              <Text className="text-base font-medium mb-2">Location</Text>
              <TouchableOpacity 
                className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-300"
               
              >
                <Ionicons name="location-sharp" size={20} color="#666666" style={{ marginRight: 8 }} />
                <Text className={location ? "text-black" : "text-gray-400"}>
                  {location || "Set your location"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Save Button */}
          <Button 
            className="bg-green-800 py-3 rounded-xl mt-8"
            onPress={saveProfile}
            disabled={isSaving}
          >
            <Text className="text-white font-semibold">
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </Button>
          
          {/* Logout */}
          <TouchableOpacity 
            className="flex-row items-center justify-center mt-8"
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
            <Text className="ml-2 text-red-500 font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}