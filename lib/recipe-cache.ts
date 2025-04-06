// Simple in-memory cache for recipes to reduce API calls
type RecipeCache = {
  [key: string]: {
    data: any;
    timestamp: number;
  };
};

// Cache expires after 1 hour
const CACHE_TTL = 60 * 60 * 1000;

// In-memory cache object
const recipeCache: RecipeCache = {};

export function getCachedRecipe(recipeId: string) {
  const cached = recipeCache[recipeId];
  
  if (!cached) {
    return null;
  }
  
  // Check if cache entry has expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    delete recipeCache[recipeId];
    return null;
  }
  
  return cached.data;
}

export function cacheRecipe(recipeId: string, data: any) {
  recipeCache[recipeId] = {
    data,
    timestamp: Date.now(),
  };
}
