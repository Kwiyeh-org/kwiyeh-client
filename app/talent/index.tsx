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
import { FontAwesome, Feather, Ionicons } from '@expo/vector-icons';
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
  
  // Dynamic profile completion calculation
  const profileFields = [
    user?.name,
    user?.photoURL,
    user?.location?.address,
    user?.services && user.services.length > 0,
    user?.pricing,
    user?.availability,
    user?.experience,
    typeof user?.isMobile === 'boolean',
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  const isWeb = Platform.OS === 'web';
  const headerHeight = isWeb ? Math.min(220, height * 0.3) : 220; // Increased height

  // Mock data for today's schedule
  const todaysSchedule = [
    {
      id: 1,
      clientName: 'John Doe',
      service: 'House Cleaning',
      time: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: 2,
      clientName: 'Jane Smith',
      service: 'Garden Maintenance',
      time: '2:00 PM',
      status: 'pending'
    }
  ];

  // Mock data for recent reviews
  const recentReviews = [
    {
      id: 1,
      clientName: 'Alice Johnson',
      rating: 5,
      comment: 'Excellent service! Very professional and thorough.',
      date: '2 days ago'
    },
    {
      id: 2,
      clientName: 'Bob Wilson',
      rating: 4,
      comment: 'Great work, would definitely recommend.',
      date: '1 week ago'
    }
  ];

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
              {todaysSchedule.length > 0 ? (
                todaysSchedule.map((appointment) => (
                  <View key={appointment.id} style={styles.scheduleItem}>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.clientName}>{appointment.clientName}</Text>
                      <Text style={styles.serviceName}>{appointment.service}</Text>
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      appointment.status === 'confirmed' ? styles.confirmedBadge : styles.pendingBadge
                    ]}>
                      <Text style={styles.statusText}>
                        {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.placeholderText}>
                  No appointments scheduled for today
                </Text>
              )}
            </View>

            {/* Recent Reviews */}
            <View style={styles.reviewsContainer}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
              {recentReviews.length > 0 ? (
                recentReviews.map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewClientName}>{review.clientName}</Text>
                      <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= review.rating ? "star" : "star-outline"}
                            size={16}
                            color={star <= review.rating ? "#FFD700" : "#D1D5DB"}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.placeholderText}>No reviews yet</Text>
              )}
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
            style={[styles.helpIcon, { top: isWeb ? 20 : 40 }]}
            onPress={() => router.push("/talent/help")}
            accessibilityLabel="Get Help"
          >
            <Ionicons name="help-circle" size={24} color="#fff" />
          </TouchableOpacity>
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
        minHeight: 180,
        maxHeight: 220,
      },
    }),
  },
  helpIcon: {
    position: "absolute",
    right: 64, // Positioned to the left of settings icon
    zIndex: 2,
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
  scheduleItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confirmedBadge: {
    backgroundColor: "#D1FAE5",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  reviewsContainer: {
    marginBottom: 24,
  },
  reviewItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewClientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  ratingContainer: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
  },
});