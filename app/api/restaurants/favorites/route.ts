/**
 * UNUSED API ROUTE - Favorites Endpoint
 *
 * TODO: Workshop Exercise 2 - Find and remove dead code
 * This entire file is unused and should be removed or implemented properly
 *
 * This was intended to allow users to save favorite restaurants,
 * but the feature was never completed.
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for favorites (would use a database in production)
const favorites: Map<string, string[]> = new Map();

// GET - Retrieve user's favorite restaurants
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  const userFavorites = favorites.get(userId) || [];

  return NextResponse.json({
    favorites: userFavorites,
    count: userFavorites.length,
  });
}

// POST - Add a restaurant to favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, restaurantId } = body;

    if (!userId || !restaurantId) {
      return NextResponse.json(
        { error: 'userId and restaurantId are required' },
        { status: 400 }
      );
    }

    const userFavorites = favorites.get(userId) || [];

    if (!userFavorites.includes(restaurantId)) {
      userFavorites.push(restaurantId);
      favorites.set(userId, userFavorites);
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant added to favorites',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a restaurant from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const restaurantId = searchParams.get('restaurantId');

    if (!userId || !restaurantId) {
      return NextResponse.json(
        { error: 'userId and restaurantId are required' },
        { status: 400 }
      );
    }

    const userFavorites = favorites.get(userId) || [];
    const index = userFavorites.indexOf(restaurantId);

    if (index > -1) {
      userFavorites.splice(index, 1);
      favorites.set(userId, userFavorites);
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant removed from favorites',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
