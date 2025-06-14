 // services/talentTrackingService.ts

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from '~/services/firebaseConfig';
import { getDatabase, ref, set } from 'firebase/database';

const TASK_NAME = "background-talent-location-task";

// Define background task
TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) return;
  if (data) {
    const { locations } = data as any;
    const latest = locations[0];
    if (latest) {
      // Get talentId from AsyncStorage
      const talentId = await AsyncStorage.getItem("userId");
      if (!talentId) return;
      const db = getDatabase(app);
      await set(ref(db, `talentLocations/${talentId}`), {
        latitude: latest.coords.latitude,
        longitude: latest.coords.longitude,
        timestamp: Date.now()
      });
    }
  }
});

// Start tracking (call this when user toggles "Track Me" ON)
export async function startTalentTracking() {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status === 'granted') {
    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 10000, // every 10 seconds
      distanceInterval: 5, // meters
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
      foregroundService: {
        notificationTitle: "STEID Location Tracking",
        notificationBody: "Your live location is being shared with clients.",
      },
    });
  } else {
    throw new Error('Location permission not granted');
  }
}

// Stop tracking (call this when user toggles "Track Me" OFF)
export async function stopTalentTracking() {
  await Location.stopLocationUpdatesAsync(TASK_NAME);
}
