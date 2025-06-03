 //components/LocationField.tsx

  import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocationPickerModal from './location-picker-modal';
import { locationService } from '~/services/location';
import * as Location from "expo-location"; 

type LocationValue = {
  latitude: number;
  longitude: number;
  address: string;
} | string;

interface LocationFieldProps {
  value: LocationValue;
  onChange: (location: { latitude: number; longitude: number; address: string }) => void;
  isTalent?: boolean;
}

export default function LocationField({ value, onChange, isTalent = false }: LocationFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // UPDATED: Fetch address after picking location
  const handleLocationSelect = async (loc: { latitude: number; longitude: number }) => {
    let address = "";
    try {
      const [result] = await Location.reverseGeocodeAsync(loc);
      address = result
        ? `${result.name || ''} ${result.street || ''} ${result.city || ''} ${result.region || ''}`.trim()
        : "";
    } catch (e) {
      address = "";
    }
    const location = { ...loc, address };
    onChange(location);
    await locationService.saveUserLocation(
      { ...location, timestamp: Date.now() },
      isTalent
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setIsPickerVisible(true)}
      >
        <Ionicons name="location-sharp" size={20} color="#666666" style={styles.icon} />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {typeof value === 'string' ? value : value?.address || "Set your location"}
        </Text>
      </TouchableOpacity>
      <LocationPickerModal
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onLocationSelected={handleLocationSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  icon: { marginRight: 8 },
  text: { flex: 1, fontSize: 16, color: '#111' },
  placeholder: { color: '#9ca3af' },
});
