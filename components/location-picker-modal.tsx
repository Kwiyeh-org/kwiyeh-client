 // components/location-picker-modal.tsx

import React, { useState ,useRef} from "react";
import { View, Modal, Button } from "react-native";
import MapView, { Marker } from "./CustomMapView";

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
  // const [region, setRegion] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);
  return (
    <Modal visible={visible} animationType="slide">
      <View className="border-2 h-full">
        <MapView
        provider="google"
        className="flex-1"
        style={{ flex: 1,borderWidth:1 }}
        googleMapId="AIzaSyDeZNZtuUNXvfa99LAKVlyn08QpJpa3Nbc"
        />

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

  