// // app/talent/modals/talent-skillForm.tsx
// //it's moved here to solve routing issues  that's how expo routing works

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity
} from "react-native";
import { useRouter } from "expo-router";

import { Input } from "~/components/ui/input";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVICES_CATEGORIES } from "~/constants/skill-list"; // <--- Use your constants file
import { useAuthStore } from '@/store/authStore';

export default function TalentSkillForm({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter();
  const updateUserInfo = useAuthStore((state) => state.updateUserInfo);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [pricing, setPricing] = useState("");
  const [availability, setAvailability] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show the skill form if the user hasn't seen it before (persisted in AsyncStorage)
  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem('hasSeenTalentSkillForm');
      if (seen === 'true') {
        // Immediately route to dashboard if already seen
        router.replace('/talent');
      }
    })();
  }, []);

  // Multi-select toggle
  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Log outgoing request
      console.log('[TalentSkillForm] Submitting skill form:', { selectedServices, experience, pricing, availability });
      const success = await updateUserInfo({
        services: selectedServices,
        experience,
        pricing,
        availability,
      });
      // Mark as seen regardless of success
      await AsyncStorage.setItem('hasSeenTalentSkillForm', 'true');
      if (onComplete) onComplete();
        router.replace("/talent");
    } catch (error) {
      await AsyncStorage.setItem('hasSeenTalentSkillForm', 'true');
      if (onComplete) onComplete();
      router.replace("/talent");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a close/skip button for users who want to skip
  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenTalentSkillForm', 'true');
    if (onComplete) onComplete();
    router.replace('/talent');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us about your professional skills and services
          </Text>
        </View>

        <View style={styles.form}>
          {/* --- MULTI-SELECT SERVICE PICKER --- */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Services You Offer (pick all that apply)</Text>
            {SERVICES_CATEGORIES.map(cat => (
              <View key={cat.category} style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold", color: "#166534" }}>{cat.category}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {cat.services.map(service => (
                    <TouchableOpacity
                      key={service}
                      onPress={() => toggleService(service)}
                      style={{
                        backgroundColor: selectedServices.includes(service) ? "#166534" : "#e5e7eb",
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        margin: 3,
                      }}
                    >
                      <Text style={{ color: selectedServices.includes(service) ? "#fff" : "#222" }}>
                        {service}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
          {/* --- END SERVICES PICKER --- */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Experience</Text>
            <Input
              value={experience}
              onChangeText={setExperience}
              placeholder="e.g., 5 years in professional makeup"
              className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pricing</Text>
            <Input
              value={pricing}
              onChangeText={setPricing}
              placeholder="e.g., $50/hour, Packages starting at $200"
              className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
              keyboardType="default"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Availability</Text>
            <Input
              value={availability}
              onChangeText={setAvailability}
              placeholder="e.g., Mon-Fri 9AM-5PM"
              className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
            />
          </View>

          <Button
            className="bg-green-800 py-4 rounded-xl mt-8"
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Complete Profile'}</Text>
          </Button>
          <TouchableOpacity onPress={handleSkip} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: '#fff', textDecorationLine: 'underline', fontSize: 16 }}>Skip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17994B",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 40 : 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      web: {
        maxWidth: 600,
        marginHorizontal: 'auto',
        width: '100%',
      },
    }),
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
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
