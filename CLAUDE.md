# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Restaurant Finder is a Next.js 14 application built for an AI-assisted coding workshop. It demonstrates finding restaurants near a user's location using mock data and mock geocoding. The project **intentionally contains dead code and incomplete features** as workshop exercises.

## Commands

### Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Testing
```bash
npm test             # Run all tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm test -- __tests__/utils/distance.test.ts  # Run single test file
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without modifying
```

## Architecture

### Data Flow
1. User enters location in `SearchForm` component
2. `app/page.tsx` calls `/api/restaurants?address={location}`
3. API route (`app/api/restaurants/route.ts`) uses `mockGeocode()` to convert address to coordinates
4. Distance calculated using Haversine formula in `utils/distance.ts`
5. Returns 5 closest restaurants sorted by distance
6. Results rendered as `RestaurantCard` components in grid layout

### Key Implementation Details

**Mock Geocoding**: `utils/distance.ts` contains `mockGeocode()` which maps common SF addresses/zip codes to coordinates. Falls back to default SF coordinates (37.7749, -122.4194) if no match.

**Distance Calculation**: Uses Haversine formula to calculate great-circle distance between two lat/lng points. Returns distance in kilometers.

**API Endpoints**:
- `GET /api/restaurants` - Main endpoint, accepts `address`, `lat`, or `lng` query params
- `POST /api/restaurants` - Supports filtering by cuisine, minRating, and priceRange (currently unused in UI)

**Type System**: All restaurant data typed via `types/restaurant.ts`. The `Restaurant` interface includes `openingHours` and `closingHours` fields that are **not currently displayed in the UI** (workshop exercise).

### Testing Setup

Uses Jest + React Testing Library with Next.js integration. Tests located in `__tests__/` directory mirroring source structure. Path alias `@/` configured in both `tsconfig.json` and `jest.config.js`.

## Known Dead Code (Intentional)

The following code is **intentionally left as workshop exercises**:

### Completely Unused Files (Workshop Exercise 2)
- `components/RestaurantMap.tsx` - Legacy map component, never used
- `app/api/restaurants/favorites/route.ts` - Favorites endpoint, never implemented in UI
- Most of `utils/helpers.ts` - Only `formatRating()` is actually used; rest are unused helpers

### Unused Features
- Opening hours stored in data but not displayed in UI (Workshop Exercise 1)
- POST `/api/restaurants` filtering by cuisine/rating/price (implemented but no UI)
- Console.log statements throughout codebase (debugging leftovers)

## Environment Variables

Copy `.env.example` to `.env.local`:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - For future maps integration
- `NEXT_PUBLIC_APP_ENV` - Environment identifier
