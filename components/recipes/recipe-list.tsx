"use client";

import { useChat } from "ai/react";
import { Clock, ChefHat, Users } from "lucide-react";

const SAMPLE = {
  recipes: [
    {
      id: "recipe_1",
      name: "Spaghetti Carbonara",
      cuisine: "Italian",
      prepTimeMinutes: 15,
      cookTimeMinutes: 20,
      servings: 4,
      difficulty: "Medium",
      shortDescription: "Classic Italian pasta dish with eggs, cheese, and pancetta",
    },
    {
      id: "recipe_2",
      name: "Simple Chicken Curry",
      cuisine: "Indian",
      prepTimeMinutes: 20,
      cookTimeMinutes: 30,
      servings: 4,
      difficulty: "Medium",
      shortDescription: "Flavorful curry with tender chicken and aromatic spices",
    },
    {
      id: "recipe_3",
      name: "Vegetable Stir Fry",
      cuisine: "Chinese",
      prepTimeMinutes: 15,
      cookTimeMinutes: 10,
      servings: 3,
      difficulty: "Easy",
      shortDescription: "Quick and healthy vegetable stir fry with soy sauce",
    },
    {
      id: "recipe_4",
      name: "Classic Burger",
      cuisine: "American",
      prepTimeMinutes: 20,
      cookTimeMinutes: 15,
      servings: 4,
      difficulty: "Easy",
      shortDescription: "Juicy patties with classic burger toppings",
    },
  ],
};

export function RecipeList({
  chatId,
  results = SAMPLE,
}: {
  chatId: string;
  results?: typeof SAMPLE;
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });

  return (
    <div className="rounded-lg bg-muted px-4 py-3 flex flex-col gap-3">
      <h3 className="text-lg font-medium">Recipe Results</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {results.recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="cursor-pointer flex flex-col gap-2 p-3 border rounded-md hover:bg-accent/50 transition-colors"
            onClick={() => {
              append({
                role: "user",
                content: `I'd like to see the detailed recipe for ${recipe.name}`,
              });
            }}
          >
            <div className="font-medium hover:underline">{recipe.name}</div>
            <div className="text-sm text-muted-foreground">{recipe.shortDescription}</div>
            <div className="flex flex-row gap-4 mt-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ChefHat className="h-3 w-3" />
                <span>{recipe.difficulty}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{recipe.servings} servings</span>
              </div>
            </div>
            <div className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded w-fit">
              {recipe.cuisine}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Note: Some recipes may have limited details due to service limitations.
      </div>
    </div>
  );
}
