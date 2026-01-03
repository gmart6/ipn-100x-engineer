/**
 * Hours parsing and formatting utilities
 * Supports both simple (24-hour) and complex (day-specific) hour formats
 */

export type HoursFormat = 'simple' | 'complex';

export interface OpenStatus {
  isOpen: boolean;
  statusText: string;
  statusColor: string;
  nextChange?: string;
}

/**
 * Convert 24-hour time to 12-hour format
 * @param time Time in HH:MM format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function convertTo12Hour(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Detect the format of hours data
 * @param openingHours Opening hours string
 * @param closingHours Closing hours string
 * @returns 'simple' for HH:MM format, 'complex' for day-specific schedules
 */
export function detectHoursFormat(
  openingHours: string,
  closingHours: string
): HoursFormat {
  // Simple format: both are in HH:MM format (e.g., "11:00", "22:00")
  const simpleTimePattern = /^\d{1,2}:\d{2}$/;

  if (
    simpleTimePattern.test(openingHours) &&
    simpleTimePattern.test(closingHours)
  ) {
    return 'simple';
  }

  // Complex format: contains day names, time ranges, or is a longer descriptive string
  return 'complex';
}

/**
 * Format simple hours for display
 * @param opening Opening time in HH:MM format
 * @param closing Closing time in HH:MM format
 * @returns Formatted hours string (e.g., "11:00 AM - 10:00 PM")
 */
export function formatSimpleHours(opening: string, closing: string): string {
  return `${convertTo12Hour(opening)} - ${convertTo12Hour(closing)}`;
}

/**
 * Parse simple hours and determine open/closed status
 * @param opening Opening time in HH:MM format
 * @param closing Closing time in HH:MM format
 * @returns OpenStatus object
 */
function parseSimpleHours(opening: string, closing: string): OpenStatus {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const isOpen = currentTime >= opening && currentTime <= closing;

  let nextChange: string | undefined;
  if (isOpen) {
    nextChange = `Closes at ${convertTo12Hour(closing)}`;
  } else if (currentTime < opening) {
    nextChange = `Opens at ${convertTo12Hour(opening)}`;
  }

  return {
    isOpen,
    statusText: isOpen ? 'Open Now' : 'Closed',
    statusColor: isOpen ? 'text-green-600' : 'text-red-600',
    nextChange,
  };
}

/**
 * Parse complex hours format (day-specific schedules)
 * @param hoursString Complex hours string (e.g., "Mon-Thu: 11AM-9PM; Fri-Sat: 11AM-10PM")
 * @returns OpenStatus object
 */
function parseComplexHours(hoursString: string): OpenStatus {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  // Map day names to numbers
  const dayMap: Record<string, number> = {
    sun: 0,
    sunday: 0,
    mon: 1,
    monday: 1,
    tue: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
  };

  // Check if "Daily" schedule
  if (hoursString.toLowerCase().includes('daily:')) {
    const timeMatch = hoursString.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/gi);
    if (timeMatch && timeMatch.length >= 2) {
      const [openStr, closeStr] = timeMatch;
      const openTime = parseTimeToMinutes(openStr);
      const closeTime = parseTimeToMinutes(closeStr);

      const isOpen = currentTime >= openTime && currentTime <= closeTime;

      return {
        isOpen,
        statusText: isOpen ? 'Open Now' : 'Closed',
        statusColor: isOpen ? 'text-green-600' : 'text-red-600',
        nextChange: isOpen
          ? `Closes at ${closeStr}`
          : `Opens at ${openStr}`,
      };
    }
  }

  // Parse day-specific schedules
  const schedules = hoursString.split(';').map((s) => s.trim());

  for (const schedule of schedules) {
    // Extract day range and time range
    const parts = schedule.split(':');
    if (parts.length < 2) continue;

    const dayPart = parts[0].trim().toLowerCase();
    const timePart = parts.slice(1).join(':').trim();

    // Parse day range (e.g., "Mon-Thu" or "Fri")
    let startDay: number | null = null;
    let endDay: number | null = null;

    if (dayPart.includes('-')) {
      const [start, end] = dayPart.split('-').map((d) => d.trim());
      startDay = dayMap[start];
      endDay = dayMap[end];
    } else {
      startDay = endDay = dayMap[dayPart];
    }

    // Check if current day falls in range
    if (
      startDay !== null &&
      endDay !== null &&
      isDayInRange(currentDay, startDay, endDay)
    ) {
      // Parse time ranges (could have multiple ranges separated by &)
      const timeRanges = timePart.split('&').map((t) => t.trim());

      for (const timeRange of timeRanges) {
        const timeMatch = timeRange.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/gi);
        if (timeMatch && timeMatch.length >= 2) {
          const [openStr, closeStr] = timeMatch;
          const openTime = parseTimeToMinutes(openStr);
          const closeTime = parseTimeToMinutes(closeStr);

          if (currentTime >= openTime && currentTime <= closeTime) {
            return {
              isOpen: true,
              statusText: 'Open Now',
              statusColor: 'text-green-600',
              nextChange: `Closes at ${closeStr}`,
            };
          }
        }
      }
    }
  }

  // If we get here, restaurant is closed
  return {
    isOpen: false,
    statusText: 'Closed',
    statusColor: 'text-red-600',
  };
}

/**
 * Check if a day falls within a day range (handles week wrap-around)
 * @param day Current day (0-6)
 * @param start Range start day (0-6)
 * @param end Range end day (0-6)
 * @returns True if day is in range
 */
function isDayInRange(day: number, start: number, end: number): boolean {
  if (start <= end) {
    return day >= start && day <= end;
  } else {
    // Wraps around (e.g., Fri-Sun: 5-0)
    return day >= start || day <= end;
  }
}

/**
 * Parse time string to minutes since midnight
 * @param timeStr Time string (e.g., "11:30AM", "2PM", "10:00 PM")
 * @returns Minutes since midnight
 */
function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Get restaurant open/closed status
 * Automatically detects format and routes to appropriate parser
 * @param openingHours Opening hours (simple or complex format)
 * @param closingHours Closing hours (simple format) or empty string
 * @returns OpenStatus object
 */
export function getRestaurantStatus(
  openingHours: string,
  closingHours: string
): OpenStatus {
  const format = detectHoursFormat(openingHours, closingHours);

  if (format === 'simple') {
    return parseSimpleHours(openingHours, closingHours);
  } else {
    return parseComplexHours(openingHours);
  }
}

/**
 * Format hours for display based on detected format
 * @param openingHours Opening hours string
 * @param closingHours Closing hours string
 * @param format Optional format override
 * @returns Formatted display string
 */
export function formatHoursDisplay(
  openingHours: string,
  closingHours: string,
  format?: HoursFormat
): string {
  const detectedFormat = format || detectHoursFormat(openingHours, closingHours);

  if (detectedFormat === 'simple') {
    return formatSimpleHours(openingHours, closingHours);
  } else {
    // For complex format, return as-is or clean it up slightly
    return openingHours;
  }
}
