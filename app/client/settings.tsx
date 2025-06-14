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
  StyleSheet,
} from "react-native";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { deleteUser } from "firebase/auth";
import LocationField from "~/components/LocationField";
import { auth } from "@/services/firebaseConfig";
import { updateProfile } from "firebase/auth";
import { getDatabase, ref, set, remove } from 'firebase/database';
import { app } from '~/services/firebaseConfig';

export default function ClientSettings() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const storedLocation = await AsyncStorage.getItem("userLocation");
        
        if (Platform.OS === "web" && auth.currentUser) {
          setFullName(auth.currentUser.displayName || "");
          setProfileImage(auth.currentUser.photoURL);
          if (storedLocation) setLocation(JSON.parse(storedLocation));
        } else {
          const storedName = await AsyncStorage.getItem("userName");
          const storedImage = await AsyncStorage.getItem("userProfileImage");
          if (storedName) setFullName(storedName);
          if (storedImage) setProfileImage(storedImage);
          if (storedLocation) setLocation(JSON.parse(storedLocation));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert("Error", "Failed to load your profile data");
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
          Alert.alert("Permission Required", "Sorry, we need camera roll permissions to make this work!");
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

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Save to AsyncStorage first
      await AsyncStorage.multiSet([
        ["userName", fullName],
        ["userProfileImage", profileImage ?? ""],
        ["userLocation", location ? JSON.stringify(location) : ""],
      ]);

      // --- SAVE TO FIREBASE ---
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const db = getDatabase(app);
        
        // Save client profile data
        await set(ref(db, `clients/${userId}`), {
          name: fullName,
          profileImage,
          location,
        });
      }
      
      if (Platform.OS === "web" && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: fullName,
          photoURL: profileImage ?? undefined,
        });
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "idToken",
        "userId"
      ]);
      if (Platform.OS === "web" && auth?.signOut) {
        await auth.signOut();
      }
      router.replace("/login-client");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  const handleAccountDeletion = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Get userId before clearing storage
              const userId = await AsyncStorage.getItem('userId');
              
              // 1. Delete from Firebase Realtime Database
              if (userId) {
                const db = getDatabase(app);
                try {
                  // Remove client profile data
                  await remove(ref(db, `clients/${userId}`));
                  // Remove any client-specific data (bookings, reviews, etc.)
                  await remove(ref(db, `clientBookings/${userId}`));
                  await remove(ref(db, `clientReviews/${userId}`));
                  await remove(ref(db, `clientChats/${userId}`));
                  console.log("Firebase client data deleted successfully");
                } catch (dbError) {
                  console.error("Firebase deletion error:", dbError);
                  // Continue with other deletions even if Firebase fails
                }
              }

              // 2. Delete Firebase Auth user (if authenticated)
              if (auth.currentUser) {
                try {
                  await deleteUser(auth.currentUser);
                  console.log("Firebase Auth user deleted successfully");
                } catch (authError) {
                  console.error("Firebase Auth deletion error:", authError);
                  // Continue with local cleanup even if auth deletion fails
                }
              }

              // 3. Clear all local storage - comprehensive cleanup
              await AsyncStorage.multiRemove([
                // Auth tokens
                "idToken",
                "userId",
                
                // Client profile data
                "userName",
                "userProfileImage", 
                "userLocation",
                
                // Client-specific data
                "clientPreferences",
                "clientBookings",
                "clientFavorites",
                "clientSearchHistory",
                "clientPaymentMethods",
                "clientReviews",
                "clientNotifications",
                
                // General app data that might be client-specific
                "lastSearchLocation",
                "recentSearches",
                "appSettings",
                "chatHistory",
                
                // Talent data (in case user switched roles)
                "talentName",
                "talentProfileImage",
                "talentLocation",
                "talentServices",
                "talentPricing",
                "talentAvailability",
                "isMoving",
                "talentSkills",
                "talentExperience",
                "talentPortfolio",
              ]);

              // 4. Navigate to signup page
              router.replace("/signup-client");
              
              // Show success message
              if (Platform.OS !== "web") {
                Alert.alert("Account Deleted", "Your account has been successfully deleted.");
              }
              
            } catch (error) {
              console.error("Account deletion error:", error);
              Alert.alert(
                "Deletion Error", 
                "There was an error deleting your account. Some data may still exist. Please try again or contact support."
              );
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
              <LocationField
                value={location?.address || ""}
                onChange={locObj => setLocation(locObj)}
                isTalent={false}
              />
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
 