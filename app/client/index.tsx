 //app/client/index.tsx(client-dashboard.tsx)
 import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useAuthStore } from '@/store/authStore';
import Bookings from "./bookings";
import SearchTalent from "./search-talent";
import { SafeAreaView } from "react-native-safe-area-context";
import Messages from "./messages";

const TABS = [
  { key: "community", label: "Community" },
  { key: "bookings", label: "Bookings" },
  { key: "search-talent", label: "Search Talent" },
  { key: "messages", label: "Messages" },
];

export default function ClientDashboard() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<string>("community");

  const { user } = useAuthStore();
  const userName = user?.name || "Client";
  const profileImage = user?.photoURL || null;

  const isWeb = Platform.OS === 'web';
  const headerHeight = isWeb ? Math.min(180, height * 0.25) : 180;

  const handleTabPress = (tabKey: string) => setActiveTab(tabKey);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={[styles.headerContainer, { height: headerHeight }]}>          
          <TouchableOpacity
            style={[styles.settingsIcon, { top: isWeb ? 20 : 40 }]}
            onPress={() => router.push("/client/settings")}
            accessibilityLabel="Go to Settings"
          >
            <Ionicons name="settings-sharp" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.profileContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <FontAwesome name="user" size={isWeb ? 40 : 60} color="#fff" />
              </View>
            )}
            <Text style={styles.profileName}>{userName}</Text>
          </View>
        </View>

        {/* Custom Top Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
        >
          <View style={styles.tabsRow}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  { minWidth: width / (isWeb ? 6 : 4) }
                ]}
                onPress={() => handleTabPress(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
                {activeTab === tab.key && (
                  <View style={styles.activeUnderline} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {activeTab === "community" && (
            <View>
              <Text>Your dashboard here</Text>
              {/* Add actual dashboard content! */}
            </View>
          )}
          {activeTab === "bookings" && <Bookings />}
          {activeTab === "search-talent" && <SearchTalent />}
          {activeTab === "messages" && <Messages />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#17994B",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    marginBottom: 12,
    ...Platform.select({
      web: {
        minHeight: 150,
        maxHeight: 180,
      },
    }),
  },
  settingsIcon: {
    position: "absolute",
    right: 24,
    zIndex: 2,
  },
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === 'web' ? 20 : 0,
  },
  profileImage: {
    width: Platform.OS === 'web' ? 72 : 92,
    height: Platform.OS === 'web' ? 72 : 92,
    borderRadius: Platform.OS === 'web' ? 36 : 46,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "white",
  },
  profilePlaceholder: {
    width: Platform.OS === 'web' ? 72 : 92,
    height: Platform.OS === 'web' ? 72 : 92,
    borderRadius: Platform.OS === 'web' ? 36 : 46,
    backgroundColor: "#166534",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "white",
  },
  profileName: {
    color: "#fff",
    fontSize: Platform.OS === 'web' ? 18 : 21,
    fontWeight: "bold",
    letterSpacing: 0.4,
    textShadowColor: "#164",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  tabsContainer: {
    maxHeight: 44,
    marginBottom: 6,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  tabItem: {
    alignItems: "center",
    paddingVertical: 6,
    marginHorizontal: 8,
  },
  tabText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  activeTabText: {
    color: "#166534",
    fontWeight: "bold",
  },
  activeUnderline: {
    height: 2.5,
    width: 30,
    backgroundColor: "#166534",
    marginTop: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  deleteText: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
