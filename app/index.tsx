 // app/index.tsx    onboarding screens

 // app/index.tsx    onboarding screens

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "~/components/ui/button";

export default function IndexScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { width } = useWindowDimensions(); // Responsive width that updates with orientation changes

  // Navigate to user-type screen
  const navigateToUserType = () => {
    router.replace("/user-type");
  };

  // Skip button press handler
  const handleSkip = () => {
    navigateToUserType();
  };

  // Handle page scroll change
  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const pageIndex = Math.round(contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  // Onboarding slides content
  const slides = [
    {
      title: "Welcome to Kwiyeh!",
      description:
        "Discover and book skilled service providers near you, from barbers to beauty experts, all in one.",
      image: require("@/assets/images/Onbaording screen 1.png"),
      textAlign: "left",
    },
    {
      title: "Flexible booking and real time availability.",
      description:
        "Choose a service, pick a time and get matched with trusted professionals. Managing your appointments has never been made easier!",
      image: require("@/assets/images/Onboarding screen 2.png"),
      textAlign: "center",
    },
    {
      title: "Connect and get support.",
      description:
        "Message your provider, leave reviews, and reach out to our support team if you need help. We are here for you!",
      image: require("@/assets/images/Onboarding screen 3.png"),
      textAlign: "right",
    },
  ];

  // Platform-specific styling
  const isWeb = Platform.OS === 'web';

  return (
    <View className="flex-1 bg-white">
      {/* ===== Onboarding Slides Section ===== */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
      >
        {slides.map((slide, index) => (
          <View 
            key={index} 
            style={{ width }} 
            className="flex-1"
          >
            <ImageBackground
              source={slide.image}
              className="flex-1"
              resizeMode="cover"
            >
              {/* ===== Content Container Section ===== */}
              <View className="flex-1 px-6 py-12 justify-between">
                {/* Top spacing container */}
                <View />

                {/* ===== Bottom content area - CONSISTENT ACROSS ALL SLIDES ===== */}
                <View className="w-full mb-16">
                  <Text
                    className="text-2xl md:text-3xl font-bold text-black mb-4"
                    style={{ 
                      textAlign: slide.textAlign as "left" | "center" | "right" | "auto",
                      // Web-specific font adjustments
                      ...(isWeb && { fontFamily: 'system-ui, -apple-system, sans-serif' })
                    }}
                  >
                    {slide.title}
                  </Text>
                  <Text
                    className="text-base md:text-lg text-black"
                    style={{ 
                      textAlign: slide.textAlign as "left" | "center" | "right" | "auto",
                      ...(isWeb && { fontFamily: 'system-ui, -apple-system, sans-serif' })
                    }}
                  >
                    {slide.description}
                  </Text>

                  {/* ===== Pagination Dots Section - CONSISTENT POSITIONING ===== */}
                  <View className="flex-row justify-center items-center mt-8">
                    {slides.map((_, dotIndex) => (
                      <View
                        key={dotIndex}
                        className={`h-2 mx-1 rounded-full ${
                          dotIndex === currentPage ? "w-6" : "w-2"
                        }`}
                        style={{
                          backgroundColor: dotIndex === currentPage ? "#FFFFFF" : "#E6FF79",
                        }}
                      />
                    ))}
                  </View>
                </View>

                {/* ===== Action Button Section - ONLY ON LAST SLIDE ===== */}
                {index === slides.length - 1 && (
                  <View className="absolute bottom-6 left-0 right-0 flex items-center">
                    <Button
                      className="bg-green-800 py-4 px-10 rounded-full"
                      onPress={navigateToUserType}
                      accessibilityLabel="Start using app"
                    >
                      <Text className="text-white text-xl font-semibold">Start</Text>
                    </Button>
                  </View>
                )}

                {/* ===== Skip Button Section - NOT ON LAST SLIDE ===== */}
                {index !== slides.length - 1 && (
                  <TouchableOpacity
                    className="absolute bottom-12 right-6"
                    onPress={handleSkip}
                    accessibilityLabel="Skip onboarding"
                  >
                    <Text className="text-black text-lg font-medium">Skip</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}