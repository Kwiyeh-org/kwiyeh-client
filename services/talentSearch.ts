import { Platform } from 'react-native';

// Base URL for your Spring Boot backend
const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : 'http://10.218.6.33:8080';

export const searchTalentsByService = async (service: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/searchTalentsByService?service=${encodeURIComponent(service)}`
    );
    if (!response.ok) throw new Error('Failed to fetch talents');
    return await response.json();
  } catch (error) {
    console.error('[searchTalentsByService] Error:', error);
    return [];
  }
}; 