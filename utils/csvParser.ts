/**
 * CSV Parser for restaurant data
 * Converts CSV format to Restaurant objects
 */

import { Restaurant } from '@/types/restaurant';

interface CSVRow {
  'Restaurant Name': string;
  Address: string;
  'Phone Number': string;
  'Operating Hours': string;
  'Regional Cuisine': string;
  'Vegetarian Options': string;
  'Signature Dishes': string;
  'Price Range': string;
  Rating: string;
  Website: string;
  'Special Features': string;
}

/**
 * Parse CSV content into Restaurant array
 * @param csvContent Raw CSV file content
 * @returns Array of Restaurant objects
 */
export function parseCSV(csvContent: string): Restaurant[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse rows
  const restaurants: Restaurant[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      restaurants.push(convertCSVRow(row as unknown as CSVRow, i));
    }
  }

  return restaurants;
}

/**
 * Parse a single CSV line, handling quoted values
 * @param line CSV line string
 * @returns Array of cell values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Convert a CSV row to a Restaurant object
 * @param row CSV row data
 * @param index Row index for generating ID
 * @returns Restaurant object
 */
function convertCSVRow(row: CSVRow, index: number): Restaurant {
  const coords = mockGeocodeHouston(row.Address);

  return {
    id: `houston-${index}`,
    name: row['Restaurant Name'],
    address: row.Address,
    cuisine: row['Regional Cuisine'],
    rating: parseFloat(row.Rating) || 0,
    priceRange: convertPriceRange(row['Price Range']),
    openingHours: row['Operating Hours'],
    closingHours: '', // Complex format stores everything in openingHours
    latitude: coords.latitude,
    longitude: coords.longitude,
    phone: row['Phone Number'],
    description: `${row['Special Features']} - Signature dishes: ${row['Signature Dishes']}`,
    hoursFormat: 'complex',
  };
}

/**
 * Convert price range string to symbol format
 * @param priceRange Price range string (e.g., "$15-25")
 * @returns Price symbol (e.g., "$$")
 */
function convertPriceRange(priceRange: string): string {
  // Extract numeric values
  const match = priceRange.match(/\$(\d+)-(\d+)/);
  if (!match) return '$$';

  const minPrice = parseInt(match[1], 10);
  const maxPrice = parseInt(match[2], 10);
  const avgPrice = (minPrice + maxPrice) / 2;

  if (avgPrice < 10) return '$';
  if (avgPrice <= 20) return '$$';
  if (avgPrice <= 30) return '$$$';
  return '$$$$';
}

/**
 * Mock geocoding for Houston addresses
 * Returns approximate coordinates for Houston locations
 * @param address Full address string
 * @returns Latitude and longitude coordinates
 */
function mockGeocodeHouston(
  address: string
): { latitude: number; longitude: number } {
  const addressLower = address.toLowerCase();

  // Houston area location mapping (similar to SF mock geocoder)
  const locationMap: Record<string, { latitude: number; longitude: number }> =
    {
      // Street-based locations - specific addresses first
      '6815 hillcroft': { latitude: 29.6995, longitude: -95.4950 },
      '7300 hillcroft': { latitude: 29.6860, longitude: -95.4948 },
      '5827 hillcroft': { latitude: 29.7095, longitude: -95.4952 },
      '3601 hillcroft': { latitude: 29.7350, longitude: -95.4951 },
      hillcroft: { latitude: 29.7223, longitude: -95.4954 },

      '12427 bissonnet': { latitude: 29.7019, longitude: -95.5683 },
      bissonnet: { latitude: 29.7019, longitude: -95.5683 },

      '2800 kirby': { latitude: 29.7346, longitude: -95.4189 },
      '3910 kirby': { latitude: 29.7300, longitude: -95.4185 },
      kirby: { latitude: 29.7346, longitude: -95.4189 },

      westheimer: { latitude: 29.7390, longitude: -95.4563 },
      '516 westheimer': { latitude: 29.7485, longitude: -95.3950 },
      '1834 westheimer': { latitude: 29.7431, longitude: -95.4220 },
      '3334 westheimer': { latitude: 29.7402, longitude: -95.4350 },
      '8888 westheimer': { latitude: 29.7380, longitude: -95.5600 },

      richmond: { latitude: 29.7355, longitude: -95.5021 },
      '4410 richmond': { latitude: 29.7355, longitude: -95.4621 },

      fannin: { latitude: 29.7520, longitude: -95.3698 },
      '1201 fannin': { latitude: 29.7520, longitude: -95.3698 },

      bellaire: { latitude: 29.7058, longitude: -95.4774 },
      '9889 bellaire': { latitude: 29.7058, longitude: -95.4774 },

      // Zip code areas
      '77081': { latitude: 29.7010, longitude: -95.5200 },
      '77099': { latitude: 29.7019, longitude: -95.5683 },
      '77098': { latitude: 29.7431, longitude: -95.4220 },
      '77057': { latitude: 29.7350, longitude: -95.4951 },
      '77006': { latitude: 29.7485, longitude: -95.3950 },
      '77027': { latitude: 29.7402, longitude: -95.4350 },
      '77002': { latitude: 29.7520, longitude: -95.3698 },
      '77036': { latitude: 29.7058, longitude: -95.4774 },
      '77063': { latitude: 29.7380, longitude: -95.5600 },
      '77074': { latitude: 29.6850, longitude: -95.5300 },
    };

  // Check for matches in the address
  for (const [key, coords] of Object.entries(locationMap)) {
    if (addressLower.includes(key)) {
      return coords;
    }
  }

  // Default to Houston city center
  return { latitude: 29.7604, longitude: -95.3698 };
}

export { mockGeocodeHouston, convertPriceRange };
