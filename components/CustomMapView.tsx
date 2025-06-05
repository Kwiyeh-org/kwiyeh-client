//components/CustomMapView.tsx(web and mobile compatibility)

   import React from "react";
import { Platform } from "react-native";

// ------- WEB: react-leaflet setup -------
let LeafletMap: any = null,
  LeafletTileLayer: any = null,
  LeafletMarker: any = null;
if (Platform.OS === "web") {
  // @ts-ignore
  ({ MapContainer: LeafletMap, TileLayer: LeafletTileLayer, Marker: LeafletMarker } = require("react-leaflet"));
  // @ts-ignore
  require("leaflet/dist/leaflet.css");

  // ------- LEAFLET ICON FIX (IMPORTANT) -------
  // @ts-ignore
  const L = require("leaflet");
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  // @ts-ignore
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// ------- MOBILE: react-native-maps setup -------
let MapView: any, RNMarker: any;
if (Platform.OS !== "web") {
  MapView = require("react-native-maps").default;
  RNMarker = require("react-native-maps").Marker;
}

// ------- WEB MARKER WRAPPER -------
function WebMarker({ coordinate, title }: { coordinate: { latitude: number; longitude: number }, title?: string }) {
  if (!LeafletMarker) return null;
  return (
    <LeafletMarker
      position={[coordinate.latitude, coordinate.longitude]}
      title={title || ""}
    />
  );
}
WebMarker.displayName = "WebMarker";

// ------- CUSTOM MAP VIEW COMPONENT -------
type CustomMapViewProps = {
  style?: any;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  children?: React.ReactNode;
  [key: string]: any;
};

function CustomMapView(props: CustomMapViewProps) {
  // --- WEB (react-leaflet) ---
  if (Platform.OS === "web") {
    if (!LeafletMap || !LeafletTileLayer) return <div>Loading Map...</div>;
    // Convert react-native-maps Markers to WebMarker
    const mappedChildren = React.Children.map(props.children, child => {
      if (
        React.isValidElement(child) &&
        ((child.type as any).displayName === "Marker" || (child.type as any).displayName === "WebMarker")
      ) {
        return (
          <WebMarker
            coordinate={child.props.coordinate}
            title={child.props.title}
          />
        );
      }
      return child;
    });
    return (
      <div style={{
        width: props.style?.width || "100%",
        height: props.style?.height || 300,
        borderRadius: props.style?.borderRadius ?? 12,
        overflow: "hidden",
        ...props.style
      }}>
        <LeafletMap
          center={[props.initialRegion.latitude, props.initialRegion.longitude]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <LeafletTileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappedChildren}
        </LeafletMap>
      </div>
    );
  }

  // --- MOBILE (react-native-maps) ---
  if (!MapView) return null;
  return <MapView {...props}>{props.children}</MapView>;
}

// ------- MARKER EXPORT -------
const Marker = Platform.OS === "web" ? WebMarker : RNMarker;

export default CustomMapView;
export { Marker };
