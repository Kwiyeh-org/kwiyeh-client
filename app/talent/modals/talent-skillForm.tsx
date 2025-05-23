// // app/talent/modals/talent-skillForm.tsx
// //it's moved here to solve routing issues  that's how expo routing works

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   SafeAreaView,
//   ScrollView,
//   Alert,
//   TouchableOpacity,
//   Image,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Button } from "~/components/ui/button";
// import { Input } from "~/components/ui/input";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as ImagePicker from "expo-image-picker";
// import { ImageIcon, MapPin } from "lucide-react-native";

// export default function TalentSkillForm() {
//   const router = useRouter();
//   const [skills, setSkills] = useState("");
//   const [experience, setExperience] = useState("");
//   const [services, setServices] = useState("");
//   const [pricing, setPricing] = useState("");
//   const [portfolio, setPortfolio] = useState<string[]>([]);
//   const [availability, setAvailability] = useState("");
//   const [location, setLocation] = useState("");
//   const [isSaving, setIsSaving] = useState(false);

//   // Pick multiple images for portfolio/gallery
//   const pickPortfolioImages = async () => {
//     try {
//       if (Platform.OS !== "web") {
//         const { status } =
//           await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (status !== "granted") {
//           Alert.alert(
//             "Permission Required",
//             "Sorry, we need camera roll permissions to make this work!"
//           );
//           return;
//         }
//       }
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsMultipleSelection: true,
//         quality: 0.8,
//       });
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         setPortfolio((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
//       }
//     } catch {
//       Alert.alert("Error", "Failed to select images");
//     }
//   };

//   // Modular location picker (reuse, push to your location picker route)
//   const openLocationPicker = () => router.push("/talent/location-picker");

//   // Save info to AsyncStorage and go to dashboard
//   const handleSubmit = async () => {
//     setIsSaving(true);
//     try {
//       await AsyncStorage.multiSet([
//         ["talentSkills", skills],
//         ["talentExperience", experience],
//         ["talentServices", services],
//         ["talentPricing", pricing],
//         ["talentPortfolio", JSON.stringify(portfolio)],
//         ["talentAvailability", availability],
//         ["talentLocation", location],
//       ]);
//       router.replace("/talent");
//     } catch {
//       Alert.alert("Error", "Failed to save profile");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView className="flex-1 p-6">
//         <Text className="text-3xl font-bold mb-8">Talent Profile Setup</Text>
//         <Text className="text-base text-gray-700 mb-6">
//           Complete your talent profile. You can skip any section and update it
//           later in settings.
//         </Text>

//         {/* Skills */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Skills</Text>
//           <Input
//             value={skills}
//             onChangeText={setSkills}
//             placeholder="e.g. Photography, Web Design"
//           />
//         </View>

//         {/* Years of Experience */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Years of Experience</Text>
//           <Input
//             value={experience}
//             onChangeText={setExperience}
//             placeholder="e.g. 5"
//             keyboardType="numeric"
//           />
//         </View>

//         {/* Services Offered */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Services Offered</Text>
//           <Input
//             value={services}
//             onChangeText={setServices}
//             placeholder="e.g. Headshots, Hair Styling"
//           />
//         </View>

//         {/* Pricing */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Pricing</Text>
//           <Input
//             value={pricing}
//             onChangeText={setPricing}
//             placeholder="e.g. $50/hr, $200 flat"
//             keyboardType="default"
//           />
//         </View>

//         {/* Portfolio / Gallery */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Portfolio / Gallery</Text>
//           <Button
//             onPress={pickPortfolioImages}
//             className="mb-2 flex-row items-center"
//           >
//             <ImageIcon size={18} color="#fff" />
//             <Text className="text-white ml-2">Add Photos</Text>
//           </Button>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {portfolio.map((uri, idx) => (
//               <Image
//                 key={idx}
//                 source={{ uri }}
//                 style={{
//                   width: 60,
//                   height: 60,
//                   borderRadius: 8,
//                   marginRight: 8,
//                 }}
//               />
//             ))}
//           </ScrollView>
//         </View>

//         {/* Availability */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Availability</Text>
//           <Input
//             value={availability}
//             onChangeText={setAvailability}
//             placeholder="e.g. Mon-Fri 9am-5pm"
//           />
//         </View>

//         {/* Location */}
//         <View className="mb-8">
//           <Text className="font-medium mb-1">Location</Text>
//           <TouchableOpacity
//             className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-300"
//             onPress={openLocationPicker}
//           >
//             <MapPin size={20} color="#666" className="mr-2" />
//             <Text className={location ? "text-black" : "text-gray-400"}>
//               {location || "Set your location (optional)"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <Button
//           className="bg-green-800 py-4 rounded-full my-8"
//           onPress={handleSubmit}
//           disabled={isSaving}
//         >
//           <Text className="text-white text-lg font-semibold">
//             {isSaving ? "Saving..." : "Submit"}
//           </Text>
//         </Button>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
