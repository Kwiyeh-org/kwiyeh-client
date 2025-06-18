//app/client/search-talent.tsx
  
  
 import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  // SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
} from "react-native";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Button } from "~/components/ui/button";
import { Rating } from "react-native-ratings";
import { SERVICES_CATEGORIES } from "~/constants/skill-list";
import { SafeAreaView } from 'react-native-safe-area-context';

import { locationService, type LocationData } from "~/services/location";
import CustomMapView, { Marker } from "../../components/CustomMapView";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "~/services/firebaseConfig";

interface Talent {
  id: string;
  name: string;
  services: string[] | string;
  rating?: number;
  profileImage?: string;
  isMoving?: boolean;
  address?: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  latitude?: number;
  longitude?: number;
  availability?: string;
  pricing?: string;
}

export default function SearchTalent() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [service, setService] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showRatingFilter, setShowRatingFilter] = useState(false);

  useEffect(() => {
    // Listen to Firebase talentLocations
    const db = getDatabase(app);
    const unsub = onValue(ref(db, "talentLocations"), (snapshot) => {
      const val = snapshot.val() || {};
      setTalents(Object.entries(val).map(([id, data]: any) => ({ id, ...data })));
    });
    // Load client location for map pin
    (async () => {
      const userLoc = await locationService.getUserLocation(false);
      setUserLocation(userLoc);
    })();
    return () => unsub();
  }, []);

  // Filter talents by both service and rating
  const filteredTalents = talents.filter((t) => {
    const serviceMatch = !service || 
      (Array.isArray(t.services) && t.services.includes(service));
    const ratingMatch = !selectedRating || 
      (t.rating && Math.floor(t.rating) >= selectedRating);
    return serviceMatch && ratingMatch;
  });

  // Rating filter component
  const RatingFilter = () => (
    <View style={styles.ratingFilterContainer}>
      <Text style={styles.ratingTitle}>Filter by Rating</Text>
      <Rating
        type="custom"
        ratingCount={5}
        imageSize={30}
        startingValue={selectedRating || 0}
        onFinishRating={(rating: number) => {
          setSelectedRating(rating === selectedRating ? null : rating);
          setShowRatingFilter(false);
        }}
        style={{ paddingVertical: 10 }}
        ratingBackgroundColor="#c8c7c8"
        tintColor="#fff"
      />
    </View>
  );

  // Enhanced Talent Card
  const TalentCard = ({ talent }: { talent: Talent }) => (
    <View style={styles.talentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            {talent.profileImage ? (
              <Image
                source={{ uri: talent.profileImage }}
                style={styles.profileImg}
                resizeMode="cover"
              />
            ) : (
              <FontAwesome name="user" size={30} color="#666" />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.talentName}>{talent.name}</Text>
            <Rating
              type="custom"
              readonly
              startingValue={talent.rating || 0}
              imageSize={16}
              style={{ alignSelf: 'flex-start', marginVertical: 4 }}
            />
            <Text style={styles.serviceText}>
              {Array.isArray(talent.services)
                ? talent.services.join(", ")
                : talent.services || "N/A"}
            </Text>
          </View>
        </View>
        {talent.isMoving && (
          <View style={styles.mobileBadge}>
            <Ionicons name="car" size={14} color="#fff" />
            <Text style={styles.mobileText}>Mobile</Text>
          </View>
        )}
      </View>

      <View style={styles.locationSection}>
        <Ionicons name="location" size={16} color="#666" />
        <Text style={styles.locationText}>
          {talent.address || talent.location?.address}
        </Text>
      </View>

      {talent.availability && (
        <View style={styles.availabilitySection}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.availabilityText}>{talent.availability}</Text>
        </View>
      )}

      {talent.pricing && (
        <View style={styles.pricingSection}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={styles.pricingText}>{talent.pricing}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <Button 
          style={styles.bookButton}
          onPress={() => {/* Handle booking */}}
        >
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.buttonText}>Book</Text>
        </Button>
        <Button 
          style={styles.messageButton}
          onPress={() => {/* Handle messaging */}}
        >
          <Ionicons name="chatbubble" size={20} color="#fff" />
          <Text style={styles.buttonText}>Message</Text>
        </Button>
      </View>
    </View>
  );

  // List View for Talents
  const renderList = () => (
    <ScrollView style={styles.listContainer}>
      {filteredTalents.length === 0 ? (
        <Text style={styles.noResults}>No talents found.</Text>
      ) : (
        filteredTalents.map((talent) => (
          <TalentCard key={talent.id} talent={talent} />
        ))
      )}
    </ScrollView>
  );

  // Map View
  const renderMap = () => (
    <CustomMapView
      style={{
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height - 120,
      }}
      initialRegion={{
        latitude: 4.0511,
        longitude: 9.7679,
        latitudeDelta: 0.3,
        longitudeDelta: 0.3,
      }}
    >
      {filteredTalents.map((talent) => (
        <Marker
          key={talent.id}
          coordinate={{
            latitude: talent.latitude ?? talent.location?.latitude ?? 4.0511,
            longitude: talent.longitude ?? talent.location?.longitude ?? 9.7679,
          }}
          pinColor={talent.isMoving ? "#FFA500" : "#166534"}
          title={talent.name}
          description={
            Array.isArray(talent.services)
              ? talent.services.join(", ")
              : talent.services
          }
        />
      ))}
      {/* === ADD CLIENT LOCATION MARKER === */}
      {userLocation && (
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          pinColor="#2D6CDF"
          title="You"
          description="Your current location"
        />
      )}
    </CustomMapView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* View Mode Toggle */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setViewMode((v) => (v === "list" ? "map" : "list"))}
          style={styles.viewToggle}
        >
          <MaterialIcons
            name={viewMode === "list" ? "map" : "list"}
            size={24}
            color="#166534"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowRatingFilter(true)}
          style={styles.ratingToggle}
        >
          <Ionicons name="star" size={24} color={selectedRating ? "#FFD700" : "#666"} />
        </TouchableOpacity>
      </View>

      {/* Services ScrollView */}
      <ScrollView
        horizontal
        style={styles.servicesScroll}
        showsHorizontalScrollIndicator={false}
      >
        {SERVICES_CATEGORIES.map((cat) =>
          cat.services.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setService((prev) => (prev === type ? null : type))}
              style={[
                styles.serviceChip,
                service === type && styles.activeServiceChip,
              ]}
            >
              <Text style={[
                styles.serviceChipText,
                service === type && styles.activeServiceChipText
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Rating Filter Modal */}
      <Modal
        visible={showRatingFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingFilter(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowRatingFilter(false)}
        >
          <View style={styles.modalContent}>
            <RatingFilter />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main Content */}
      <View style={styles.content}>
        {viewMode === "list" ? renderList() : renderMap()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
  },
  viewToggle: {
    padding: 8,
  },
  ratingToggle: {
    padding: 8,
  },
  servicesScroll: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  serviceChip: {
    backgroundColor: "#eee",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  activeServiceChip: {
    backgroundColor: "#166534",
  },
  serviceChipText: {
    color: "#333",
  },
  activeServiceChipText: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  ratingFilterContainer: {
    alignItems: "center",
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    padding: 12,
  },
  noResults: {
    color: "#888",
    textAlign: "center",
    marginTop: 30,
  },
  talentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  profileSection: {
    flexDirection: "row",
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  talentName: {
    fontWeight: "bold",
    fontSize: 18,
  },
  serviceText: {
    color: "#166534",
    marginTop: 4,
  },
  mobileBadge: {
    flexDirection: "row",
    backgroundColor: "#FFA500",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  mobileText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 12,
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  locationText: {
    color: "#666",
    marginLeft: 8,
  },
  availabilitySection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  availabilityText: {
    color: "#666",
    marginLeft: 8,
  },
  pricingSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  pricingText: {
    color: "#666",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  bookButton: {
    flex: 1,
    backgroundColor: "#166534",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  messageButton: {
    flex: 1,
    backgroundColor: "#666",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});