// // app/talent/index.tsx(talent-dashboard.tsx)

// import React, { useEffect, useState } from "react";
// import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Star, Calendar, UserCog } from "lucide-react-native";
// import { useRouter } from "expo-router";

// export default function TalentDashboard() {
//   const router = useRouter();
//   const [profileCompletion, setProfileCompletion] = useState(0);
//   const [schedules, setSchedules] = useState([
//     { time: "9:00 AM", client: "Client A", service: "Haircut" },
//     { time: "1:00 PM", client: "Client B", service: "Makeup" },
//   ]);
//   const [reviews, setReviews] = useState([
//     { author: "Jane Doe", rating: 5, comment: "Great service!" },
//     // fetch from storage/backend in real app
//   ]);

//   // 🚨 New: Redirect to SkillForm if profile incomplete
//   useEffect(() => {
//     // Check if profile setup is done (e.g. at least skills exist)
//     (async () => {
//       const [skills, exp, services, pricing, portfolio, avail, location] =
//         await AsyncStorage.multiGet([
//           "talentSkills",
//           "talentExperience",
//           "talentServices",
//           "talentPricing",
//           "talentPortfolio",
//           "talentAvailability",
//           "talentLocation",
//         ]).then(arr => arr.map(item => item[1]));
//       const profileFields = [skills, exp, services, pricing, portfolio, avail, location];
//       const isProfileSet = profileFields.some(Boolean); // Any field filled = profile started

//       if (!isProfileSet) {
//         // If ALL fields are empty/null, send to skill form
//         router.replace("/talent/modals/talent-skillForm");
//         return;
//       }
//       // Otherwise, compute completion
//       let filled = profileFields.filter(Boolean).length;
//       setProfileCompletion(Math.round((filled / 7) * 100));
//     })();
//   }, []);

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView className="flex-1 p-6">
//         {/* Profile completion bar */}
//         <View className="mb-8">
//           <Text className="text-lg font-semibold mb-2">Profile Completion</Text>
//           <View className="w-full h-4 bg-gray-200 rounded-full mb-2">
//             <View style={{
//               width: `${profileCompletion}%`,
//               height: 16,
//               backgroundColor: "#16a34a",
//               borderRadius: 999,
//             }} />
//           </View>
//           <Text className="text-sm text-gray-600">{profileCompletion}% Complete</Text>
//         </View>

//         {/* Today's Schedule */}
//         <View className="mb-8">
//           <Text className="text-lg font-semibold mb-2">Today's Schedule</Text>
//           {schedules.length ? schedules.map((item, idx) => (
//             <View key={idx} className="flex-row items-center mb-2">
//               <Calendar size={18} color="#166534" className="mr-2" />
//               <Text>{item.time} - {item.client} ({item.service})</Text>
//             </View>
//           )) : <Text>No schedule for today.</Text>}
//         </View>

//         {/* Reviews */}
//         <View className="mb-8">
//           <Text className="text-lg font-semibold mb-2">Profile Reviews</Text>
//           {reviews.length ? reviews.map((rev, idx) => (
//             <View key={idx} className="mb-2">
//               <View className="flex-row items-center">
//                 <Star size={16} color="#FFD700" className="mr-1" />
//                 <Text className="font-bold">{rev.author}</Text>
//                 <Text className="ml-2 text-yellow-600">{'★'.repeat(rev.rating)}</Text>
//               </View>
//               <Text className="text-gray-600">{rev.comment}</Text>
//             </View>
//           )) : <Text>No reviews yet.</Text>}
//         </View>

//         {/* Profile Management Shortcut */}
//         <TouchableOpacity
//           className="flex-row items-center mt-8"
//           onPress={() => router.push("/talent/settings")}
//         >
//           <UserCog size={20} color="#166534" />
//           <Text className="ml-2 text-green-800 font-semibold">Edit Profile / Settings</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
