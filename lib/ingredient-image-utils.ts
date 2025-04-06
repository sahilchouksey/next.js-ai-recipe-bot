import { INGREDIENT_IMAGES, CATEGORY_FALLBACKS, GENERIC_FOOD_FALLBACK } from './ingredient-database';
import { getIngredientImageFromSpoonacular } from './spoonacular-api';

/**
 * Clean and normalize ingredient text for better matching
 */
export function normalizeIngredient(ingredientText: string): string {
  return ingredientText
    .toLowerCase()
    // Remove quantities (numbers and fractions)
    .replace(/\d+\/\d+|\d+\.\d+|\d+/g, '')
    // Remove common units
    .replace(/(cup|tablespoon|tbsp|teaspoon|tsp|ounce|oz|pound|lb|gram|g|ml|l|pinch|dash|to taste)/g, '')
    // Remove special characters
    .replace(/[^\w\s]/g, '')
    // Trim and remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find best matching ingredient using semantic similarity
 * This approach mimics some aspects of CLIP's text-image matching capabilities
 */
export function findBestMatchingIngredient(ingredientText: string): string {
  const normalized = normalizeIngredient(ingredientText);
  
  // Quick check for direct matches
  if (INGREDIENT_IMAGES[normalized]) {
    return INGREDIENT_IMAGES[normalized].imageUrl;
  }
  
  // Check against all ingredient names and their aliases
  let bestMatch: {key: string, score: number} = {key: '', score: 0};
  
  for (const [key, data] of Object.entries(INGREDIENT_IMAGES)) {
    // Check exact match with main name
    if (normalized === key) {
      return data.imageUrl;
    }
    
    // Check all aliases
    for (const alias of data.aliases) {
      if (normalized === alias) {
        return data.imageUrl;
      }
    }
    
    // Calculate score based on partial matches
    let score = 0;
    
    // Main ingredient name match (substring)
    if (normalized.includes(key) || key.includes(normalized)) {
      score += 10;
    }
    
    // Check if any alias matches (substring)
    for (const alias of data.aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) {
        score += 8;
        break;
      }
    }
    
    // Check individual words in the normalized ingredient
    const words = normalized.split(' ').filter(word => word.length > 2);
    for (const word of words) {
      if (key.includes(word)) {
        score += 5;
      }
      
      for (const alias of data.aliases) {
        if (alias.includes(word)) {
          score += 3;
          break;
        }
      }
    }
    
    // Update best match if better score
    if (score > bestMatch.score) {
      bestMatch = { key, score };
    }
  }
  
  // If we found a good match (score > threshold)
  if (bestMatch.score > 5 && INGREDIENT_IMAGES[bestMatch.key]) {
    return INGREDIENT_IMAGES[bestMatch.key].imageUrl;
  }
  
  // Fall back to category-based matching
  const category = categorizeIngredient(normalized);
  if (CATEGORY_FALLBACKS[category]) {
    return CATEGORY_FALLBACKS[category];
  }
  
  // Last resort - generic food image
  return GENERIC_FOOD_FALLBACK;
}

/**
 * Categorize ingredients into broad categories for better image matches
 */
export function categorizeIngredient(ingredient: string): string {
  const normalized = ingredient.toLowerCase();
  
  // Map of categories and their keywords
  const categoryKeywords: Record<string, string[]> = {
    'vegetable': ['onion', 'garlic', 'carrot', 'broccoli', 'spinach', 'lettuce', 'potato', 'tomato', 'cucumber', 'zucchini', 'eggplant', 'bell pepper', 'cabbage', 'celery', 'kale', 'asparagus', 'cauliflower'],
    'fruit': ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'lemon', 'lime', 'kiwi', 'mango', 'pineapple', 'avocado', 'berry', 'citrus', 'melon', 'watermelon'],
    'protein': ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'bacon', 'sausage', 'steak', 'ground', 'fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'squid', 'tofu', 'egg', 'tempeh', 'seitan'],
    'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'ice cream', 'mozzarella', 'cheddar', 'brie', 'parmesan', 'feta', 'ricotta'],
    'grain': ['rice', 'pasta', 'bread', 'flour', 'oats', 'cereal', 'wheat', 'corn', 'quinoa', 'barley', 'couscous', 'tortilla', 'noodle', 'macaroni', 'spaghetti', 'baguette'],
    'herb': ['basil', 'parsley', 'cilantro', 'mint', 'oregano', 'thyme', 'rosemary', 'dill', 'chives', 'sage', 'bay leaf'],
    'spice': ['salt', 'pepper', 'cumin', 'coriander', 'cinnamon', 'nutmeg', 'paprika', 'chili', 'garlic powder', 'onion powder', 'turmeric', 'ginger', 'curry', 'cardamom', 'cloves'],
    'condiment': ['oil', 'vinegar', 'sauce', 'ketchup', 'mustard', 'mayonnaise', 'dressing', 'syrup', 'honey', 'jam', 'jelly', 'soy sauce', 'hot sauce', 'salsa', 'pickle']
  };
  
  // Check each category's keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Default to vegetable as fallback
  return 'vegetable';
}

/**
 * Get an image for an ingredient with progressive fallback strategy
 */
export async function getIngredientImage(ingredientName: string): Promise<string> {
  if (!ingredientName) {
    return GENERIC_FOOD_FALLBACK;
  }
  
  try {
    // First try Spoonacular API
    const spoonacularImage = await getIngredientImageFromSpoonacular(ingredientName);
    if (spoonacularImage) {
      return spoonacularImage;
    }
    
    // If Spoonacular fails, use our local database and categorization methods
    return findBestMatchingIngredient(ingredientName);
  } catch (error) {
    console.error(`Error getting image for ingredient ${ingredientName}:`, error);
    return GENERIC_FOOD_FALLBACK;
  }
}
