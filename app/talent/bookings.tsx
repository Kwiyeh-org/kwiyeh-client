// //app/talent/bookings.tsx

  import React, { useState } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  StyleSheet 
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Button } from "~/components/ui/button";

export default function TalentBookings() {
  const [bookings] = useState([
    { 
      id: 1, 
      client: "Sarah Johnson", 
      service: "Hair Styling", 
      date: "2025-05-24", 
      time: "10:00 AM", 
      status: "pending" 
    },
    { 
      id: 2, 
      client: "Mike Smith", 
      service: "Photography", 
      date: "2025-05-24", 
      time: "2:00 PM", 
      status: "confirmed" 
    },
  ]);

  const handleBookingAction = (id: number, action: string) => {
    // Handle booking actions here
    console.log(`Booking ${id} ${action}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Your Bookings</Text>
        
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.clientInfo}>
                <FontAwesome name="user-circle" size={20} color="#166534" />
                <Text style={styles.clientName}>{booking.client}</Text>
              </View>
              <Text style={[
                styles.status,
                booking.status === "confirmed" && styles.statusConfirmed,
                booking.status === "pending" && styles.statusPending
              ]}>
                {booking.status}
              </Text>
            </View>

            <View style={styles.bookingDetails}>
              <Text style={styles.serviceText}>{booking.service}</Text>
              <Text style={styles.dateText}>{booking.date} at {booking.time}</Text>
            </View>

            {booking.status === "pending" && (
              <View style={styles.actionButtons}>
                <Button
                  className="bg-green-800 py-2 px-4 rounded-full mr-4"
                  onPress={() => handleBookingAction(booking.id, "accept")}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </Button>
                <Button
                  className="bg-red-500 py-2 px-4 rounded-full"
                  onPress={() => handleBookingAction(booking.id, "decline")}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </Button>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111",
  },
  bookingCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: {
        maxWidth: 600,
        marginHorizontal: 'auto',
        width: '100%',
      },
    }),
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusConfirmed: {
    color: '#059669',
  },
  statusPending: {
    color: '#d97706',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 15,
    color: '#166534',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#4b5563',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});