// //app/talent/settings.tsx

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

export default function TalentSettings() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [services, setServices] = useState("");
  const [pricing, setPricing] = useState("");
  const [availability, setAvailability] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
          storedAvailability
        ] = await AsyncStorage.multiGet([
          "talentName",
          "talentProfileImage",
          "talentLocation",
          "talentServices",
          "talentPricing",
          "talentAvailability"
        ]);

        if (storedName[1]) setFullName(storedName[1]);
        if (storedImage[1]) setProfileImage(storedImage[1]);
        if (storedLocation[1]) setLocation(storedLocation[1]);
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
        ["talentLocation", location],
        ["talentServices", services],
        ["talentPricing", pricing],
        ["talentAvailability", availability],
      ]);
      
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("idToken");
      router.replace("/login-talent");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
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
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <Input 
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
                className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
              />
            </View>
            
            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TouchableOpacity 
                style={styles.locationButton}
              >
                <Ionicons name="location-sharp" size={20} color="#666666" style={styles.locationIcon} />
                <Text style={[styles.locationText, location ? styles.filledText : styles.placeholderText]}>
                  {location || "Set your location"}
                </Text>
              </TouchableOpacity>
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
});