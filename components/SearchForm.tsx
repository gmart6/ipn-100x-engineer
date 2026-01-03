'use client';

import { useState, FormEvent } from 'react';

interface SearchFormProps {
  // eslint-disable-next-line no-unused-vars
  onSearch: (location: string) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  // TODO: Workshop Exercise 3 - Add geolocation support
  // Add a "Use my location" button that gets the user's current coordinates

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your location
          </label>
          <input
            type="text"
            id="location"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter address, city, or zip code..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            disabled={isLoading}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Searching...' : 'Find Restaurants'}
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500">
        💡 Tip: Try searching for &quot;San Francisco&quot;, &quot;Downtown&quot;, or a zip code like &quot;94102&quot;
      </p>
    </form>
  );
}
