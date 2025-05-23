//  // app/talent/_layout.tsx

// import React from "react";
// import { Tabs, Slot } from "expo-router";
// import { Home, Calendar, MessageSquare, Settings } from "lucide-react-native";

// export default function TalentLayout() {
//   return (
//     <>
//       <Tabs
//         screenOptions={{
//           tabBarStyle: {
//             backgroundColor: "white",
//             borderTopWidth: 1,
//             borderTopColor: "#E5E5E5",
//           },
//           tabBarActiveTintColor: "#166534",
//           tabBarInactiveTintColor: "#9CA3AF",
//           headerShown: false,
//         }}
//       >
//         <Tabs.Screen
//           name="index"
//           options={{
//             title: "Dashboard",
//             tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
//           }}
//         />
//         <Tabs.Screen
//           name="bookings"
//           options={{
//             title: "Bookings",
//             tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
//           }}
//         />
//         <Tabs.Screen
//           name="messages"
//           options={{
//             title: "Messages",
//             tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
//           }}
//         />
//         <Tabs.Screen
//           name="settings"
//           options={{
//             title: "Settings",
//             tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
//           }}
//         />
//       </Tabs>
//       {/* This Slot renders extra pages, e.g. /talent/modals/skillForm */}
//       {/* <Slot /> */}
//     </>
//   );
// }
