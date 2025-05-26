// components/location-picker-modal.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Dimensions
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button } from '~/components/ui/button';
import { MaterialIcons } from '@expo/vector-icons';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
}

export default function LocationPickerModal({
  visible,
  onClose,
  onLocationSelect,
  initialLocation,
}: LocationPickerModalProps) {
  const [location, setLocation] = useState({
    latitude: initialLocation?.latitude || 4.0511,
    longitude: initialLocation?.longitude || 9.7679,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (!initialLocation) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(prev => ({
            ...prev,
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          }));
        }
      })();
    }
  }, [initialLocation]);

  const handleConfirm = async () => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      const addressObj = results[0];
      const address = [
        addressObj.street, addressObj.city, addressObj.region, addressObj.country
      ].filter(Boolean).join(', ') || 'Unknown';
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address,
      });
      onClose();
    } catch (e) {
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address: 'Unknown',
      });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Location</Text>
        </View>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={location}
          onRegionChangeComplete={setLocation}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            draggable
            onDragEnd={e => {
              setLocation(prev => ({
                ...prev,
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
              }));
            }}
          />
        </MapView>
        <View style={styles.footer}>
          <Button onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.buttonText}>Confirm Location</Text>
          </Button>
          <Button onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ... use your styles above ...
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  closeButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: '600', marginLeft: 16 },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Platform.OS === 'web' ? 400 : Dimensions.get('window').height - 200,
  },
  footer: { padding: 16, backgroundColor: '#fff' },
  confirmButton: { marginBottom: 8 },
  cancelButton: { backgroundColor: '#6B7280' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

 