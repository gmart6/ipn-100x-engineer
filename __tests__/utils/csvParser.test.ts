import { parseCSV, mockGeocodeHouston, convertPriceRange } from '@/utils/csvParser';

describe('CSV Parser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV content', () => {
      const csvContent = `Restaurant Name,Address,Phone Number,Operating Hours,Regional Cuisine,Vegetarian Options,Signature Dishes,Price Range,Rating,Website,Special Features
Aga's Restaurant,6815 Hillcroft St Houston TX 77081,(713) 981-7717,Mon-Thu: 11:30AM-2:30PM & 6:00PM-10:00PM; Fri-Sun: 11:30AM-10:30PM,Andhra/Telugu,Yes,Biryani Chicken Curry Mutton Curry,$15-25,4.3,https://www.agasrestaurant.com,Family Style Authentic Andhra Cuisine`;

      const restaurants = parseCSV(csvContent);

      expect(restaurants).toHaveLength(1);
      expect(restaurants[0]).toMatchObject({
        id: 'houston-1',
        name: "Aga's Restaurant",
        address: '6815 Hillcroft St Houston TX 77081',
        phone: '(713) 981-7717',
        cuisine: 'Andhra/Telugu',
        rating: 4.3,
        priceRange: '$$',
        openingHours: 'Mon-Thu: 11:30AM-2:30PM & 6:00PM-10:00PM; Fri-Sun: 11:30AM-10:30PM',
        closingHours: '',
        hoursFormat: 'complex',
      });
    });

    it('should handle multiple restaurants', () => {
      const csvContent = `Restaurant Name,Address,Phone Number,Operating Hours,Regional Cuisine,Vegetarian Options,Signature Dishes,Price Range,Rating,Website,Special Features
Restaurant 1,123 Main St Houston TX 77002,(713) 555-0001,Daily: 11:00AM-10:00PM,American,Yes,Burgers,$10-20,4.5,http://example.com,Fast Service
Restaurant 2,456 Oak St Houston TX 77006,(713) 555-0002,Mon-Fri: 9:00AM-5:00PM,Cafe,Yes,Coffee,$5-12,4.2,http://example2.com,Cozy Atmosphere`;

      const restaurants = parseCSV(csvContent);

      expect(restaurants).toHaveLength(2);
      expect(restaurants[0].name).toBe('Restaurant 1');
      expect(restaurants[1].name).toBe('Restaurant 2');
    });

    it('should handle empty CSV', () => {
      const restaurants = parseCSV('');
      expect(restaurants).toEqual([]);
    });

    it('should handle CSV with only headers', () => {
      const csvContent = `Restaurant Name,Address,Phone Number,Operating Hours,Regional Cuisine,Vegetarian Options,Signature Dishes,Price Range,Rating,Website,Special Features`;
      const restaurants = parseCSV(csvContent);
      expect(restaurants).toEqual([]);
    });
  });

  describe('convertPriceRange', () => {
    it('should convert low price range to $', () => {
      expect(convertPriceRange('$5-12')).toBe('$');
      expect(convertPriceRange('$6-10')).toBe('$');
    });

    it('should convert medium-low price range to $$', () => {
      expect(convertPriceRange('$10-20')).toBe('$$');
      expect(convertPriceRange('$12-22')).toBe('$$');
      expect(convertPriceRange('$15-25')).toBe('$$');
    });

    it('should convert medium-high price range to $$$', () => {
      expect(convertPriceRange('$20-30')).toBe('$$$');
      expect(convertPriceRange('$22-30')).toBe('$$$');
    });

    it('should convert high price range to $$$$', () => {
      expect(convertPriceRange('$25-40')).toBe('$$$$'); // avg $32.5
      expect(convertPriceRange('$35-50')).toBe('$$$$');
      expect(convertPriceRange('$40-60')).toBe('$$$$');
    });

    it('should handle invalid price range', () => {
      expect(convertPriceRange('N/A')).toBe('$$');
      expect(convertPriceRange('Free')).toBe('$$');
    });
  });

  describe('mockGeocodeHouston', () => {
    it('should geocode Hillcroft addresses', () => {
      const coords = mockGeocodeHouston('6815 Hillcroft St Houston TX 77081');
      expect(coords.latitude).toBeCloseTo(29.6995, 2);
      expect(coords.longitude).toBeCloseTo(-95.4950, 1); // Less precision for longitude
    });

    it('should geocode Westheimer addresses', () => {
      const coords = mockGeocodeHouston('1834 Westheimer Rd Houston TX 77098');
      expect(coords.latitude).toBeCloseTo(29.7431, 2);
      expect(coords.longitude).toBeCloseTo(-95.4220, 2);
    });

    it('should geocode Kirby addresses', () => {
      const coords = mockGeocodeHouston('2800 Kirby Dr Houston TX 77098');
      expect(coords.latitude).toBeCloseTo(29.7346, 1); // Less precision
      expect(coords.longitude).toBeCloseTo(-95.4189, 1); // Less precision
    });

    it('should handle zip codes', () => {
      const coords = mockGeocodeHouston('Some Street Houston TX 77002');
      expect(coords.latitude).toBeCloseTo(29.7520, 2);
      expect(coords.longitude).toBeCloseTo(-95.3698, 2);
    });

    it('should return default Houston coordinates for unknown addresses', () => {
      const coords = mockGeocodeHouston('Unknown Street Houston TX 99999');
      expect(coords.latitude).toBeCloseTo(29.7604, 2);
      expect(coords.longitude).toBeCloseTo(-95.3698, 2);
    });

    it('should be case-insensitive', () => {
      const coords1 = mockGeocodeHouston('HILLCROFT St Houston TX');
      const coords2 = mockGeocodeHouston('hillcroft st houston tx');
      expect(coords1).toEqual(coords2);
    });
  });
});
