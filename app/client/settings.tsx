// app/client/settings.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { Input } from '~/components/ui/input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '~/components/ui/button';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { FontAwesome, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import LocationField from '~/components/LocationField';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClientSettings() {
  const router = useRouter();
  const { user, updateUserInfo, logout, deleteAccount, isAuthenticated } = useAuthStore();

  // All hooks at the top!
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [profileImage, setProfileImage] = useState(user?.photoURL || null);
  const [location, setLocation] = useState<User['location'] | undefined>(user?.location);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure root layout is mounted
    const timer = setTimeout(() => {
      if (!user || !isAuthenticated || user.role !== 'client') {
        router.replace('/');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isAuthenticated]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        // Token logging removed for cleaner user experience
      } else {
        // Token logging removed for cleaner user experience
        const token = await AsyncStorage.getItem('idToken');
      }
    })();
  }, []);

  if (!user || !isAuthenticated || user.role !== 'client') {
    return null;
  }

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
        setProfileImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Helper function to convert image to base64
  const imageToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[imageToBase64] Error:', error);
      throw error;
    }
  };

  const saveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setIsSaving(true);
    try {
      let imageData = profileImage;
      
      // Convert local image to base64 if it's a file URI
      if (profileImage && profileImage.startsWith('file')) {
        imageData = await imageToBase64(profileImage);
      }
      
      const success = await updateUserInfo({
        name: fullName,
        email: email,
        phoneNumber: phoneNumber,
        photoURL: imageData ?? undefined,
        location,
      });
      
      if (success) {
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Update Failed', 
          'Unable to update your profile. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[saveProfile] Error:', error);
      Alert.alert(
        'Error', 
        'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      useAuthStore.getState().resetUser();
      router.replace('/');
    } catch (error) {
      console.error('[logout] Error:', error);
      Alert.alert(
        'Logout Error', 
        'Failed to logout. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await AsyncStorage.clear();
              useAuthStore.getState().resetUser();
              router.replace('/');
              Alert.alert(
                'Account Deleted', 
                'Your account has been successfully deleted.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('[deleteAccount] Error:', error);
              Alert.alert(
                'Delete Error', 
                'Failed to delete account. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>
          {/* Profile Photo Section */}
          <View style={styles.photoContainer}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.photoButton}
              accessibilityLabel="Change profile picture"
            >
              <View style={styles.photoWrapper}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
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
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Your email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <Input
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Your phone number"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <LocationField
                value={location?.address || ""}
                onChange={setLocation}
                isTalent={false}
              />
            </View>
          </View>
          {/* Save Button */}
          <Button style={styles.saveButton} onPress={saveProfile} disabled={isSaving}>
            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
          </Button>
          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          {/* Delete Account */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
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
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#166534",
    borderRadius: 14,
    marginTop: 32,
    paddingVertical: 14,
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