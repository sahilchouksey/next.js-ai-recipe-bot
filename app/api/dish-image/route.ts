import { NextResponse } from "next/server";
import { getRecipeImageFromSpoonacular } from "@/lib/spoonacular-api";

// Caching dish images to improve performance
const dishImageCache: Record<string, { url: string, timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Reliable fallback dish images by cuisine type (when Spoonacular fails)
const CUISINE_IMAGES: Record<string, string[]> = {
  "italian": [
    "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=450&fit=crop"
  ],
  "indian": [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&h=450&fit=crop"
  ],
  "mexican": [
    "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=800&h=450&fit=crop"
  ],
  "chinese": [
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=450&fit=crop"
  ],
  "american": [
    "https://images.unsplash.com/photo-1550317138-10000687a72b?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1608039858788-553a3f1e9be9?w=800&h=450&fit=crop"
  ],
  // Default images for any cuisine
  "default": [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=450&fit=crop"
  ]
};

/**
 * Get the best possible dish image using Spoonacular API with fallbacks
 */
async function getBestDishImage(dish: string, cuisine: string = ''): Promise<string> {
  try {
    // First try Spoonacular API
    const spoonacularImage = await getRecipeImageFromSpoonacular(dish);
    if (spoonacularImage) {
      return spoonacularImage;
    }
    
    // If Spoonacular fails, fall back to cuisine-specific images
    const detectedCuisine = cuisine || detectCuisineFromDish(dish);
    const fallbackImages = CUISINE_IMAGES[detectedCuisine] || CUISINE_IMAGES.default;
    
    // Return a random image from the fallbacks
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  } catch (error) {
    console.error("Error getting dish image:", error);
    return CUISINE_IMAGES.default[0];
  }
}

/**
 * Detect cuisine type from dish name
 */
function detectCuisineFromDish(dish: string): string {
  const dishLower = dish.toLowerCase();
  
  if (/(pasta|pizza|risotto|lasagna|spaghetti)/.test(dishLower)) {
    return "italian";
  } else if (/(curry|tikka|masala|paneer|biryani)/.test(dishLower)) {
    return "indian";
  } else if (/(taco|burrito|quesadilla|enchilada|mexican)/.test(dishLower)) {
    return "mexican";
  } else if (/(stir|fry|dumpling|chinese|wonton|noodle)/.test(dishLower)) {
    return "chinese";
  } else if (/(burger|steak|fries|bbq|grill)/.test(dishLower)) {
    return "american";
  }
  
  return "default";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dish = searchParams.get('dish');
    const cuisine = searchParams.get('cuisine')?.toLowerCase() || '';
    
    if (!dish) {
      return NextResponse.json({ 
        error: "Missing dish parameter",
        imageUrl: CUISINE_IMAGES.default[0]
      }, { status: 400 });
    }
    
    const normalizedDish = dish.toLowerCase().trim();
    
    // Check cache first
    if (dishImageCache[normalizedDish] && 
        (Date.now() - dishImageCache[normalizedDish].timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        dish,
        imageUrl: dishImageCache[normalizedDish].url
      });
    }
    
    // Get the best image using Spoonacular API with fallbacks
    const imageUrl = await getBestDishImage(dish, cuisine);
    
    // Cache the result
    dishImageCache[normalizedDish] = {
      url: imageUrl,
      timestamp: Date.now()
    };
    
    return NextResponse.json({ 
      dish,
      cuisine: cuisine || detectCuisineFromDish(dish),
      imageUrl
    });
  } catch (error) {
    console.error("Error in dish image API:", error);
    return NextResponse.json({ 
      error: "Failed to process request",
      imageUrl: CUISINE_IMAGES.default[0]
    }, { status: 500 });
  }
}
