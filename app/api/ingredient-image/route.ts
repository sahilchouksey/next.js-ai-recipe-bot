import { NextResponse } from "next/server";
import { getIngredientImageFromSpoonacular } from "@/lib/spoonacular-api";
import { INGREDIENT_IMAGES, CATEGORY_FALLBACKS, GENERIC_FOOD_FALLBACK } from "@/lib/ingredient-database";

// Caching ingredient image responses to improve performance
const imageCache: Record<string, { url: string, timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Normalize an ingredient name for better matching
 */
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .replace(/\d+\/\d+|\d+\.\d+|\d+/g, '')
    .replace(/(cup|tablespoon|tbsp|teaspoon|tsp|ounce|oz|pound|lb|gram|g|ml|l|pinch|dash|to taste)/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * API endpoint for ingredient image retrieval that uses Spoonacular API
 */
export async function GET(request: Request) {
  try {
    // Get ingredient parameter
    const { searchParams } = new URL(request.url);
    const ingredient = searchParams.get('ingredient');
    
    if (!ingredient) {
      return NextResponse.json({ 
        error: "Missing ingredient parameter",
        imageUrl: GENERIC_FOOD_FALLBACK
      }, { status: 400 });
    }
    
    const normalizedIngredient = normalizeIngredient(ingredient);
    
    // Check cache first
    if (imageCache[normalizedIngredient] && 
        (Date.now() - imageCache[normalizedIngredient].timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        ingredient,
        imageUrl: imageCache[normalizedIngredient].url
      });
    }
    
    // Try Spoonacular API first
    try {
      const spoonacularImageUrl = await getIngredientImageFromSpoonacular(ingredient);
      
      if (spoonacularImageUrl) {
        // Cache the result
        imageCache[normalizedIngredient] = {
          url: spoonacularImageUrl,
          timestamp: Date.now()
        };

        // Return JSON response with URL instead of trying to fetch the image directly
        // This avoids potential fetch failures in Node.js environment
        return NextResponse.json({
          ingredient,
          source: "spoonacular",
          imageUrl: spoonacularImageUrl
        });
      }
    } catch (spoonacularError) {
      console.error("Spoonacular API error:", spoonacularError);
      // Continue to fallbacks
    }
    
    // If Spoonacular fails, try our local database
    // First try direct match in our database
    for (const [key, data] of Object.entries(INGREDIENT_IMAGES)) {
      if (normalizedIngredient === key || data.aliases.includes(normalizedIngredient)) {
        const imageUrl = data.imageUrl;
        
        // Cache the result
        imageCache[normalizedIngredient] = {
          url: imageUrl,
          timestamp: Date.now()
        };
        
        return NextResponse.json({
          ingredient,
          source: "database",
          imageUrl
        });
      }
    }
    
    // Try partial matches
    for (const [key, data] of Object.entries(INGREDIENT_IMAGES)) {
      if (normalizedIngredient.includes(key) || key.includes(normalizedIngredient)) {
        const imageUrl = data.imageUrl;
        
        // Cache the result
        imageCache[normalizedIngredient] = {
          url: imageUrl,
          timestamp: Date.now()
        };
        
        return NextResponse.json({
          ingredient,
          source: "partial_match",
          imageUrl
        });
      }
      
      // Check aliases
      for (const alias of data.aliases) {
        if (normalizedIngredient.includes(alias) || alias.includes(normalizedIngredient)) {
          const imageUrl = data.imageUrl;
          
          // Cache the result
          imageCache[normalizedIngredient] = {
            url: imageUrl,
            timestamp: Date.now()
          };
          
          return NextResponse.json({
            ingredient,
            source: "alias_match",
            imageUrl
          });
        }
      }
    }
    
    // If no direct or partial match, detect category
    const category = detectIngredientCategory(normalizedIngredient);
    const categoryImage = CATEGORY_FALLBACKS[category] || GENERIC_FOOD_FALLBACK;
    
    // Cache the result
    imageCache[normalizedIngredient] = {
      url: categoryImage,
      timestamp: Date.now()
    };
    
    return NextResponse.json({
      ingredient,
      source: "category_fallback",
      category,
      imageUrl: categoryImage
    });
    
  } catch (error) {
    console.error("Error processing ingredient image request:", error);
    return NextResponse.json({ 
      error: "Failed to process request",
      imageUrl: GENERIC_FOOD_FALLBACK
    }, { status: 500 });
  }
}

/**
 * Detect ingredient category based on keywords
 */
function detectIngredientCategory(ingredient: string): string {
  const keywords: Record<string, string[]> = {
    'vegetable': ['vegetable', 'onion', 'garlic', 'carrot', 'potato', 'tomato', 'pepper', 'lettuce', 'cucumber'],
    'fruit': ['fruit', 'apple', 'banana', 'orange', 'berry', 'lemon', 'lime', 'citrus'],
    'protein': ['meat', 'chicken', 'beef', 'fish', 'pork', 'lamb', 'turkey', 'tofu', 'egg'],
    'dairy': ['milk', 'cheese', 'cream', 'yogurt', 'butter'],
    'grain': ['flour', 'rice', 'pasta', 'bread', 'noodle', 'wheat', 'oat'],
    'herb': ['herb', 'basil', 'mint', 'parsley', 'cilantro', 'thyme'],
    'spice': ['spice', 'salt', 'pepper', 'cinnamon', 'paprika', 'oregano']
  };
  
  for (const [category, terms] of Object.entries(keywords)) {
    if (terms.some(term => ingredient.includes(term))) {
      return category;
    }
  }
  
  return 'other';
}
