// //app/talent/settings.tsx

// import React, { useState, useEffect } from "react";
// import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, Alert, ActivityIndicator } from "react-native";
// import { Input } from "~/components/ui/input";
// import { Button } from "~/components/ui/button";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { User, Camera, MapPin, ImageIcon } from "lucide-react-native";
// import * as ImagePicker from "expo-image-picker";
// import { useRouter } from "expo-router";

// export default function TalentSettings() {
//   const router = useRouter();
//   const [fullName, setFullName] = useState("");
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [location, setLocation] = useState("");
//   const [services, setServices] = useState("");
//   const [pricing, setPricing] = useState("");
//   const [portfolio, setPortfolio] = useState<string[]>([]);
//   const [availability, setAvailability] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     const loadUserData = async () => {
//       setIsLoading(true);
//       try {
//         const name = await AsyncStorage.getItem("talentFullName");
//         const img = await AsyncStorage.getItem("talentProfileImage");
//         const loc = await AsyncStorage.getItem("talentLocation");
//         const srv = await AsyncStorage.getItem("talentServices");
//         const prc = await AsyncStorage.getItem("talentPricing");
//         const port = await AsyncStorage.getItem("talentPortfolio");
//         const avail = await AsyncStorage.getItem("talentAvailability");
//         if (name) setFullName(name);
//         if (img) setProfileImage(img);
//         if (loc) setLocation(loc);
//         if (srv) setServices(srv);
//         if (prc) setPricing(prc);
//         if (port) setPortfolio(JSON.parse(port));
//         if (avail) setAvailability(avail);
//       } catch (e) {
//         Alert.alert("Error", "Failed to load profile");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     loadUserData();
//   }, []);

//   // Pick profile image
//   const pickProfileImage = async () => {
//     try {
//       if (Platform.OS !== 'web') {
//         const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (status !== 'granted') {
//           Alert.alert('Permission Required', 'Sorry, we need camera roll permissions.');
//           return;
//         }
//       }
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//       });
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const uri = result.assets[0].uri;
//         setProfileImage(uri);
//         await AsyncStorage.setItem("talentProfileImage", uri);
//       }
//     } catch (e) {
//       Alert.alert("Error", "Failed to select image");
//     }
//   };

//   // Pick portfolio images (multi-image)
//   const pickPortfolioImages = async () => {
//     try {
//       if (Platform.OS !== 'web') {
//         const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (status !== 'granted') {
//           Alert.alert('Permission Required', 'Sorry, we need camera roll permissions.');
//           return;
//         }
//       }
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsMultipleSelection: true,
//         quality: 0.8,
//       });
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const uris = result.assets.map(a => a.uri);
//         setPortfolio(prev => [...prev, ...uris]);
//         await AsyncStorage.setItem("talentPortfolio", JSON.stringify([...portfolio, ...uris]));
//       }
//     } catch (e) {
//       Alert.alert("Error", "Failed to select images");
//     }
//   };

//   // Save everything
//   const saveProfile = async () => {
//     setIsSaving(true);
//     try {
//       await AsyncStorage.multiSet([
//         ["talentFullName", fullName],
//         ["talentProfileImage", profileImage ?? ""],
//         ["talentLocation", location],
//         ["talentServices", services],
//         ["talentPricing", pricing],
//         ["talentPortfolio", JSON.stringify(portfolio)],
//         ["talentAvailability", availability],
//       ]);
//       Alert.alert("Success", "Profile updated successfully!");
//     } catch (e) {
//       Alert.alert("Error", "Failed to save profile");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Open location picker (reuse as for client)
//   const openLocationPicker = () => router.push("/talent/location-picker");

//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#166534" />
//         <Text>Loading...</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView className="flex-1 p-6">
//         <Text className="text-3xl font-bold mb-6">Edit Talent Profile</Text>
//         {/* Profile Photo */}
//         <TouchableOpacity onPress={pickProfileImage} className="items-center mb-4">
//           <View className="h-24 w-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
//             {profileImage ? (
//               <Image source={{ uri: profileImage }} className="h-full w-full" />
//             ) : (
//               <User size={40} color="#666" />
//             )}
//           </View>
//           <View className="absolute bottom-0 right-0 bg-green-800 p-2 rounded-full">
//             <Camera size={16} color="white" />
//           </View>
//           <Text className="text-sm text-gray-500 mt-2">Tap to change photo</Text>
//         </TouchableOpacity>
//         {/* Name */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Full Name</Text>
//           <Input value={fullName} onChangeText={setFullName} placeholder="Your name" />
//         </View>
//         {/* Location */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Location</Text>
//           <TouchableOpacity
//             className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-300"
//             onPress={openLocationPicker}
//           >
//             <MapPin size={20} color="#666" className="mr-2" />
//             <Text className={location ? "text-black" : "text-gray-400"}>
//               {location || "Set your location"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//         {/* Services and Pricing */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Services</Text>
//           <Input value={services} onChangeText={setServices} placeholder="List services (e.g. Photography, Haircut)" />
//         </View>
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Pricing</Text>
//           <Input value={pricing} onChangeText={setPricing} placeholder="e.g. $50/hr, $200 flat, etc." keyboardType="numeric" />
//         </View>
//         {/* Portfolio/Gallery */}
//         <View className="mb-4">
//           <Text className="font-medium mb-1">Portfolio / Gallery</Text>
//           <Button onPress={pickPortfolioImages} className="mb-2 flex-row items-center">
//             <ImageIcon size={18} color="#fff" />
//             <Text className="text-white ml-2">Add Photos</Text>
//           </Button>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {portfolio.map((uri, idx) => (
//               <Image key={idx} source={{ uri }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 8 }} />
//             ))}
//           </ScrollView>
//         </View>
//         {/* Availability Calendar (for now, just a text input or picker) */}
//         <View className="mb-8">
//           <Text className="font-medium mb-1">Availability</Text>
//           <Input value={availability} onChangeText={setAvailability} placeholder="e.g. Mon-Fri 9am-5pm" />
//         </View>
//         <Button className="bg-green-800 py-3 rounded-xl" onPress={saveProfile} disabled={isSaving}>
//           <Text className="text-white font-semibold">{isSaving ? "Saving..." : "Save Changes"}</Text>
//         </Button>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
