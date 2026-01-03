import { Restaurant } from '@/types/restaurant';
import {
  getRestaurantStatus,
  formatHoursDisplay,
  detectHoursFormat,
} from '@/utils/hours';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  // console.log('Rendering restaurant:', restaurant.name); // Dead code - should be removed

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <span className="text-yellow-400">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(emptyStars)}
      </span>
    );
  };

  const getPriceColor = (priceRange: string) => {
    switch (priceRange) {
      case '$':
        return 'text-green-600';
      case '$$':
        return 'text-yellow-600';
      case '$$$':
        return 'text-orange-600';
      case '$$$$':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Placeholder image area */}
      <div className="h-40 bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center">
        <span className="text-6xl">{getCuisineEmoji(restaurant.cuisine)}</span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {restaurant.name}
          </h3>
          <span className={`font-medium ml-2 ${getPriceColor(restaurant.priceRange)}`}>
            {restaurant.priceRange}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-2">{restaurant.cuisine}</p>

        <div className="flex items-center mb-2">
          {renderStars(restaurant.rating)}
          <span className="ml-2 text-sm text-gray-600">{restaurant.rating.toFixed(1)}</span>
        </div>

        <p className="text-sm text-gray-600 mb-2 truncate" title={restaurant.address}>
          📍 {restaurant.address}
        </p>

        {/* Operating Hours Display */}
        <div className="mb-2">
          <OperatingHours restaurant={restaurant} />
        </div>

        <p className="text-sm text-gray-500 line-clamp-2">{restaurant.description}</p>

        <div className="mt-4 flex gap-2">
          <button className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            View Details
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            📞
          </button>
        </div>
      </div>
    </div>
  );
}

// Operating Hours Component
function OperatingHours({ restaurant }: { restaurant: Restaurant }) {
  const format = detectHoursFormat(
    restaurant.openingHours,
    restaurant.closingHours
  );
  const status = getRestaurantStatus(
    restaurant.openingHours,
    restaurant.closingHours
  );
  const displayHours = formatHoursDisplay(
    restaurant.openingHours,
    restaurant.closingHours,
    format
  );

  return (
    <div className="space-y-1">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            status.isOpen
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {status.isOpen ? '● Open Now' : '● Closed'}
        </span>
        {status.nextChange && (
          <span className="text-xs text-gray-500">{status.nextChange}</span>
        )}
      </div>

      {/* Hours Display */}
      <div className="text-sm text-gray-600">
        {format === 'simple' ? (
          <div className="flex items-center">
            <span className="mr-1">🕒</span>
            <span>{displayHours}</span>
          </div>
        ) : (
          <details className="cursor-pointer">
            <summary className="flex items-center hover:text-gray-900">
              <span className="mr-1">🕒</span>
              <span className="truncate">Hours (click to expand)</span>
            </summary>
            <div className="mt-1 pl-5 text-xs whitespace-pre-wrap">
              {displayHours}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

// Helper function to get cuisine emoji
function getCuisineEmoji(cuisine: string): string {
  const cuisineEmojis: Record<string, string> = {
    Chinese: '🥡',
    Italian: '🍝',
    Mexican: '🌮',
    Japanese: '🍣',
    American: '🍔',
    Indian: '🍛',
    Vietnamese: '🍜',
    Mediterranean: '🥙',
    Korean: '🍲',
    French: '🥐',
    Thai: '🍜',
    Vegan: '🥗',
    Seafood: '🦐',
    Greek: '🥙',
    Ethiopian: '🍲',
    Brazilian: '🥩',
    Peruvian: '🐟',
    Spanish: '🥘',
    // Regional Indian cuisines
    'Andhra/Telugu': '🍛',
    'Tamil/South Indian': '🍛',
    'Modern South Indian': '🍛',
    'Pakistani/South Indian': '🍛',
    'Pakistani/Punjabi': '🍛',
    'Karnataka/Udupi': '🍛',
    'Indo-Pakistani': '🍛',
    'South Indian': '🍛',
    'Gujarati/South Indian': '🍛',
    'North/South Indian': '🍛',
    'Gujarati/Rajasthani': '🍛',
    'Pakistani/Indian': '🍛',
  };

  return cuisineEmojis[cuisine] || '🍽️';
}
