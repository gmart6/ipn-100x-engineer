/**
 * Legacy component - no longer used
 * This component was originally used to display restaurants on a map
 * It has been replaced by a simpler list view
 *
 * TODO: Workshop Exercise 2 - Find and remove dead code
 * This entire file is unused and should be removed
 */

'use client';

import { useEffect, useRef } from 'react';
import { Restaurant } from '@/types/restaurant';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center: { lat: number; lng: number };
  zoom?: number;
}

// This component is no longer used in the application
export default function RestaurantMap({ restaurants, center, zoom = 13 }: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // This code never runs because the component is not used
    // Placeholder for map initialization
    // In a real implementation, this would use Google Maps or Mapbox
    if (mapRef.current && !mapInstanceRef.current) {
      // Map initialization code would go here
    }
  }, [center, zoom]);

  useEffect(() => {
    // Add markers for restaurants
    if (mapInstanceRef.current && restaurants.length > 0) {
      restaurants.forEach(() => {
        // Marker creation code would go here
      });
    }
  }, [restaurants]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center"
      >
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Map View</p>
          <p className="text-sm">Map integration not configured</p>
          <p className="text-xs mt-2">
            Add your Google Maps or Mapbox API key to enable this feature
          </p>
        </div>
      </div>

      {/* Floating controls - also unused */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="bg-white p-2 rounded shadow hover:bg-gray-50">
          +
        </button>
        <button className="bg-white p-2 rounded shadow hover:bg-gray-50">
          -
        </button>
      </div>
    </div>
  );
}
