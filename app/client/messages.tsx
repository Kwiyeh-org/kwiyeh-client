// app/client/messages.tsx
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientMessages() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-lg text-gray-500 font-medium">Messages will be available soon.</Text>
    </SafeAreaView>
  );
}