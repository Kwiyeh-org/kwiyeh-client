//services/location.ts
 import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: number;
}

class LocationService {
  // Default to Douala, Cameroon (fallback)
  private defaultLocation: LocationData = {
    latitude: 4.0511,
    longitude: 9.7679,
    address: 'Douala, Cameroon',
    timestamp: Date.now()
  };

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentLocation(): Promise<LocationData> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) throw new Error('Location permission not granted');

      // Works on web and mobile (browser will prompt user)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const address = await this.getAddressFromCoords(
        location.coords.latitude,
        location.coords.longitude
      );

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
        timestamp: Date.now()
      };
    } catch (error) {
      // Only fallback to Douala if not allowed or failed
      return this.defaultLocation;
    }
  }

  async getAddressFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results[0]) {
        const { street, city, region, country } = results[0];
        return [street, city, region, country].filter(Boolean).join(', ');
      }
      return 'Unknown location';
    } catch (error) {
      return 'Unknown location';
    }
  }

  async saveUserLocation(location: LocationData, isTalent = false): Promise<void> {
    const key = isTalent ? 'talentLocation' : 'userLocation';
    await AsyncStorage.setItem(key, JSON.stringify(location));
  }

  async getUserLocation(isTalent = false): Promise<LocationData | null> {
    try {
      const key = isTalent ? 'talentLocation' : 'userLocation';
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }
}

export const locationService = new LocationService();
