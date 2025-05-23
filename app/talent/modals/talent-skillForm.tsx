// // app/talent/modals/talent-skillForm.tsx
// //it's moved here to solve routing issues  that's how expo routing works

 import React, { useState } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Platform,
  Alert 
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TalentSkillForm() {
  const router = useRouter();
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [services, setServices] = useState("");
  const [pricing, setPricing] = useState("");
  const [availability, setAvailability] = useState("");

   const handleSubmit = async () => {
  try {
    await AsyncStorage.multiSet([
      ["talentSkills", skills],
      ["talentExperience", experience],
      ["talentServices", services],
      ["talentPricing", pricing],
      ["talentAvailability", availability],
    ]);
    router.replace("/talent"); 
  } catch (error) {
    Alert.alert("Error", "Failed to save profile data");
  }
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
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Skills</Text>
            <Input
              value={skills}
              onChangeText={setSkills}
              placeholder="e.g., Hair Styling, Makeup, Photography"
              className="bg-white rounded-xl px-4 py-3 text-base border border-gray-300"
              multiline
            />
          </View>

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
            <Text style={styles.label}>Services Offered</Text>
            <Input
              value={services}
              onChangeText={setServices}
              placeholder="e.g., Wedding Makeup, Portrait Photography"
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
          >
            <Text style={styles.buttonText}>Complete Profile</Text>
          </Button>
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