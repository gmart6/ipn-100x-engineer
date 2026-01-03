import {
  convertTo12Hour,
  detectHoursFormat,
  formatSimpleHours,
  getRestaurantStatus,
  formatHoursDisplay,
} from '@/utils/hours';

describe('hours utility functions', () => {
  describe('convertTo12Hour', () => {
    it('should convert morning hours correctly', () => {
      expect(convertTo12Hour('09:00')).toBe('9:00 AM');
      expect(convertTo12Hour('11:30')).toBe('11:30 AM');
    });

    it('should convert afternoon/evening hours correctly', () => {
      expect(convertTo12Hour('13:00')).toBe('1:00 PM');
      expect(convertTo12Hour('18:30')).toBe('6:30 PM');
      expect(convertTo12Hour('22:00')).toBe('10:00 PM');
    });

    it('should handle midnight and noon correctly', () => {
      expect(convertTo12Hour('00:00')).toBe('12:00 AM');
      expect(convertTo12Hour('12:00')).toBe('12:00 PM');
    });
  });

  describe('detectHoursFormat', () => {
    it('should detect simple format', () => {
      expect(detectHoursFormat('11:00', '22:00')).toBe('simple');
      expect(detectHoursFormat('09:30', '21:30')).toBe('simple');
    });

    it('should detect complex format', () => {
      expect(
        detectHoursFormat('Mon-Thu: 11AM-9PM; Fri-Sat: 11AM-10PM', '')
      ).toBe('complex');
      expect(detectHoursFormat('Daily: 11:00AM-10:00PM', '')).toBe('complex');
    });
  });

  describe('formatSimpleHours', () => {
    it('should format simple hours correctly', () => {
      expect(formatSimpleHours('11:00', '22:00')).toBe('11:00 AM - 10:00 PM');
      expect(formatSimpleHours('09:30', '17:00')).toBe('9:30 AM - 5:00 PM');
    });
  });

  describe('getRestaurantStatus', () => {
    beforeEach(() => {
      // Mock the current time to 2PM (14:00) on a Tuesday
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-09 14:00:00')); // Tuesday
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('simple format', () => {
      it('should return open status when currently open', () => {
        const status = getRestaurantStatus('11:00', '22:00');
        expect(status.isOpen).toBe(true);
        expect(status.statusText).toBe('Open Now');
        expect(status.statusColor).toBe('text-green-600');
        expect(status.nextChange).toBe('Closes at 10:00 PM');
      });

      it('should return closed status when currently closed', () => {
        const status = getRestaurantStatus('18:00', '23:00');
        expect(status.isOpen).toBe(false);
        expect(status.statusText).toBe('Closed');
        expect(status.statusColor).toBe('text-red-600');
        expect(status.nextChange).toBe('Opens at 6:00 PM');
      });

      it('should return closed status when after closing time', () => {
        const status = getRestaurantStatus('09:00', '13:00');
        expect(status.isOpen).toBe(false);
        expect(status.statusText).toBe('Closed');
        expect(status.statusColor).toBe('text-red-600');
      });
    });

    describe('complex format - daily hours', () => {
      it('should handle "Daily" format when open', () => {
        const status = getRestaurantStatus('Daily: 11:00AM-10:00PM', '');
        expect(status.isOpen).toBe(true);
        expect(status.statusText).toBe('Open Now');
      });

      it('should handle "Daily" format when closed', () => {
        jest.setSystemTime(new Date('2024-01-09 22:00:00')); // 10 PM
        const status = getRestaurantStatus('Daily: 11:00AM-9:00PM', '');
        expect(status.isOpen).toBe(false);
        expect(status.statusText).toBe('Closed');
      });
    });

    describe('complex format - day-specific hours', () => {
      it('should handle weekday hours correctly', () => {
        // Tuesday 2PM, restaurant open Mon-Thu 11AM-9PM
        const status = getRestaurantStatus('Mon-Thu: 11:00AM-9:00PM', '');
        expect(status.isOpen).toBe(true);
        expect(status.statusText).toBe('Open Now');
      });

      it('should handle weekend hours correctly', () => {
        // Set to Saturday 2PM
        jest.setSystemTime(new Date('2024-01-13 14:00:00')); // Saturday
        const status = getRestaurantStatus(
          'Mon-Thu: 11AM-9PM; Fri-Sat: 11AM-10PM',
          ''
        );
        expect(status.isOpen).toBe(true);
        expect(status.statusText).toBe('Open Now');
      });

      it('should return closed when outside day range', () => {
        // Set to Sunday 2PM, but restaurant only open Mon-Sat
        jest.setSystemTime(new Date('2024-01-14 14:00:00')); // Sunday
        const status = getRestaurantStatus('Mon-Sat: 11AM-9PM', '');
        expect(status.isOpen).toBe(false);
        expect(status.statusText).toBe('Closed');
      });
    });

    describe('complex format - multiple time ranges', () => {
      it('should handle lunch and dinner hours', () => {
        // Tuesday 2PM (lunch period)
        const status = getRestaurantStatus(
          'Mon-Thu: 11:30AM-2:30PM & 6:00PM-10:00PM',
          ''
        );
        expect(status.isOpen).toBe(true);
        expect(status.statusText).toBe('Open Now');
      });

      it('should be closed between lunch and dinner', () => {
        // Tuesday 4PM (between lunch and dinner)
        jest.setSystemTime(new Date('2024-01-09 16:00:00'));
        const status = getRestaurantStatus(
          'Mon-Thu: 11:30AM-2:30PM & 6:00PM-10:00PM',
          ''
        );
        expect(status.isOpen).toBe(false);
        expect(status.statusText).toBe('Closed');
      });

      it('should be open during dinner hours', () => {
        // Tuesday 7PM (dinner period)
        jest.setSystemTime(new Date('2024-01-09 19:00:00'));
        const status = getRestaurantStatus(
          'Mon-Thu: 11:30AM-2:30PM & 6:00PM-10:00PM',
          ''
        );
        expect(status.isOpen).toBe(true);
        expect(status.statusText).toBe('Open Now');
      });
    });
  });

  describe('formatHoursDisplay', () => {
    it('should format simple hours correctly', () => {
      const display = formatHoursDisplay('11:00', '22:00');
      expect(display).toBe('11:00 AM - 10:00 PM');
    });

    it('should return complex hours as-is', () => {
      const complexHours = 'Mon-Thu: 11AM-9PM; Fri-Sat: 11AM-10PM';
      const display = formatHoursDisplay(complexHours, '');
      expect(display).toBe(complexHours);
    });

    it('should respect format override', () => {
      const display = formatHoursDisplay('11:00', '22:00', 'simple');
      expect(display).toBe('11:00 AM - 10:00 PM');
    });
  });
});
