// //app/talent/bookings.tsx

// import React, { useState } from "react";
// import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native";
// import { Calendar, User } from "lucide-react-native";

// export default function TalentBookings() {
//   const [bookings, setBookings] = useState([
//     { id: 1, client: "Client X", service: "Photography", date: "2025-05-27", time: "10:00 AM", status: "pending" },
//     { id: 2, client: "Client Y", service: "Makeup", date: "2025-05-27", time: "3:00 PM", status: "confirmed" },
//   ]);
  
//   const handleBookingAction = (id: number, action: "accept" | "decline") => {
//     setBookings(prev =>
//       prev.map(b =>
//         b.id === id ? { ...b, status: action === "accept" ? "confirmed" : "declined" } : b
//       )
//     );
//     Alert.alert("Booking", `Booking ${action === "accept" ? "accepted" : "declined"}`);
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView className="flex-1 p-6">
//         <Text className="text-2xl font-bold mb-4">Your Bookings</Text>
//         {bookings.map((booking) => (
//           <View key={booking.id} className="mb-4 bg-gray-100 p-4 rounded-xl">
//             <View className="flex-row items-center mb-2">
//               <User size={18} color="#166534" className="mr-2" />
//               <Text className="font-bold">{booking.client}</Text>
//               <Text className="ml-2 text-gray-600">{booking.service}</Text>
//             </View>
//             <Text className="mb-2">{booking.date} at {booking.time}</Text>
//             <Text className="mb-2 text-sm">Status: <Text className={`font-bold ${booking.status === "confirmed" ? "text-green-700" : booking.status === "declined" ? "text-red-600" : "text-yellow-700"}`}>{booking.status}</Text></Text>
//             {booking.status === "pending" && (
//               <View className="flex-row space-x-4">
//                 <TouchableOpacity
//                   className="bg-green-800 py-2 px-4 rounded-full"
//                   onPress={() => handleBookingAction(booking.id, "accept")}
//                 >
//                   <Text className="text-white">Accept</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   className="bg-red-500 py-2 px-4 rounded-full"
//                   onPress={() => handleBookingAction(booking.id, "decline")}
//                 >
//                   <Text className="text-white">Decline</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         ))}
//         {/* Repeat today's schedule, etc. */}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
