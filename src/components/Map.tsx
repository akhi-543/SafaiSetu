import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: { lat: number; lng: number };
}

interface NominatimResponse {
  display_name: string;
}

const fetchAddress = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'SafaiSetu Waste Management Application',
        },
      }
    );
    const data: NominatimResponse = await response.json();
    return data.display_name;
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Address not found';
  }
};

const MapEvents = ({ onLocationSelect }: { 
  onLocationSelect: (lat: number, lng: number, address: string) => void 
}) => {
  const map = useMapEvents({
    async click(e) {
      const address = await fetchAddress(e.latlng.lat, e.latlng.lng);
      onLocationSelect(e.latlng.lat, e.latlng.lng, address);
    },
  });
  return null;
};

const DraggableMarker = ({ position, onLocationSelect }: { 
  position: L.LatLng;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.on('dragend', async () => {
        const marker = markerRef.current;
        if (marker) {
          const position = marker.getLatLng();
          const address = await fetchAddress(position.lat, position.lng);
          onLocationSelect(position.lat, position.lng, address);
        }
      });
    }
  }, [onLocationSelect]);

  return (
    <Marker
      draggable={true}
      position={position}
      ref={markerRef}
    />
  );
};

export const Map = ({ onLocationSelect, initialLocation }: MapProps) => {
  const defaultLocation = initialLocation || { lat: 20.5937, lng: 78.9629 }; // Default to India's center

  return (
    <MapContainer
      center={[defaultLocation.lat, defaultLocation.lng]}
      zoom={5}
      className="w-full h-[300px] rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker
        position={new L.LatLng(defaultLocation.lat, defaultLocation.lng)}
        onLocationSelect={onLocationSelect}
      />
      <MapEvents onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
};