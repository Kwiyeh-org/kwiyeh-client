//app/clinet/bookings.tsx
import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Button } from "~/components/ui/button";

// Mock talents (replace with backend later)
const mockTalents = [
  {
    id: "1",
    name: "Miriam Njoya",
    service: "Hair Styling",
    image: null, // You can use static images or URLs
    rating: null,
    price: "10,000 CFA",
    location: "Douala, Cameroon"
  },
  {
    id: "2",
    name: "John Doe",
    service: "Home Cleaning",
    image: null,
    rating: null,
    price: "15,000 CFA",
    location: "Yaoundé, Cameroon"
  }
];

export default function ClientBookings() {
  const router = useRouter();
  const [talents, setTalents] = useState<any[]>([]);

  useEffect(() => {
    // In real app, fetch from backend
    setTalents(mockTalents);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold mb-8">Available Talents</Text>
        {talents.length === 0 && (
          <Text className="text-gray-400 text-center">No talents found.</Text>
        )}
        {talents.map(talent => (
          <View key={talent.id} className="bg-gray-100 rounded-xl mb-6 p-5 flex-row items-center">
            <View className="h-16 w-16 rounded-full bg-gray-300 items-center justify-center overflow-hidden mr-5">
              {talent.image ? (
                <Image source={{ uri: talent.image }} className="h-full w-full" />
              ) : (
                <Text className="text-xl font-bold text-gray-600">
                  {talent.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold">{talent.name}</Text>
              <Text className="text-green-800">{talent.service}</Text>
              <Text className="text-gray-700">{talent.location}</Text>
              <View className="flex-row items-center mt-1">
                 <FontAwesome name="star" size={16} color="#E5E7EB" />
                <Text className="ml-1 text-gray-400">No ratings yet</Text>
              </View>
              <Text className="mt-1 font-semibold">{talent.price}</Text>
              <Button 
                className="mt-3 bg-green-800 rounded-lg"
                onPress={() => {/* In real app: router.push(`/booking/${talent.id}`) */}}
              >
                <Text className="text-white font-semibold">Book Now</Text>
              </Button>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}


