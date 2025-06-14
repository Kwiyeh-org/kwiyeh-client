 // app/client/_layout.tsx

 import { Stack } from "expo-router";
import { View } from "react-native";

export default function ClientStackLayout() {
  return (
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { 
            flex: 1,
            backgroundColor: '#fff',
          },
          animation: 'slide_from_right',
        }} 
      />
  );
}