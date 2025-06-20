 // app/talent/index.tsx(talent-dashboard.tsx)

  
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

const TABS = [
  { key: 'community', label: 'Community' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'messages', label: 'Messages' },
];

export default function TalentDashboard() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('community');
  
  const { user } = useAuthStore();
  const userName = user?.name || 'Talent';
  const profileImage = user?.photoURL || null;
  
  // Mock profile completion - you can replace this with actual store data
  const [profileCompletion] = useState(75); // Replace with actual calculation from store

  const isWeb = Platform.OS === 'web';
  const headerHeight = isWeb ? Math.min(180, height * 0.25) : 180;

  // Content for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "community":
        return (
          <View style={styles.contentContainer}>
            {/* Profile completion bar */}
            <View style={styles.completionContainer}>
              <Text style={styles.sectionTitle}>Profile Completion</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${profileCompletion}%` },
                  ]}
                />
              </View>
              <Text style={styles.completionText}>
                {profileCompletion}% Complete
              </Text>
            </View>
            {/* Today's Schedule */}
            <View style={styles.scheduleContainer}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <Text style={styles.placeholderText}>
                No appointments scheduled for today
              </Text>
            </View>
            {/* Recent Reviews */}
            <View style={styles.reviewsContainer}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
              <Text style={styles.placeholderText}>No reviews yet</Text>
            </View>
          </View>
        );
      case "bookings":
        // Import your Bookings screen (replace with actual import!)
        const Bookings = require("./bookings").default;
        return <Bookings />;
      case "messages":
        // Import your Messages screen (replace with actual import!)
        const Messages = require("./messages").default;
        return <Messages />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
      >
        {/* Green Header */}
        <View style={[styles.headerContainer, { height: headerHeight }]}>
          <TouchableOpacity
            style={[styles.settingsIcon, { top: isWeb ? 20 : 40 }]}
            onPress={() => router.push("/talent/settings")}
            accessibilityLabel="Go to Settings"
          >
            <Feather name="settings" size={24} color="#fff" />
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

        {/* Centered Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
        >
          <View style={styles.tabsRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  { minWidth: width / (isWeb ? 6 : 4) },
                ]}
                onPress={() => setActiveTab(tab.key)}
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
        <View style={styles.contentArea}>{renderTabContent()}</View>
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
    paddingTop: Platform.OS === "web" ? 20 : 0,
  },
  profileImage: {
    width: Platform.OS === "web" ? 72 : 92,
    height: Platform.OS === "web" ? 72 : 92,
    borderRadius: Platform.OS === "web" ? 36 : 46,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "white",
  },
  profilePlaceholder: {
    width: Platform.OS === "web" ? 72 : 92,
    height: Platform.OS === "web" ? 72 : 92,
    borderRadius: Platform.OS === "web" ? 36 : 46,
    backgroundColor: "#166534",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "white",
  },
  profileName: {
    color: "#fff",
    fontSize: Platform.OS === "web" ? 18 : 21,
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
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  completionContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#16a34a",
  },
  completionText: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111",
  },
  scheduleContainer: {
    marginBottom: 24,
  },
  reviewsContainer: {
    marginBottom: 24,
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
  },
});