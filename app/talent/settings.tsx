//app/talent/settings.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import LocationField from '~/components/LocationField';
import CustomMapView, { Marker } from '~/components/CustomMapView';
import { SERVICES_CATEGORIES } from '~/constants/skill-list';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import type { User } from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TalentSettings() {
  const router = useRouter();
  const { user, updateUserInfo, logout, deleteAccount, isAuthenticated } = useAuthStore();

  // All hooks at the top!
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [profileImage, setProfileImage] = useState<string | null>(user?.photoURL || null);
  const [location, setLocation] = useState<User['location'] | undefined>(user?.location);
  const [selectedServices, setSelectedServices] = useState<string[]>(user?.services || []);
  const [pricing, setPricing] = useState(user?.pricing || '');
  const [availability, setAvailability] = useState(user?.availability || '');
  const [isMobile, setIsMobile] = useState(user?.isMobile || false);
  const [isLoading, setIsLoading] = useState(false);
  const [experience, setExperience] = useState(user?.experience || '');

  useEffect(() => {
    if (!user || !isAuthenticated || user.role !== 'talent') {
      router.replace('/');
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        const token = localStorage.getItem('idToken');
        console.log('[settings-talent] idToken in localStorage (on mount):', token);
      } else {
        const token = await AsyncStorage.getItem('idToken');
        console.log('[settings-talent] idToken in AsyncStorage (on mount):', token);
      }
    })();
  }, []);

  if (!user || !isAuthenticated || user.role !== 'talent') {
    return null;
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
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
    setIsLoading(true);
    try {
      let imageData = profileImage;
      
      // Convert local image to base64 if it's a file URI
      if (profileImage && profileImage.startsWith('file')) {
        console.log('[saveProfile] Converting image to base64');
        imageData = await imageToBase64(profileImage);
      }
      
      // === LOG idToken before updateUserInfo ===
      console.log('LOGGING TOKEN NOW');
      if (Platform.OS === 'web') {
        const token = localStorage.getItem('idToken');
        console.log('[settings-talent] idToken in localStorage before update:', token);
      } else {
        const token = await AsyncStorage.getItem('idToken');
        console.log('[settings-talent] idToken in AsyncStorage before update:', token);
      }
      // === END LOG ===
      
      console.log('[saveProfile] Updating user info:', {
        name: fullName,
        email,
        phoneNumber,
        photoURL: imageData,
        location,
        services: selectedServices,
        pricing,
        availability,
        isMobile,
        experience,
      });
      
      const success = await updateUserInfo({
        name: fullName,
        email: email,
        phoneNumber: phoneNumber,
        photoURL: imageData ?? undefined,
        location,
        services: selectedServices,
        pricing,
        availability,
        isMobile,
        experience,
      });
      
      if (success) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('[saveProfile] Error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for confirmation
  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', style: 'destructive', onPress: onConfirm },
    ]);
  };

  const handleLogout = async () => {
    try {
      console.log('[logout] Logging out user', user?.id, user?.role);
      await AsyncStorage.clear();
      useAuthStore.getState().resetUser();
      router.replace('/');
    } catch (error) {
      console.error('[logout] Error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      console.log('[deleteAccount] Deleting account for', user?.id, user?.role);
      await deleteAccount();
      await AsyncStorage.clear();
      useAuthStore.getState().resetUser();
      router.replace('/');
      Alert.alert('Account deleted', 'Your account has been deleted.');
    } catch (error) {
      console.error('[deleteAccount] Error:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <FontAwesome name="user" size={40} color="#666" />
              </View>
            )}
            <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <LocationField
            value={location ?? ''}
            onChange={setLocation}
          />
          {location && (
            <View style={styles.mapContainer}>
              <CustomMapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Your Location"
                />
              </CustomMapView>
            </View>
          )}
        </View>
        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.servicesGrid}>
            {SERVICES_CATEGORIES.map((category) => (
              <View key={category.category} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{category.category}</Text>
                {category.services.map((service: string) => (
                  <TouchableOpacity
                    key={service}
                    style={[
                      styles.serviceItem,
                      selectedServices.includes(service) && styles.selectedServiceItem
                    ]}
                    onPress={() => toggleService(service)}
                  >
                    <Text style={[
                      styles.serviceText,
                      selectedServices.includes(service) && styles.selectedServiceText
                    ]}>
                      {service}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hourly Rate (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={pricing}
              onChangeText={setPricing}
              placeholder="e.g., $50/hour or Negotiable"
              keyboardType="numeric"
            />
          </View>
        </View>
        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Available Hours</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={availability}
              onChangeText={setAvailability}
              placeholder="e.g., Mon-Fri 9AM-5PM, Weekends available"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Experience</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={experience}
              onChangeText={setExperience}
              placeholder="e.g., 5 years in professional makeup"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
        {/* Service Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Type</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Mobile Service</Text>
            <Switch
              value={isMobile}
              onValueChange={setIsMobile}
              trackColor={{ false: '#E5E7EB', true: '#16a34a' }}
              thumbColor={isMobile ? '#fff' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.switchDescription}>
            {isMobile
              ? 'You provide services at client locations'
              : 'Clients come to your location or you meet at agreed locations'
            }
          </Text>
        </View>
        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#166534',
    borderRadius: 8,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  mapContainer: {
    marginTop: 12,
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  servicesGrid: {
    gap: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  serviceItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedServiceItem: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  serviceText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedServiceText: {
    color: '#fff',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#111',
  },
  switchDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});