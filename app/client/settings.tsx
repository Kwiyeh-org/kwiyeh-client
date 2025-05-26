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
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { auth } from "@/services/firebaseConfig";
import { deleteUser } from "firebase/auth";

export default function ClientSettings() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
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
      await AsyncStorage.setItem("userName", fullName);
      await AsyncStorage.setItem("userLocation", location);
      if (Platform.OS === "web") {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2200);
      } else {
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  // --- LOGOUT: remove only session keys ---
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "idToken",
        "userId"
      ]);
      if (auth && auth.signOut) await auth.signOut?.();
      router.replace("/login-client");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  // --- ACCOUNT DELETION: delete Firebase user and ALL local data ---
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
              const currentUser = auth.currentUser;
              if (currentUser) {
                await deleteUser(currentUser);
              }
              await AsyncStorage.clear();
              router.replace("/signup-client");
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", "Failed to delete account. Try again.");
            }
          }
        }
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
      {/* Success message for web */}
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
              accessibilityLabel="Change profile picture"
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
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TouchableOpacity style={styles.locationButton}>
                <Ionicons name="location-sharp" size={20} color="#666666" style={styles.locationIcon} />
                <Text style={[styles.locationText, location ? styles.filledText : styles.placeholderText]}>
                  {location || "Set your location"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <Button
            style={{ backgroundColor: "#166534", borderRadius: 14, marginTop: 32, paddingVertical: 14 }}
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    ...Platform.select({
      web: {
        maxWidth: 600,
        marginHorizontal: 'auto',
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#111',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoButton: {
    position: 'relative',
    marginBottom: 8,
  },
  photoWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#166534',
    padding: 8,
    borderRadius: 20,
  },
  photoText: {
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
  },
  filledText: {
    color: '#111',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  logoutText: {
    marginLeft: 8,
    color: '#ef4444',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  deleteText: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
