//app/talent/messages.tsx

  import React from "react";
import { 
  View, 
  Text, 
  // SafeAreaView, 
  StyleSheet, 
  Platform 
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function TalentMessages() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FontAwesome name="comments-o" size={40} color="#9CA3AF" />
        <Text style={styles.text}>Messages coming soon!</Text>
        <Text style={styles.subtext}>
          You'll be able to chat with your clients here
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        maxWidth: 600,
        marginHorizontal: 'auto',
      },
    }),
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});