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
import { useEffect } from "react";

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

  const { user, isAuthenticated, hydrated } = useAuthStore();
  const userName = user?.name || "Client";
  const profileImage = user?.photoURL || null;

  const isWeb = Platform.OS === 'web';
  const headerHeight = isWeb ? Math.min(220, height * 0.3) : 220;

  useEffect(() => {
    if (!hydrated) return; // Wait for hydration!
    if (isAuthenticated && user?.role !== 'client') {
      if (user?.role === 'talent') {
        router.replace('/talent');
      } else {
        router.replace('/user-type');
      }
    } else if (!isAuthenticated) {
      router.replace('/login-client');
    }
  }, [hydrated, isAuthenticated, user?.role]);

  // Mock data for trending talents
  const trendingTalents = [
    {
      id: 1,
      name: 'Sarah Johnson',
      service: 'House Cleaning',
      rating: 4.9,
      reviews: 127,
      image: null,
      price: '$25/hr'
    },
    {
      id: 2,
      name: 'Mike Chen',
      service: 'Garden Maintenance',
      rating: 4.8,
      reviews: 89,
      image: null,
      price: '$30/hr'
    },
    {
      id: 3,
      name: 'Emma Davis',
      service: 'Pet Sitting',
      rating: 4.7,
      reviews: 156,
      image: null,
      price: '$20/hr'
    }
  ];

  // Mock data for recently viewed talents
  const recentViewedTalents = [
    {
      id: 1,
      name: 'Alex Thompson',
      service: 'Plumbing',
      lastViewed: '2 hours ago',
      image: null
    },
    {
      id: 2,
      name: 'Lisa Wang',
      service: 'House Cleaning',
      lastViewed: '1 day ago',
      image: null
    }
  ];

  // Mock data for special offers
  const specialOffers = [
    {
      id: 1,
      title: 'First Booking Discount',
      description: 'Get 20% off your first booking with any talent',
      discount: '20% OFF',
      validUntil: 'Dec 31, 2024'
    },
    {
      id: 2,
      title: 'Weekend Special',
      description: 'Book weekend services and save 15%',
      discount: '15% OFF',
      validUntil: 'This weekend'
    }
  ];

  const handleTabPress = (tabKey: string) => setActiveTab(tabKey);

  const renderCommunityContent = () => (
    <ScrollView style={styles.communityContent} showsVerticalScrollIndicator={false}>
      {/* Trending Talents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Talents</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {trendingTalents.map((talent) => (
            <TouchableOpacity key={talent.id} style={styles.talentCard}>
              <View style={styles.talentImageContainer}>
                {talent.image ? (
                  <Image source={{ uri: talent.image }} style={styles.talentImage} />
                ) : (
                  <View style={styles.talentImagePlaceholder}>
                    <FontAwesome name="user" size={24} color="#17994B" />
                  </View>
                )}
              </View>
              <Text style={styles.talentName}>{talent.name}</Text>
              <Text style={styles.talentService}>{talent.service}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{talent.rating}</Text>
                <Text style={styles.reviewsText}>({talent.reviews})</Text>
              </View>
              <Text style={styles.talentPrice}>{talent.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recently Viewed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Viewed</Text>
        {recentViewedTalents.map((talent) => (
          <TouchableOpacity key={talent.id} style={styles.recentItem}>
            <View style={styles.recentImageContainer}>
              {talent.image ? (
                <Image source={{ uri: talent.image }} style={styles.recentImage} />
              ) : (
                <View style={styles.recentImagePlaceholder}>
                  <FontAwesome name="user" size={20} color="#17994B" />
                </View>
              )}
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>{talent.name}</Text>
              <Text style={styles.recentService}>{talent.service}</Text>
              <Text style={styles.recentTime}>{talent.lastViewed}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Special Offers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Offers</Text>
        {specialOffers.map((offer) => (
          <View key={offer.id} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{offer.discount}</Text>
              </View>
            </View>
            <Text style={styles.offerDescription}>{offer.description}</Text>
            <Text style={styles.offerValidUntil}>Valid until: {offer.validUntil}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={[styles.headerContainer, { height: headerHeight }]}>          
          <Text style={[styles.appName, { top: isWeb ? 20 : 40 }]}>kwiyeh</Text>
          <TouchableOpacity
            style={[styles.helpIcon, { top: isWeb ? 20 : 40 }]}
            onPress={() => router.push("/client/help")}
            accessibilityLabel="Get Help"
          >
            <Ionicons name="help-circle" size={24} color="#fff" />
          </TouchableOpacity>
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
          {activeTab === "community" && renderCommunityContent()}
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
        minHeight: 180,
        maxHeight: 220,
      },
    }),
  },
  appName: {
    position: 'absolute',
    left: 20,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 1.5,
    zIndex: 10,
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
  communityContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
    marginBottom: 16,
  },
  horizontalScroll: {
    marginHorizontal: -8,
  },
  talentCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    width: 160,
    alignItems: "center",
  },
  talentImageContainer: {
    marginBottom: 12,
  },
  talentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },
  talentImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  talentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
    textAlign: "center",
  },
  talentService: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  talentPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#17994B",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recentImageContainer: {
    marginRight: 12,
  },
  recentImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
  },
  recentImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  recentService: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  recentTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  offerCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#17994B",
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    flex: 1,
  },
  discountBadge: {
    backgroundColor: "#17994B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  offerDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 20,
  },
  offerValidUntil: {
    fontSize: 12,
    color: "#6B7280",
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
