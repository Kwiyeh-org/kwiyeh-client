// app/talent-dashboard.tsx

import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "~/components/ui/button";

export default function TalentDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-3xl font-bold mb-8">Talent Dashboard</Text>
        <Text className="text-lg text-center mb-8">
          Welcome to your talent dashboard. Here you can manage your services and clients.
        </Text>
        <Button 
          className="bg-green-800 py-3 px-6 rounded-full"
          onPress={() => router.replace("/login-talent")}
        >
          <Text className="text-white font-semibold">Logout</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
