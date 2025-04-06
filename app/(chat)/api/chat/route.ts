import { convertToCoreMessages, Message, streamText } from "ai";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateRecipeDetails,
  searchRecipes,
  getIngredientImages,
  findRecipeVideo
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  saveRecipe,
  deleteChatById,
  getChatById,
  getRecipeById,
  saveChat,
} from "@/db/queries";
import { getCachedRecipe, cacheRecipe } from "@/lib/recipe-cache";

const VALID_YOUTUBE_IDS = ["dQw4w9WgXcQ", "eYq7WapuDLU", "3JZ_D3ELwOQ"]; // Example valid YouTube IDs

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiProModel,
    system: `\n
        - You are an AI Recipe Chatbot that helps users find recipes!
        - Keep your responses friendly but concise.
        - Today's date is ${new Date().toLocaleDateString()}.
        - Focus on providing accurate recipe information.
        - Ask clarifying questions if a request is ambiguous.
        - Be helpful with cooking tips and substitutions when relevant.
        - IMPORTANT: When using the getRecipeDetails tool, DO NOT repeat the full recipe in your text response. 
          The tool will display the recipe card automatically, so your text response should be brief and conversational.
          Simply acknowledge the request and ask if they need anything else or have questions about the recipe.
        - IMPORTANT: When using the searchRecipes tool, DO NOT list the recipes again in your text response.
          The tool will display the recipe list component automatically. Your text response should be brief like
          "Here are some recipes that match your request. Click on any recipe to see more details."
        - The optimal flow is:
          - User asks about a dish/recipe
          - You search for recipes matching the query
          - User selects a specific recipe 
          - You display detailed recipe information including ingredients, steps, videos if available, and ingredient icons
          - Offer to answer any questions about preparation or substitutions
      `,
    messages: coreMessages,
    tools: {
      searchRecipes: {
        description: "Search for recipes based on query terms",
        parameters: z.object({
          query: z.string().describe("Recipe search query (dish name, ingredients, or cuisine)"),
          cuisine: z.string().optional().describe("Optional cuisine type filter"),
          dietary: z.string().optional().describe("Optional dietary restriction (vegetarian, vegan, gluten-free, etc)"),
        }),
        execute: async ({ query, cuisine, dietary }) => {
          const results = await searchRecipes({
            query,
            cuisine,
            dietary,
          });

          return results;
        },
      },
      getRecipeDetails: {
        description: "Get detailed information about a specific recipe",
        parameters: z.object({
          recipeId: z.string().describe("Unique identifier for the recipe"),
          recipeName: z.string().optional().describe("Name of the recipe for better context"),
        }),
        execute: async ({ recipeId, recipeName }) => {
          try {
            // Check cache first to avoid processing again
            const cachedRecipe = getCachedRecipe(recipeId);
            if (cachedRecipe) {
              console.log("Using cached recipe for:", recipeId);
              return cachedRecipe;
            }
            
            const nameToUse = recipeName || recipeId.replace(/^recipe_/, '').replace(/-/g, ' ');
            
            // Wrap in Promise.race with a timeout to ensure we don't hang
            const recipeDetailsPromise = new Promise(async (resolve, reject) => {
              try {
                const details = await generateRecipeDetails({ 
                  recipeId,
                  recipeName: nameToUse
                });
                resolve(details);
              } catch (error) {
                reject(error);
              }
            });
            
            // Set a more forgiving timeout (20 seconds)
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("Recipe details generation timed out")), 45000);
            });
            
            // Race between the recipe generation and timeout
            const recipeDetails = await Promise.race([
              recipeDetailsPromise, 
              timeoutPromise
            ]) as any;

            console.info("Recipe details generated:", recipeDetails);
            
            // Once we have the details, immediately cache them
            if (recipeDetails) {
              cacheRecipe(recipeId, recipeDetails);
              
              // Save to database in background - don't wait for it
              if (session?.user?.id) {
                // Generate a unique DB ID to avoid collisions
                const uniqueDbId = `${recipeId}_${uuidv4().substring(0, 8)}`;
                
                saveRecipe({
                  id: uniqueDbId,
                  userId: session?.user?.id,
                  details: recipeDetails,
                }).catch(err => {
                  console.error("Error saving recipe to DB (background):", err);
                  // Try alternative approach on duplicate key error
                  if (err.code === '23505' && session?.user?.id) {
                    const retryId = `${recipeId}_${Date.now()}`;
                    console.log(`Retrying with alternative ID: ${retryId}`);
                    saveRecipe({
                      id: retryId,
                      userId: session?.user.id,
                      details: recipeDetails,
                    }).catch(retryErr => console.error("Retry failed:", retryErr));
                  }
                });
              }
              
              return recipeDetails;
            }
            
            throw new Error("Failed to generate recipe details");
          } catch (error) {
            console.error("Error in getRecipeDetails tool:", error);
            
            // Return a basic response to prevent UI from hanging
            const fallbackName = recipeName || recipeId.replace(/^recipe_/, '').replace(/-/g, ' ');
            
            // Use our known working videos and images
            const fallbackVideoId = VALID_YOUTUBE_IDS[Math.floor(Math.random() * VALID_YOUTUBE_IDS.length)];
            
            const fallbackRecipe = {
              id: recipeId,
              name: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
              cuisine: "Not specified",
              prepTimeMinutes: 30,
              cookTimeMinutes: 30,
              servings: 4,
              difficulty: "Medium",
              description: "We couldn't load the complete recipe details at this moment. This might be due to high demand or technical limitations.",
              ingredients: [
                { 
                  name: "Ingredients not available at this time", 
                  quantity: "", 
                  unit: "",
                  imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop&auto=format&q=80" 
                }
              ],
              instructions: [
                "Recipe details could not be loaded.",
                "Please try again later or search for a different recipe."
              ],
              tags: ["recipe"],
              video: {
                title: `How to Make ${fallbackName}`,
                channelName: "Cooking Channel",
                videoId: fallbackVideoId,
                thumbnailUrl: `https://img.youtube.com/vi/${fallbackVideoId}/hqdefault.jpg`
              }
            };
            
            // Cache even the fallback to prevent repeated failures
            cacheRecipe(recipeId, fallbackRecipe);
            
            return fallbackRecipe;
          }
        },
      },
      findRecipeVideo: {
        description: "Find a YouTube video for a recipe",
        parameters: z.object({
          recipeName: z.string().describe("Name of the recipe to find a video for"),
        }),
        execute: async ({ recipeName }) => {
          const videoInfo = await findRecipeVideo( recipeName );
          return videoInfo;
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
