'use client';

import { GoogleMap, useJsApiLoader, Polyline, Polygon, MarkerF } from '@react-google-maps/api';
import { useMemo } from 'react';
import { roadData } from '@/lib/road-data';
import { Loader2 } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// New data for the site layout
const siteLayoutPath = [
    { lat: 12.91738, lng: 79.9066 },
    { lat: 12.91887, lng: 79.9072 },
    { lat: 12.91863, lng: 79.90786 },
    { lat: 12.91866, lng: 79.90964 },
    { lat: 12.91805, lng: 79.90956 },
    { lat: 12.91775, lng: 79.91052 },
    { lat: 12.91592, lng: 79.90958 },
];

// New data for the dry port marker
const dryPortPosition = { lat: 13.02614, lng: 79.86819 };

// Polygon options for the site layout
const polygonOptions = {
    fillColor: "#3b82f6",
    fillOpacity: 0.3,
    strokeColor: "#2563eb",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1
};

function MapErrorDisplay() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-destructive/10 text-destructive p-4 rounded-md">
      <p className="font-semibold">Map Error</p>
      <p className="text-sm text-center">Could not load Google Maps. Please add your API key to the `.env` file as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."` and ensure the Maps JavaScript API is enabled in your Google Cloud console.</p>
    </div>
  );
}

export function ProjectMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey || '',
  });

  // Updated center and zoom to focus on the new layout and marker
  const center = useMemo(() => ({ lat: 12.97, lng: 79.95 }), []);

  if (!mapsApiKey || loadError) {
    return <MapErrorDisplay />;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading Map...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
    >
      {/* Existing roads */}
      {roadData.map(road => (
        <Polyline
          key={road.name}
          path={road.path}
          options={{
            strokeColor: road.color,
            strokeOpacity: 1.0,
            strokeWeight: 4,
            geodesic: true,
          }}
        />
      ))}

      {/* New Site Layout Polygon */}
      <Polygon
        paths={siteLayoutPath}
        options={polygonOptions}
      />

      {/* New Dry Port Marker */}
      <MarkerF
        position={dryPortPosition}
        label={{ text: "Dry Port", fontWeight: 'bold', color: '#000000' }}
      />
    </GoogleMap>
  );
}
