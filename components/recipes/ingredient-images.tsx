import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SAMPLE = {
  images: [
    {
      ingredient: "spaghetti",
      imageUrl: "/api/ingredient-image?ingredient=spaghetti"
    },
    {
      ingredient: "pancetta",
      imageUrl: "/api/ingredient-image?ingredient=pancetta"
    },
    {
      ingredient: "eggs",
      imageUrl: "/api/ingredient-image?ingredient=eggs"
    },
    {
      ingredient: "Pecorino Romano",
      imageUrl: "/api/ingredient-image?ingredient=Pecorino%20Romano"
    },
  ]
};

export function IngredientImages({ ingredientData = SAMPLE }) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <h3 className="font-medium mb-3">Key Ingredients</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ingredientData.images.map((item) => (
          <div key={item.ingredient} className="flex flex-col items-center gap-1">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={item.imageUrl || `/api/ingredient-image?ingredient=${encodeURIComponent(item.ingredient)}`}
                alt={item.ingredient}
                className="object-cover"
              />
              <AvatarFallback className="text-xs">
                {item.ingredient.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-center">{item.ingredient}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
