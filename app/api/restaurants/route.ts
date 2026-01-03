import { NextRequest, NextResponse } from 'next/server';
import restaurantData from '@/data/restaurants.json';
import { calculateDistance, mockGeocode, DEFAULT_COORDINATES } from '@/utils/distance';
import { Restaurant } from '@/types/restaurant';
import { parseCSV } from '@/utils/csvParser';
import { readFileSync } from 'fs';
import path from 'path';

// Number of restaurants to return
const RESULTS_LIMIT = 5;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const dataSource = searchParams.get('dataSource') || 'json';

    // Load appropriate dataset
    let restaurants: Restaurant[];
    if (dataSource === 'csv') {
      const csvPath = path.join(process.cwd(), 'data', 'restaurants.csv');
      const csvContent = readFileSync(csvPath, 'utf-8');
      restaurants = parseCSV(csvContent);
    } else {
      restaurants = restaurantData.restaurants;
    }

    let userLat: number;
    let userLng: number;

    // Determine user coordinates
    if (lat && lng) {
      userLat = parseFloat(lat);
      userLng = parseFloat(lng);

      // Validate coordinates
      if (isNaN(userLat) || isNaN(userLng)) {
        return NextResponse.json(
          { error: 'Invalid coordinates provided' },
          { status: 400 }
        );
      }
    } else if (address) {
      // Use mock geocoding for the address
      const coords = mockGeocode(address);
      if (coords) {
        userLat = coords.latitude;
        userLng = coords.longitude;
      } else {
        // Fall back to default coordinates
        userLat = DEFAULT_COORDINATES.latitude;
        userLng = DEFAULT_COORDINATES.longitude;
      }
    } else {
      // No location provided, use default
      userLat = DEFAULT_COORDINATES.latitude;
      userLng = DEFAULT_COORDINATES.longitude;
    }

    // Calculate distance for each restaurant and sort by distance
    const restaurantsWithDistance = restaurants.map((restaurant: Restaurant) => ({
      ...restaurant,
      distance: calculateDistance(
        userLat,
        userLng,
        restaurant.latitude,
        restaurant.longitude
      ),
    }));

    // Sort by distance and take the closest ones
    const sortedRestaurants = restaurantsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, RESULTS_LIMIT);

    return NextResponse.json({
      restaurants: sortedRestaurants,
      searchLocation: {
        latitude: userLat,
        longitude: userLng,
        address: address || 'Default location (San Francisco)',
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in restaurants API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST method - currently not used but kept for future expansion
export async function POST(request: NextRequest) {
  // TODO: Workshop Exercise 4 - Add unit tests for this endpoint
  try {
    const body = await request.json();
    const { latitude, longitude, filters } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    let restaurants = restaurantData.restaurants;

    // Apply filters if provided
    if (filters) {
      if (filters.cuisine) {
        restaurants = restaurants.filter(
          (r: Restaurant) => r.cuisine.toLowerCase() === filters.cuisine.toLowerCase()
        );
      }
      if (filters.minRating) {
        restaurants = restaurants.filter((r: Restaurant) => r.rating >= filters.minRating);
      }
      if (filters.priceRange) {
        restaurants = restaurants.filter((r: Restaurant) => r.priceRange === filters.priceRange);
      }
    }

    // Calculate distances and sort
    const restaurantsWithDistance = restaurants.map((restaurant: Restaurant) => ({
      ...restaurant,
      distance: calculateDistance(
        latitude,
        longitude,
        restaurant.latitude,
        restaurant.longitude
      ),
    }));

    const sortedRestaurants = restaurantsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, RESULTS_LIMIT);

    return NextResponse.json({
      restaurants: sortedRestaurants,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in POST /api/restaurants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
