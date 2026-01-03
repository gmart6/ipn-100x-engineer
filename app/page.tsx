'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant } from '@/types/restaurant';

// TODO: Workshop Exercise 5 - Improve UI with better styling
// Consider adding animations, better loading states, and responsive design improvements

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [dataSource, setDataSource] = useState<'json' | 'csv'>('json');

  const handleSearch = async (location: string) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/restaurants?address=${encodeURIComponent(location)}&dataSource=${dataSource}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch restaurants');
      }

      setRestaurants(data.restaurants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">🍽️ Restaurant Finder</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find the best restaurants near you
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Section */}
        <section className="mb-8">
          <SearchForm onSearch={handleSearch} isLoading={loading} />

          {/* Dataset Toggle */}
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Dataset:</label>
            <button
              onClick={() => setDataSource('json')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                dataSource === 'json'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              San Francisco (25)
            </button>
            <button
              onClick={() => setDataSource('csv')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                dataSource === 'csv'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Houston (20)
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section>
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600">Finding restaurants...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && hasSearched && restaurants.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">No restaurants found. Try a different location.</p>
            </div>
          )}

          {!loading && restaurants.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Found {restaurants.length} restaurants near you
              </h2>
              {/* TODO: Workshop Exercise 1 - Add opening hours display */}
              {/* Currently the opening hours are available in the data but not displayed */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">
                Enter your location to find nearby restaurants
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {dataSource === 'json'
                  ? 'Try searching for "San Francisco" or "94102"'
                  : 'Try searching for "Houston" or "Hillcroft"'}
              </p>
            </div>
          )}
        </section>

        {/* TODO: Workshop Exercise 3 - Integrate real maps API */}
        {/* Add a map view showing restaurant locations */}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Restaurant Finder - AI Workshop Demo Application
          </p>
        </div>
      </footer>
    </main>
  );
}
