/**
 * Utility functions for working with the Spoonacular API
 */

// API keys for the Spoonacular service
// Note: In production, store these in environment variables
const SPOONACULAR_INGREDIENT_KEY = 'b220d87811774786bfcf056df3765d7c';
const SPOONACULAR_RECIPE_KEY = 'b8bbd948c30a47aa9d6e8ae16a63c655';

// Cache for ingredient image results to reduce API calls
const ingredientImageCache: Record<string, string> = {};
// Cache for recipe image results to reduce API calls
const recipeImageCache: Record<string, string> = {};

/**
 * Get an ingredient image URL from Spoonacular API
 */
export async function getIngredientImageFromSpoonacular(ingredient: string): Promise<string | null> {
  try {
    // Check cache first
    if (ingredientImageCache[ingredient.toLowerCase()]) {
      return ingredientImageCache[ingredient.toLowerCase()];
    }
    
    // Use AbortController to set a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Create fully-formed URL to avoid parsing issues
      const apiUrl = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(ingredient)}&number=5&apiKey=${SPOONACULAR_INGREDIENT_KEY}`;
      
      // Call Spoonacular API with proper error handling
      const response = await fetch(apiUrl, { 
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        // Adding cache policy to avoid stale responses
        cache: 'no-store' 
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Get image from first result
        const imageUrl = `https://spoonacular.com/cdn/ingredients_100x100/${data.results[0].image}`;
        
        // Cache the result
        ingredientImageCache[ingredient.toLowerCase()] = imageUrl;
        
        return imageUrl;
      }
    } catch (fetchError) {
      // Specific handling for fetch errors
      console.error(`Fetch error for Spoonacular ingredient (${ingredient}):`, fetchError);
      clearTimeout(timeoutId);
      return null;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching Spoonacular ingredient image for ${ingredient}:`, error);
    return null;
  }
}

/**
 * Get a recipe image URL from Spoonacular API
 */
export async function getRecipeImageFromSpoonacular(dish: string): Promise<string | null> {
  try {
    // Check cache first
    if (recipeImageCache[dish.toLowerCase()]) {
      return recipeImageCache[dish.toLowerCase()];
    }
    
    // Use AbortController to set a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Create fully-formed URL
      const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(dish)}&apiKey=${SPOONACULAR_RECIPE_KEY}&number=10`;
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Get the first result with an image
        const recipe = data.results.find((r: any) => r.image) || data.results[0];
        
        if (recipe && recipe.image) {
          // Cache the result
          recipeImageCache[dish.toLowerCase()] = recipe.image;
          return recipe.image;
        }
      }
    } catch (fetchError) {
      // Handle fetch-specific errors
      console.error(`Fetch error for Spoonacular recipe (${dish}):`, fetchError);
      clearTimeout(timeoutId);
      return null;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching Spoonacular recipe image for ${dish}:`, error);
    return null;
  }
}
