 // app/services/firebase.ts
import axios from 'axios';
import { Platform } from 'react-native';

// Base URL for your Spring Boot backend
// Use your computer's IP address instead of localhost for mobile devices
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8080' 
  : ' http://192.168.101.33:8080'; // Replace with your actual IP address

// Register user with email and password
export const registerUser = async (userData: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) => {
  try {
    console.log("Attempting to register with:", {
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber
    });
    
    // Register user directly in backend
    const response = await axios.post(`${API_BASE_URL}/signup`, {
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      password: userData.password
    });
    
    return {
      backendResponse: response.data
    };
  } catch (error: any) {
    console.error("Registration error details:", JSON.stringify(error, null, 2));
    
    if (error.response?.status === 409) {
      throw new Error('Email already in use');
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      throw { 
        ...error, 
        code: 'NETWORK_ERROR',
        message: 'Network Error - Unable to connect to the server' 
      };
    }
    throw error;
  }
};

// Login user with email and password
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    return {
      backendResponse: response.data
    };
  } catch (error) {
    throw error;
  }
};

// Add default export
export default {
  registerUser,
  loginUser
};