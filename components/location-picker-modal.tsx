 // components/location-picker-modal.tsx

import React, { useState } from "react";
import { View, Modal, Button } from "react-native";
import CustomMapView, { Marker } from "~/components/CustomMapView";

export default function LocationPicker({
  visible,
  onClose,
  onLocationSelected,
  initialLocation
}: {
  visible: boolean,
  onClose: () => void,
  onLocationSelected: (loc: { latitude: number, longitude: number }) => void,
  initialLocation?: { latitude: number, longitude: number }
}) {
  const [selected, setSelected] = useState<{ latitude: number, longitude: number }>(
    initialLocation || { latitude: 4.05, longitude: 9.7 }
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 }}>
        <CustomMapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: selected.latitude,
            longitude: selected.longitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.09,
          }}
          onPress={(e: any) => setSelected(e.nativeEvent.coordinate)}
        >
          <Marker
            coordinate={selected}
            draggable
            onDragEnd={(e: any) => setSelected(e.nativeEvent.coordinate)}
          />
        </CustomMapView>
        <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 16 }}>
          <Button title="Cancel" onPress={onClose} color="#aaa" />
          <Button title="Select" onPress={() => {
            onLocationSelected(selected);
            onClose();
          }} color="#17994B" />
        </View>
      </View>
    </Modal>
  );
}

  