import { generateObject } from "ai";
import { string, z } from "zod";

import { gemini20FlashThinkingModel, geminiFlashModel, geminiProModel } from ".";
import { createApiUrl } from "@/lib/api-utils";


// Valid YouTube video IDs for cooking content as backup
const VALID_YOUTUBE_IDS = [
  "JsimwZYPmTw", // Cooking basics
  "VVnZd8A84z4", // Recipe tutorial
  "OCunSb81vUA", // Simple recipes
  "ZJy1ajvMU1k"  // Cooking tips
];

export async function searchRecipes({
  query,
  cuisine,
  dietary,
}: {
  query: string;
  cuisine?: string;
  dietary?: string;
}) {
  try {
    const { object: recipeResults } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate search results for recipes matching: ${query}${cuisine ? ', cuisine: ' + cuisine : ''}${dietary ? ', dietary restriction: ' + dietary : ''}. Limit to 4 results.`,
      output: "array",
      schema: z.object({
        id: z.string().describe("Unique identifier for the recipe"),
        name: z.string().describe("Name of the recipe"),
        cuisine: z.string().describe("Cuisine type (Italian, Mexican, Chinese, etc.)"),
        prepTimeMinutes: z.number().describe("Preparation time in minutes"),
        cookTimeMinutes: z.number().describe("Cooking time in minutes"),
        servings: z.number().describe("Number of servings"),
        difficulty: z.string().describe("Difficulty level (Easy, Medium, Hard)"),
        shortDescription: z.string().describe("Brief description of the dish"),
      }),
    });

    return { recipes: recipeResults };
  } catch (error) {
    console.error("Error searching recipes:", error);
    // Return fallback results to prevent UI from hanging
    return {
      recipes: [
        {
          id: "recipe_default_1",
          name: "Quick Pasta Dish",
          cuisine: "Italian",
          prepTimeMinutes: 15,
          cookTimeMinutes: 20,
          servings: 4,
          difficulty: "Easy",
          shortDescription: "A simple pasta dish you can make quickly."
        },
        {
          id: "recipe_default_2",
          name: "Simple Salad",
          cuisine: "American",
          prepTimeMinutes: 10,
          cookTimeMinutes: 0,
          servings: 2,
          difficulty: "Easy",
          shortDescription: "Fresh and healthy salad with seasonal ingredients."
        }
      ]
    };
  }
}

// Simplify the getIngredientImageUrl function to just return the API endpoint URL
async function getIngredientImageUrl(ingredientName: string): Promise<string> {
  return `/api/ingredient-image?ingredient=${encodeURIComponent(ingredientName)}`;
}

/**
 * Batch retrieval function for missing ingredient images
 * Uses the ingredient-image API endpoint instead of direct calls
 */
async function getMissingIngredientImages(ingredientsWithMissingImages: Array<{ name: string, index: number }>): Promise<Array<{ ingredient: string, imageUrl: string }>> {
  return ingredientsWithMissingImages.map(item => ({
    ingredient: item.name,
    imageUrl: `/api/ingredient-image?ingredient=${encodeURIComponent(item.name)}`
  }));
}

// Function to find a recipe video using our API
export async function findRecipeVideo(recipeName: string): Promise<{
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string;
  views?: number;
}> {
  try {
    // Use absolute URL to prevent parsing errors
    const apiUrl = createApiUrl(`api/search-youtube?q=${encodeURIComponent(recipeName)}`);

    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.video) {
        return {
          videoId: data.video.id,
          title: data.video.title,
          channelName: data.video.channelName,
          thumbnailUrl: data.video.thumbnailUrl,
          duration: data.video.duration,
          views: data.video.views
        };
      }
    }
  } catch (error) {
    console.error(`Failed to find video for recipe ${recipeName}:`, error);
  }

  // Fallback to a reliable video
  const fallbackIndex = Math.floor(Math.random() * VALID_YOUTUBE_IDS.length);
  return {
    videoId: VALID_YOUTUBE_IDS[fallbackIndex],
    title: `How to Cook ${recipeName}`,
    channelName: "Cooking Tutorials",
    thumbnailUrl: `https://i.ytimg.com/vi/${VALID_YOUTUBE_IDS[fallbackIndex]}/hqdefault.jpg`,
    duration: "10:00"
  };
}

export async function generateRecipeDetails({
  recipeId,
  recipeName
}: {
  recipeId: string;
  recipeName?: string;
}) {
  // Use provided recipeName or extract it from the ID
  const nameToUse = recipeName || recipeId.replace(/^recipe_/, '').replace(/-/g, ' ');

  try {
    // Set up a promise with a more generous timeout
    const recipePromise = new Promise(async (resolve, reject) => {
      try {
        // First, get recipe details from the AI model without images
        // Images will be added separately
        const { object: basicRecipeDetails } = await generateObject({
          model: geminiFlashModel,
          prompt: `You are an Expert Recipe Developer creating a detailed recipe page for: "${nameToUse}". I need COMPLETE and DETAILED information:

        1. INGREDIENTS:
        - Be VERY SPECIFIC with ingredient names (use clear, identifiable terms like "chicken breast" instead of just "chicken")
        - Include EXACT quantities and measurements
        - Break down complex ingredients (like sauces or marinades) into their components
        - Make sure each ingredient is DISTINCT so it can be properly visualized
        
        2. INSTRUCTIONS:
        - Write detailed, step-by-step instructions 
        - Be precise about cooking techniques and times
        - Include temperatures, consistencies, and visual cues
        
        3. PRESENTATION:
        - Create a vivid description of what the final dish looks like
        - Mention colors, textures, and garnishes
        - Think about how to present this visually attractive dish
        
        4. MAIN IMAGE:
        - Provide a RELIABLE and WORKING image URL for the main dish
        - ONLY use image URLs from reliable sources that allow hotlinking like Unsplash, Pexels, Pixabay
        - Example reliable URLs: 
          * https://images.unsplash.com/photo-[ID]
          * https://images.pexels.com/photos/[ID]
          * https://cdn.pixabay.com/photo/[path]
        - DO NOT use URLs from recipe websites or food blogs (like themediterraneandish.com, allrecipes.com, etc) as they block hotlinking
        - Test that your URL actually works and shows a relevant image of the dish
        
        IMPORTANT: This is for a recipe app with VISUAL ELEMENTS - your recipe will be displayed with images for EACH ingredient and a MAIN DISH image. Every ingredient you list will need a clear, specific name for proper image matching.`,
          schema: z.object({
            id: z.string().describe("Unique identifier for the recipe"),
            name: z.string().describe("Name of the recipe"),
            cuisine: z.string().describe("Cuisine type"),
            prepTimeMinutes: z.number().describe("Preparation time in minutes"),
            cookTimeMinutes: z.number().describe("Cooking time in minutes"),
            servings: z.number().describe("Number of servings"),
            difficulty: z.string().describe("Difficulty level (Easy, Medium, Hard)"),
            description: z.string().describe("Brief description of the dish"),
            mainImageUrl: z.string().describe("A reliable, working image URL from Unsplash, Pexels, Pixabay or similar sources that allow hotlinking"),
            ingredients: z.array(
              z.object({
                name: z.string().describe("Ingredient name - be VERY SPECIFIC for proper image matching"),
                quantity: z.string().describe("Quantity needed"),
                unit: z.string().optional().describe("Unit of measurement"),
                imageUrl: z.string().optional().describe("Image URL for the ingredient"),
              })
            ).describe("List of ingredients needed - each will be displayed with an image"),
            instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
            nutritionFacts: z.object({
              calories: z.number().describe("Calories per serving"),
              protein: z.string().describe("Protein amount per serving"),
              carbs: z.string().describe("Carbohydrates per serving"),
              fat: z.string().describe("Fat per serving"),
            }).optional().describe("Nutritional information"),
            tags: z.array(z.string()).describe("Recipe tags"),
          }),
          temperature: 0.2, // Lower temperature for more predictable output
          maxTokens: 800, // Further reduced token count for faster response
        });
        // Generate a main dish image if not provided
        // Use our dedicated dish-image API for better reliability
        const dishName = basicRecipeDetails.name;
        const cuisine = basicRecipeDetails.cuisine;
        const mainImageUrl = createApiUrl(`api/dish-image?dish=${dishName}&cuisine=${cuisine}`);
        basicRecipeDetails.mainImageUrl = mainImageUrl

        // Fetch video and ingredient images in parallel
        const videoPromise = findRecipeVideo(basicRecipeDetails.name);

        // Process ingredients in batches to avoid too many simultaneous requests
        const batchSize = 2; // Reduced batch size
        const ingredientsWithImages = basicRecipeDetails.ingredients as Array<{
          name: string;
          quantity: string;
          unit?: string;
          imageUrl?: string;
        }>;

        // NEW CODE: Identify ingredients with missing/placeholder images after initial processing
        const ingredientsWithMissingImages = ingredientsWithImages
          .map((ingredient, index) => ({
            name: ingredient.name,
            index
          }))
          .filter(item => {
            const imgUrl = ingredientsWithImages[item.index].imageUrl || '';
            // Check if image is missing, a placeholder, or invalid URL
            return !imgUrl ||
              imgUrl.includes('placeholder') ||
              !imgUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)/i);
          });

        // If we have missing images, get initial fallbacks synchronously
        if (ingredientsWithMissingImages.length > 0) {
          console.info(`Attempting batch recovery for ${ingredientsWithMissingImages.length} ingredient images`);

          // Simply assign API URLs directly without waiting or fetching
          ingredientsWithMissingImages.forEach(item => {
            ingredientsWithImages[item.index].imageUrl = `/api/ingredient-image?ingredient=${encodeURIComponent(item.name)}`;
          });
       }


        // Wait for video info
        const video = await videoPromise;

        // Combine everything into the final recipe
        const enhancedRecipe = {
          ...basicRecipeDetails,
          ingredients: ingredientsWithImages,
          video
        };

        resolve(enhancedRecipe);
      } catch (error) {
        reject(error);
      }
    });

    // Set a timeout (15 seconds - increased from previous 6.5s)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Recipe details generation timed out")),60000);
    });

    // Race between the recipe generation and timeout
    const recipeDetails = await Promise.race([recipePromise, timeoutPromise]);
    return recipeDetails;

  } catch (error) {
    console.error("Error generating recipe details:", error);

    // Use a random valid YouTube ID for the fallback
    const fallbackVideoId = VALID_YOUTUBE_IDS[Math.floor(Math.random() * VALID_YOUTUBE_IDS.length)];

    // Return a fallback recipe with reliable images and video
    return {
      id: recipeId,
      name: nameToUse.charAt(0).toUpperCase() + nameToUse.slice(1),
      cuisine: "Mixed",
      prepTimeMinutes: 30,
      cookTimeMinutes: 30,
      servings: 4,
      difficulty: "Medium",
      description: `Recipe for ${nameToUse}. Error loading complete details due to service limitations.`,
      ingredients: [
        {
          name: "main ingredient",
          quantity: "1",
          unit: "portion",
          imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop&auto=format&q=80"
        },
        {
          name: "other ingredients",
          quantity: "as needed",
          imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=100&h=100&fit=crop&auto=format&q=80"
        }
      ],
      instructions: [
        "Sorry, we couldn't load the complete recipe instructions at this time.",
        "Please try again later or search for a different recipe."
      ],
      tags: ["recipe"],
      video: {
        title: `How to Make ${nameToUse}`,
        channelName: "Cooking Channel",
        videoId: fallbackVideoId,
        thumbnailUrl: `https://i.ytimg.com/vi/${fallbackVideoId}/hqdefault.jpg`
      }
    };
  }
}

// DEPRECATED: This function is no longer needed as ingredient images are included
// directly in the recipe details response
/**
 * @deprecated Images are now included directly in recipe details
 */
export async function getIngredientImages({ ingredients }: { ingredients: string[] }) {
  console.warn("getIngredientImages is deprecated - images are now included directly in recipe details");
  const limitedIngredients = ingredients.slice(0, 4);

  // Simply return API URLs without fetching
  const images = limitedIngredients.map(ingredient => ({
    ingredient,
    imageUrl: `/api/ingredient-image?ingredient=${encodeURIComponent(ingredient)}`
  }));

  return { images };
}