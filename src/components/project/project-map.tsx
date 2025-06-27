'use client';

import { GoogleMap, useJsApiLoader, Polyline } from '@react-google-maps/api';
import { useMemo } from 'react';
import { roadData } from '@/lib/road-data';
import { Loader2 } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

export function ProjectMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const center = useMemo(() => {
    // A default center for the map of Chennai area
    return { lat: 13.0, lng: 79.9 };
  }, []);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-destructive/10 text-destructive p-4 rounded-md">
        <p className="font-semibold">Map Error</p>
        <p className="text-sm text-center">Could not load Google Maps. Please ensure your API key is correctly configured in the .env file and the Maps JavaScript API is enabled in your Google Cloud console.</p>
      </div>
    );
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
      zoom={9}
    >
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
    </GoogleMap>
  );
}
