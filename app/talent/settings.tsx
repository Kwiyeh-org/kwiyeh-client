//app/talent/settings.tsx

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
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import LocationField from "~/components/LocationField";

export default function TalentSettings() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // CHANGE: use object for location!
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [services, setServices] = useState("");
  const [pricing, setPricing] = useState("");
  const [availability, setAvailability] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const [
          storedName,
          storedImage,
          storedLocation,
          storedServices,
          storedPricing,
          storedAvailability,
        ] = await AsyncStorage.multiGet([
          "talentName",
          "talentProfileImage",
          "talentLocation",
          "talentServices",
          "talentPricing",
          "talentAvailability",
        ]);
        if (storedName[1]) setFullName(storedName[1]);
        if (storedImage[1]) setProfileImage(storedImage[1]);
        // CHANGE: parse object!
        if (storedLocation[1]) setLocation(JSON.parse(storedLocation[1]));
        if (storedServices[1]) setServices(storedServices[1]);
        if (storedPricing[1]) setPricing(storedPricing[1]);
        if (storedAvailability[1]) setAvailability(storedAvailability[1]);
      } catch (error) {
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "We need camera roll permissions!");
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await AsyncStorage.setItem("talentProfileImage", uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.multiSet([
        ["talentName", fullName],
        // CHANGE: store location as stringified object!
        ["talentLocation", location ? JSON.stringify(location) : ""],
        ["talentServices", services],
        ["talentPricing", pricing],
        ["talentAvailability", availability],
      ]);
      if (Platform.OS === "web") {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2200); // Show message for 2.2 seconds
      } else {
        Alert.alert("Success", "Profile updated successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Logout: Remove ONLY session keys (leave profile keys!)
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "idToken",
        "userId",
      ]);
      router.replace("/login-talent");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
  };

  // Account deletion: Remove all talent keys
  const handleAccountDeletion = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "idToken",
                "userId",
                "talentName",
                "talentProfileImage",
                "talentLocation",
                "talentServices",
                "talentPricing",
                "talentAvailability",
                "talentSkills",
                "talentExperience",
                "talentPortfolio",
                // Add any other talent-only keys you use
              ]);
              router.replace("/signup-talent");
            } catch (error) {
              Alert.alert("Error", "Failed to delete account. Try again.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === "web" && saveSuccess && (
        <View style={{ backgroundColor: "#d1fae5", padding: 12, borderRadius: 8, margin: 18 }}>
          <Text style={{ color: "#166534", fontWeight: "bold", textAlign: "center" }}>
            Profile updated successfully!
          </Text>
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>
          {/* Profile Photo */}
          <View style={styles.photoContainer}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.photoButton}
            >
              <View style={styles.photoWrapper}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <FontAwesome name="user" size={40} color="#666666" />
                )}
              </View>
              <View style={styles.cameraButton}>
                <Feather name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoText}>Tap to change profile photo</Text>
          </View>
          {/* Profile Information */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
                className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <LocationField
                value={location?.address || ""}
                onChange={locObj => setLocation(locObj)}
                isTalent={true}
              />
            </View>
            {/* Services */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Services Offered</Text>
              <Input
                value={services}
                onChangeText={setServices}
                placeholder="e.g., Hair Styling, Makeup, Photography"
                className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
                multiline
              />
            </View>
            {/* Pricing */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pricing</Text>
              <Input
                value={pricing}
                onChangeText={setPricing}
                placeholder="e.g., $50/hour, Packages from $200"
                className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
              />
            </View>
            {/* Availability */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Availability</Text>
              <Input
                value={availability}
                onChangeText={setAvailability}
                placeholder="e.g., Mon-Fri 9AM-5PM"
                className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
              />
            </View>
          </View>
          {/* Save Button */}
          <Button
            className="bg-green-800 py-3 rounded-xl mt-8"
            onPress={saveProfile}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </Button>
          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          {/* Delete Account */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleAccountDeletion}
          >
            <MaterialCommunityIcons name="delete-outline" size={18} color="#fff" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    ...Platform.select({
      web: {
        maxWidth: 600,
        marginHorizontal: "auto",
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#111",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  photoButton: {
    position: "relative",
    marginBottom: 8,
  },
  photoWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#166534",
    padding: 8,
    borderRadius: 20,
  },
  photoText: {
    fontSize: 14,
    color: "#666",
  },
  formSection: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  logoutText: {
    marginLeft: 8,
    color: "#ef4444",
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  deleteText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
