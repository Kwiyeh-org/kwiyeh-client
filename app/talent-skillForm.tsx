 // app/talent-skillForm.tsx

import React, { useState } from "react";
import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function TalentSkillForm() {
  const router = useRouter();
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");

  const handleSubmit = () => {
    if (!skills || !experience) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    // Navigate to talent dashboard after submitting skills
    router.push("/talent-dashboard");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold mb-8">Skills & Experience</Text>
        <Text className="text-lg mb-6">Tell us about your skills and experience</Text>
        
        <View className="space-y-6">
          <View>
            <Text className="text-base mb-2">Skills</Text>
            <Input
              placeholder="List your skills (e.g., Photography, Web Design)"
              value={skills}
              onChangeText={setSkills}
              className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          
          <View>
            <Text className="text-base mb-2">Experience</Text>
            <Input
              placeholder="Years of experience"
              keyboardType="numeric"
              value={experience}
              onChangeText={setExperience}
              className="bg-white rounded-xl px-4 py-3 text-base border border-[#90EE90]"
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>
        
        <Button 
          className="bg-green-800 py-4 rounded-full my-8"
          onPress={handleSubmit}
        >
          <Text className="text-white text-lg font-semibold">Submit</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}