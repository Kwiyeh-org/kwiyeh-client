//app/client/search-talent.tsx
  
 import React, { useState, useEffect } from "react";
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, Platform, StyleSheet, Dimensions, Image
} from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Button } from "~/components/ui/button";
import { SERVICES_CATEGORIES } from "~/constants/skill-list";
import { locationService, type LocationData } from '~/services/location';
import CustomMapView, { Marker } from "~/components/CustomMapView";


export default function SearchTalent() {
  const [talents, setTalents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [service, setService] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);


  useEffect(() => {
    (async () => {
      const tStr = await AsyncStorage.getItem("talents");
      if (tStr) setTalents(JSON.parse(tStr));
      // Load client location for map pin
      const userLoc = await locationService.getUserLocation(false); // <-- ADDED
      setUserLocation(userLoc); // <-- ADDED
    })();
  }, []);

  // Filter talents for selected service, rating, etc.
  const filteredTalents = talents.filter(t =>
    (!service || (Array.isArray(t.services) && t.services.includes(service))) &&
    (typeof t.rating === "number" ? t.rating >= minRating : true)
  );

  // List View for Talents
  const renderList = () => (
    <ScrollView style={{ flex: 1, padding: 12 }}>
      {filteredTalents.length === 0 && (
        <Text style={{ color: "#888", textAlign: "center", marginTop: 30 }}>No talents found.</Text>
      )}
      {filteredTalents.map(talent => (
        <View key={talent.id} style={styles.talentCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.profileImage}>
              {talent.profileImage ? (
                <Image
                  source={{ uri: talent.profileImage }}
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                  resizeMode="cover"
                />
              ) : (
                <FontAwesome name="user" size={30} color="#666" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>{talent.name}</Text>
              <Text style={{ color: "#166534" }}>
                {(Array.isArray(talent.services) ? talent.services.join(", ") : talent.services) || "N/A"}
              </Text>
              <Text style={{ color: "#666" }}>{talent.location?.address}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FontAwesome name="star" size={16} color="#FFD700" />
                <Text style={{ marginLeft: 3 }}>{talent.rating || "No ratings yet"}</Text>
              </View>
            </View>
          </View>
          {/* Action Buttons */}
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <Button style={{ flex: 1, marginRight: 6, backgroundColor: "#166534" }}>
              <Text style={{ color: "#fff" }}>Book</Text>
            </Button>
            <Button style={{ flex: 1, marginLeft: 6, backgroundColor: "#666" }}>
              <Text style={{ color: "#fff" }}>Message</Text>
            </Button>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // Map View
  const renderMap = () => (
    <CustomMapView
      style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height - 120 }}
      initialRegion={{
        latitude: 4.0511,
        longitude: 9.7679,
        latitudeDelta: 0.3,
        longitudeDelta: 0.3,
      }}
    >
      {filteredTalents.map(talent => (
        <Marker
          key={talent.id}
          coordinate={{
            latitude: talent.location?.latitude ?? 4.0511,
            longitude: talent.location?.longitude ?? 9.7679,
          }}
          pinColor={talent.isMoving ? "#FFA500" : "#166534"}
          title={talent.name}
          description={Array.isArray(talent.services) ? talent.services.join(", ") : talent.services}
        />
      ))}
      {/* === ADD CLIENT LOCATION MARKER === */}
      {userLocation && (
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }}
          pinColor="#2D6CDF"
          title="You"
          description="Your current location"
        />
      )}
    </CustomMapView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Toggle between list and map */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
        <TouchableOpacity onPress={() => setViewMode(v => v === "list" ? "map" : "list")}>
          <MaterialIcons name={viewMode === "list" ? "map" : "list"} size={24} color="#166534" style={{ marginRight: 8 }} />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", color: "#166534", fontSize: 16 }}>
          {viewMode === "list" ? "List View" : "Map View"}
        </Text>
      </View>
      {/* Service Picker: All categories, chips, NO typing */}
      <ScrollView horizontal style={{ paddingVertical: 6, paddingHorizontal: 8 }}>
        {SERVICES_CATEGORIES.map(cat =>
          cat.services.map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setService(prev => prev === type ? null : type)}
              style={{
                backgroundColor: service === type ? "#166534" : "#eee",
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 7,
                marginRight: 8,
              }}
            >
              <Text style={{ color: service === type ? "#fff" : "#333" }}>{type}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <View style={{ flex: 1 }}>
        {viewMode === "list" ? renderList() : renderMap()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  talentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
});
