 // app/user-type.tsx

import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function UserTypeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedRole, setSelectedRole] = useState<"client" | "talent" | null>(
    null
  );

  // Only navigate on the Continue button press
  const handleContinue = () => {
    if (selectedRole === "client") {
      router.push("/signup-client");
    } else if (selectedRole === "talent") {
      router.push("/signup-talent");
    }
  };

  // Use a breakpoint to determine layout
  const isDesktop = width >= 768; // Common tablet/desktop breakpoint

  return (
    <ScrollView className="flex-1 bg-[#E6FF79]">
      <View className="flex-1 px-6 pt-16 pb-8 max-w-4xl mx-auto">
        <View className="mt-16 mb-8 items-center">
          <Text className="text-4xl font-bold text-black mb-2 text-center">
            Welcome to Kwiyeh!
          </Text>
          <Text className="text-2xl text-black text-center">Please select your role</Text>
        </View>

        {/* Container for cards - row on desktop, column on mobile */}
        <View className={`${isDesktop ? "flex-row justify-center items-center space-x-12" : "space-y-6"}`}>
          {/* Client Role Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedRole("client")}
            className={isDesktop ? "flex-1 max-w-md" : ""}
          >
            <Card
              className={`overflow-hidden rounded-3xl bg-transparent ${
                selectedRole === "client" ? "border-2 border-black" : ""
              }`}
            >
              {isDesktop ? (
                // Desktop layout - stacked
                <View>
                  <Image
                    source={require("@/assets/images/client-role.png")}
                    className="w-full h-48 rounded-t-3xl"
                    resizeMode="cover"
                  />
                  <View className="p-6 flex-1 justify-center bg-transparent">
                    <Text className="text-2xl font-bold mb-2">Client</Text>
                    <Text className="text-base">I'm looking for a service.</Text>
                  </View>
                </View>
              ) : (
                // Mobile layout - side by side
                <View className="flex-row">
                  <Image
                    source={require("@/assets/images/client-role.png")}
                    className="w-40 h-40 rounded-l-3xl"
                    resizeMode="cover"
                  />
                  <View className="p-6 flex-1 justify-center bg-transparent flex-shrink-1">
                    <Text className="text-2xl font-bold mb-2">Client</Text>
                    <Text className="text-base">I'm looking for a service.</Text>
                  </View>
                </View>
              )}
            </Card>
          </TouchableOpacity>

          {/* Separator - horizontal on mobile, vertical on desktop */}
          {isDesktop ? (
            <Separator className="bg-black opacity-20 h-64 w-0.5" orientation="vertical" />
          ) : (
            <Separator className="bg-black opacity-20 my-5" />
          )}

          {/* Talent Role Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedRole("talent")}
            className={isDesktop ? "flex-1 max-w-md" : ""}
          >
            <Card
              className={`overflow-hidden rounded-3xl bg-transparent ${
                selectedRole === "talent" ? "border-2 border-black" : ""
              }`}
            >
              {isDesktop ? (
                // Desktop layout - stacked
                <View>
                  <Image
                    source={require("@/assets/images/talent-role.png")}
                    className="w-full h-48 rounded-t-3xl"
                    resizeMode="cover"
                  />
                  <View className="p-6 flex-1 justify-center bg-transparent">
                    <Text className="text-2xl font-bold mb-2">Talent</Text>
                    <Text className="text-base">I want to offer my services</Text>
                  </View>
                </View>
              ) : (
                // Mobile layout - side by side
                <View className="flex-row">
                  <Image
                    source={require("@/assets/images/talent-role.png")}
                    className="w-40 h-40 rounded-l-3xl"
                    resizeMode="cover"
                  />
                  <View className="p-6 flex-1 justify-center bg-transparent flex-shrink-1">
                    <Text className="text-2xl font-bold mb-2">Talent</Text>
                    <Text className="text-base">I want to offer my services</Text>
                  </View>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        </View>

        <View className="mt-12">
          <Button
            className="bg-green-800 py-6 rounded-full max-w-md mx-auto w-full"
            disabled={!selectedRole}
            onPress={handleContinue}
          >
            <Text className="text-white text-xl font-semibold">Continue</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}