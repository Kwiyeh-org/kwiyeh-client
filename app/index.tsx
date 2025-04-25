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
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";


export default function IndexScreen() {
  // ===============================================================
  // Hooks & Navigation Setup
  // ===============================================================
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [startButtonHovered, setStartButtonHovered] = useState(false);
  const [skipButtonHovered, setSkipButtonHovered] = useState(false);
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 768; // Mobile-first: use flexible breakpoints 

  // Unified navigation function for all platforms and scenarios
  const navigateToNextScreen = () => {
    try {
      router.push("/user-type");
    } catch (error) {
      console.log("Navigation error, trying alternate method:", error);
      router.push("/user-type");
    }
  };

  // ===============================================================
  // Scroll Handling
  // ===============================================================
  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const pageIndex = Math.round(contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  // ===============================================================
  // Onboarding Slides Data with Desktop Styles
  // ===============================================================
  const slides = [
    {
      title: "Welcome to Kwiyeh!",
      description:
        "Discover and book skilled service providers near you, from barbers to beauty experts, all in one.",
      mobileImage: require("@/assets/images/Onboarding screen 1.png"),
      desktopImage: require("@/assets/images/Desktop-Onboarding1.png"),
      textAlign: "left",
      // Desktop-specific positioning
      desktopStyles: {
        containerStyle: {
          alignItems: "flex-start", // Left align text container
          paddingLeft: 50,          // Provide left padding
          paddingTop: 30,           // Reduced top padding to push content upward
          marginTop: 30,          // Additional negative margin to push content up
        } as ViewStyle,
      },
    },
    {
      title: "Flexible booking and real time availability.",
      description:
        "Choose a service, pick a time and get matched with trusted professionals. Managing your appointments has never been made easier!",
      mobileImage: require("@/assets/images/Onboarding screen 2.png"),
      desktopImage: require("@/assets/images/Desktop-Onboarding2.png"),
      textAlign: "center",
      desktopStyles: {
        containerStyle: {
          alignItems: "flex-end",   // Right align text container
          paddingRight: 150,        // Increased right padding to push content more to the right
          paddingTop: 100,          // Provide top padding
          marginRight: 50,          // Additional margin to push content more to the right
        } as ViewStyle,
      },
    },
    {
      title: "Connect and get support.",
      description:
        "Message your provider, leave reviews, and reach out to our support team if you need help. We are here for you!",
      mobileImage: require("@/assets/images/Onboarding screen 3.png"),
      desktopImage: require("@/assets/images/Desktop-Onboarding3.png"),
      textAlign: "left",            // Changed from right to left as requested
      desktopStyles: {
        containerStyle: {
          alignItems: "flex-start", // Left align text container
          paddingLeft: 50,          // Provide left padding
          paddingTop: 50,           // Reduced top padding to push content upward
          marginTop: -100,          // Additional negative margin to push content up
        } as ViewStyle,
      },
    },
  ];

  // ===============================================================
  // Universal Button Component
  // ===============================================================
  interface UniversalButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    label: string;
    className: string;
    textClassName: string;
    accessibilityLabel: string;
    isStart?: boolean; // For hover effects on the start button
    isSkip?: boolean;  // For hover effects on the skip button
  }

  const UniversalButton: React.FC<UniversalButtonProps> = ({
    onPress,
    label,
    className,
    textClassName,
    accessibilityLabel,
    isStart = false,
    isSkip = false,
  }) => {
    // Web-only hover handling
    const webOnlyProps =
      Platform.OS === "web"
        ? {
            onMouseEnter: isStart 
              ? () => setStartButtonHovered(true) 
              : isSkip 
                ? () => setSkipButtonHovered(true)
                : undefined,
            onMouseLeave: isStart 
              ? () => setStartButtonHovered(false) 
              : isSkip 
                ? () => setSkipButtonHovered(false)
                : undefined,
          }
        : {};

    return (
      <TouchableOpacity
        className={className}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        style={{
          cursor: "pointer",
          zIndex: Platform.OS === "web" ? 999 : undefined,
          ...(isStart &&
            isDesktop && {
              borderRadius: 30,
              backgroundColor: startButtonHovered ? "rgba(36, 79, 36, 0.9)" : "#2e6b2e",
            }),
          ...(isSkip &&
            isDesktop && {
              padding: 6,
              borderRadius: 20,
              backgroundColor: skipButtonHovered ? "rgba(230, 255, 121, 0.3)" : "transparent",
              transition: "background-color 0.3s",
            }),
        }}
        {...webOnlyProps}
      >
        <Text 
          className={textClassName}
          style={{
            ...(isSkip && isDesktop && {
              color: skipButtonHovered ? "#000000" : "#000000",
              fontWeight: skipButtonHovered ? "700" : "500",
              transition: "font-weight 0.3s",
            }),
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Function to get slide-specific content positioning for desktop
  const getDesktopContentStyle = (index: number): ViewStyle => {
    if (!isDesktop) return {};
    
    // Using the slide's desktop styles
    return {
      ...slides[index].desktopStyles?.containerStyle,
      maxWidth: width * 0.5, // 50% of screen width
      position: 'relative',
      zIndex: 10,
    };
  };

  // ===============================================================
  // Main Render: Onboarding Slides Layout
  // ===============================================================
  return (
    <SafeAreaView style={{ flex: 1 }}>
           <StatusBar backgroundColor="#71ED88" />
      
      <View style={{ flex: 1, height: "100%" }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="always"
          style={{ flex: 1, height }}
          contentContainerStyle={{ flexGrow: 1 }}
          decelerationRate="fast"
          snapToInterval={width}
          snapToAlignment="center"
        >
          {slides.map((slide, index) => (
            <View key={index} style={{ width, height }}>
              <ImageBackground
                source={isDesktop ? slide.desktopImage : slide.mobileImage}
                style={{
                  width: "100%",
                  height: "100%",
                  flex: 1,
                  position: "relative",
                }}
                resizeMode={isDesktop ? "stretch" : "cover"}
              >
                {/* =====================================================
                    Content Container Section:  
                    Implementing the draft's desktop text slide approach
                ====================================================== */}
                {isDesktop ? (
                  <View
              className={`mt-20 w-full flex flex-row ${index === 1 && "justify-end"}`}
                  >
                    <View className={`flex flex-col w-[45vw] ${index === 1 && "items-end w-[65vw]"} px-10 gap-6 `}>
                      <Text
                        className={`font-bold text-7xl mb-4 ${index === 1 && "text-6xl text-right"}`}
                      >
                        {slide.title}
                      </Text>
                      <Text
                        className={`font-normal text-3xl w-4/5 ${index===1 && "text-2xl text-right"}`}
                      >
                        {slide.description}
                      </Text>
                    </View>
                  </View>
                ) : (
                  // Mobile view: Retain the original container
                  <View className={`flex flex-col   mt-80  ${index===1 && "items-center mt-72"} ${index===2 && "items-end mt-92  justify-end"} px-6 py-40 w-full`}>
                    <Text
                      className={`md:text-3xl text-black mb-4 text-3xl text-left font-medium w-2/3 ${index===1 && "text-center"} ${index===2 && "text-right"}`}
                    >
                      {slide.title}
                    </Text>
                    <Text
                      className={`text-lg text-left font-normal w-2/3 ${index===1 && "text-center w-full"}  ${index===2 && "text-right"}`}
                    >
                      {slide.description}
                    </Text>
                  </View>
                )}

                {/* Skip Button Section (not on last slide) */}
                {index !== slides.length - 1 && (
                  <UniversalButton
                    className={`absolute ${isDesktop ? "bottom-16 right-10" : "bottom-12 right-6"}`}
                    onPress={navigateToNextScreen}
                    label="Skip"
                    textClassName={`text-black ${isDesktop ? "text-xl" : "text-lg"} font-medium`}
                    accessibilityLabel="Skip onboarding"
                    isSkip={true}
                  />
                )}

                {/* Pagination Dots */}
                <View className="flex-row justify-center items-center absolute bottom-4 left-0 right-0">
                  {slides.map((_, dotIndex) => (
                    <View
                      key={dotIndex}
                      className={`h-2 mx-1 rounded-full ${dotIndex === currentPage ? "w-6" : "w-2"}`}
                      style={{
                        backgroundColor: dotIndex === currentPage ? "#FFFFFF" : "#E6FF79",
                      }}
                    />
                  ))}
                </View>

                {/* Action Button Section (Only on last slide) */}
                {index === slides.length - 1 && (
                  <View
                    className={`absolute left-0 right-0 flex items-center ${
                      isDesktop ? "bottom-14" : "bottom-10"
                    }`}
                    style={{ zIndex: Platform.OS === "web" ? 999 : undefined }}
                  >
                    <UniversalButton
                      className={`bg-[#078409] ${isDesktop ? "py-2 px-6" : "py-1 px-8"} rounded-full lg:text-blue-400"` } 
                      onPress={navigateToNextScreen}
                      label="Start"
                      textClassName={`text-white ${isDesktop ? "text-2xl" : "text-xl"} font-semibold `}
                      accessibilityLabel="Start using app"
                      isStart={true}
                    />
                  </View>
                )}
              </ImageBackground>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
 