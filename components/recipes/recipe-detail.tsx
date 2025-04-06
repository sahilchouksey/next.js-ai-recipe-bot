import { Clock, ChefHat, Users, Utensils, Image as ImageIcon, AlertCircle } from "lucide-react";
import NextImage from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Known working YouTube IDs for fallback
const VALID_YOUTUBE_IDS = [
  "JsimwZYPmTw", // Cooking basics
  "VVnZd8A84z4", // Recipe tutorial
  "OCunSb81vUA", // Simple recipes
  "ZJy1ajvMU1k"  // Cooking tips
];

const SAMPLE = {
  id: "recipe_1",
  name: "Spaghetti Carbonara",
  cuisine: "Italian",
  prepTimeMinutes: 15,
  cookTimeMinutes: 20,
  servings: 4,
  difficulty: "Medium",
  description: "A classic Italian pasta dish from Rome made with eggs, hard cheese, cured pork, and black pepper. Simple yet delicious!",
  ingredients: [
    { name: "spaghetti", quantity: "400", unit: "g", imageUrl: "https://source.unsplash.com/random/100x100/?spaghetti" },
    { name: "pancetta", quantity: "150", unit: "g", imageUrl: "https://source.unsplash.com/random/100x100/?pancetta" },
    { name: "egg yolks", quantity: "6", imageUrl: "https://source.unsplash.com/random/100x100/?eggs" },
    { name: "Pecorino Romano cheese", quantity: "50", unit: "g", imageUrl: "https://source.unsplash.com/random/100x100/?cheese" },
    { name: "black pepper", quantity: "1", unit: "tsp", imageUrl: "https://source.unsplash.com/random/100x100/?blackpepper" },
    { name: "salt", quantity: "to taste", imageUrl: "https://source.unsplash.com/random/100x100/?salt" },
  ],
  instructions: [
    "Bring a large pot of salted water to boil and cook spaghetti according to package directions until al dente.",
    "While pasta cooks, cut the pancetta into small cubes and fry in a large pan until crispy.",
    "In a bowl, whisk together egg yolks, grated cheese, and black pepper.",
    "Drain the pasta, reserving about 1/2 cup of pasta water.",
    "Working quickly, add hot pasta to the pan with pancetta, remove from heat.",
    "Add the egg mixture to the pasta, stirring quickly so eggs don't scramble.",
    "Add a splash of reserved pasta water to create a creamy sauce.",
    "Serve immediately with extra grated cheese and black pepper on top."
  ],
  nutritionFacts: {
    calories: 450,
    protein: "22g",
    carbs: "55g",
    fat: "18g"
  },
  tags: ["pasta", "italian", "quick", "dinner"],
  video: {
    title: "How to Make Perfect Spaghetti Carbonara",
    channelName: "Italian Cuisine Master",
    videoId: "dQw4w9WgXcQ", // Example YouTube ID
    thumbnailUrl: "https://source.unsplash.com/random/640x360/?cooking,pasta",
    duration: "10:05",
    views: 123456
  },
  mainImageUrl: "https://source.unsplash.com/random/640x360/?spaghetti,carbonara"
};

// Function to handle image errors and replace with placeholder
function ImageWithFallback({ src, alt, ...props }: {
  src: string;
  alt: string;
  [key: string]: any;
}) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Pre-calculate a placeholder size to prevent layout shifts
  const [placeholderSize, setPlaceholderSize] = useState({
    width: props.width || '100%',
    height: props.height || '100%',
  });
  
  useEffect(() => {
    if (props.fill) {
      // For fill mode, use 100% dimensions
      setPlaceholderSize({ width: '100%', height: '100%' });
    }
  }, [props.fill]);
  
  useEffect(() => {
    setImgSrc(src);
    setError(false);
    setLoading(true);
    
    // Preload the image to check if it's valid
    const img = new Image();
    img.src = src;
    
    // Handle image load/error events without causing scroll jumps
    img.onload = () => {
      // Use RAF to avoid layout shifts during render
      requestAnimationFrame(() => {
        setLoading(false);
      });
    };
    
    img.onerror = () => {
      // Use RAF to avoid layout shifts during render
      requestAnimationFrame(() => {
        setError(true);
        setLoading(false);
        setImgSrc(`https://via.placeholder.com/100?text=${encodeURIComponent(alt.substring(0, 10))}`);
      });
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, alt]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted animate-pulse">
        <ImageIcon className="h-5 w-5 text-muted-foreground opacity-50" />
      </div>
    );
  }
  
  if (error) {
    return (
     null
    );
  }
  
  return (
    <NextImage
      ref={imageRef}
      src={imgSrc}
      alt={alt}
      {...props}
      onError={() => {
        setError(true);
        setImgSrc(`https://via.placeholder.com/100?text=${encodeURIComponent(alt.substring(0, 10))}`);
      }}
      // Set a priority flag for the main dishes to help loading priority
      priority={props.priority || false}
      // Reserve image dimensions to prevent layout shifts
      placeholder="empty"
      style={{
        objectFit: 'cover',
        // Ensure image size is stable to prevent layout shifts
        ...placeholderSize
      }}
    />
  );
}

// Component to handle YouTube videos with fallbacks
function YouTubeVideo({ videoId, title, channelName, duration, views }: { 
  videoId: string;
  title: string;
  channelName: string;
  duration?: string;
  views?: number;
}) {
  const [isValid, setIsValid] = useState<boolean>(true);
  const [fallbackId, setFallbackId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  
  useEffect(() => {
    setIframeLoading(true);
    
    // Set a timeout to stop showing loading indicator after a reasonable time
    const loadingTimeout = setTimeout(() => {
      setIframeLoading(false);
    }, 3000);
    
    return () => clearTimeout(loadingTimeout);
  }, [videoId, fallbackId]);
  
  const handleIframeError = useCallback(() => {
    console.log("YouTube iframe failed to load, using fallback");
    if (isValid) {
      const randomIndex = Math.floor(Math.random() * VALID_YOUTUBE_IDS.length);
      setFallbackId(VALID_YOUTUBE_IDS[randomIndex]);
      setIsValid(false);
      setLoadError(true);
    }
    setIframeLoading(false);
  }, [isValid]);
  
  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false);
  }, []);
  
  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-muted flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading video...</div>
      </div>
    );
  }
  
  const embedId = isValid ? videoId : fallbackId;
  const displayTitle = isValid ? title : `How to Make a Similar Recipe`;
  const displayChannelName = isValid ? channelName : "Cooking Channel";
  
  return (
    <div className="w-full overflow-hidden rounded-md mb-2">
      <div 
        className="relative w-full aspect-video"
        // Set a specific height to prevent layout shifts
        style={{ height: 'calc(width * 0.5625)' }} // 16:9 aspect ratio
      >
        {iframeLoading && (
          <div className="absolute inset-0 z-10 bg-muted flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading video...</div>
          </div>
        )}
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${embedId}?mute=1`}
          title={displayTitle}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0"
          onError={handleIframeError}
          onLoad={handleIframeLoad}
        />
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium">{displayTitle}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{displayChannelName}</p>
          {duration && <span className="text-xs text-muted-foreground">{duration}</span>}
        </div>
        {views !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Intl.NumberFormat().format(views)} views
          </p>
        )}
        {(!isValid || loadError) && (
          <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
            <AlertCircle size={12} />
            <span>Original video unavailable, showing an alternative</span>
          </p>
        )}
      </div>
    </div>
  );
}

// Enhanced MainDishImage component with better dish-image API integration
function MainDishImage({ recipe }: { recipe: any }) {
  const [imageUrl, setImageUrl] = useState<string>(recipe.mainImageUrl || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  
  useEffect(() => {
    // Try to load image from mainImageUrl first
    if (recipe.mainImageUrl) {
      const img = new Image();
      img.src = recipe.mainImageUrl;
      img.onload = () => {
        setImageUrl(recipe.mainImageUrl);
        setIsLoading(false);
        setHasError(false);
      };
      img.onerror = () => {
        // If mainImageUrl fails, use dish-image API
        fetchDishImage();
      };
      
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    } else {
      // No mainImageUrl provided, go straight to dish-image API
      fetchDishImage();
    }
  }, [recipe.name, recipe.mainImageUrl]);
  
  // Fetch an image from the dish-image API
  const fetchDishImage = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Add cuisine info if available for better matching
      const cuisineParam = recipe.cuisine ? `&cuisine=${encodeURIComponent(recipe.cuisine)}` : '';
      const response = await fetch(`/api/dish-image?dish=${encodeURIComponent(recipe.name)}${cuisineParam}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          setIsLoading(false);
          setHasError(false);
          return;
        }
      }
      throw new Error('Failed to get dish image');
    } catch (error) {
      console.error('Error fetching dish image:', error);
      // Use a guaranteed fallback from Unsplash food collection
      setImageUrl('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    // Use a fixed aspect ratio container to prevent layout shifts
    <div className="w-full relative mb-4" style={{ aspectRatio: '16/9', minHeight: '240px' }}>
      <Avatar className="w-full h-full rounded-md">
        <AvatarImage
          src={imageUrl}
          alt={`${recipe.name} - ${recipe.cuisine || 'Food'} dish`}
          className="object-cover w-full h-full"
          onError={() => {
            if (!hasError) {
              fetchDishImage();
            }
          }}
        />
        <AvatarFallback className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
          <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-base font-medium text-gray-700">{recipe.name}</p>
          <p className="text-xs italic text-gray-500 mt-1">Image not available</p>
        </AvatarFallback>
      </Avatar>
      
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 flex flex-col items-center justify-center z-10">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-gray-600">Preparing your culinary visual...</p>
        </div>
      )}
    </div>
  );
}

export function RecipeDetail({ recipe = SAMPLE }) {
  const ingredients = recipe?.ingredients || [];
  const instructions = recipe?.instructions || [];
  const tags = recipe?.tags || [];
  const video = recipe?.video;
  
  console.log(recipe)
  return (
    <div className="rounded-lg bg-muted p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold">{recipe.name}</h2>
        <p className="text-muted-foreground mt-1">{recipe.description}</p>
      </div>
      
      {/* Main dish image - UPDATED SECTION */}
      {/* <MainDishImage recipe={recipe} /> */}
      
      {/* Video section */}
      {video && (
        <YouTubeVideo 
          videoId={video.videoId}
          title={video.title}
          channelName={video.channelName}
          duration={video.duration}
          views={video.views}
        />
      )}
      
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Prep: {recipe.prepTimeMinutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Utensils className="h-4 w-4" />
          <span className="text-sm">Cook: {recipe.cookTimeMinutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <ChefHat className="h-4 w-4" />
          <span className="text-sm">Difficulty: {recipe.difficulty}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span className="text-sm">Serves: {recipe.servings}</span>
        </div>
      </div>
      
      <div className="border-t pt-3">
        <h3 className="font-medium mb-2">Ingredients</h3>
        <ul className="grid gap-4 md:gap-3">
          {ingredients.length > 0 ? ingredients.map((ingredient, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <Avatar className="h-12 w-12 rounded-full">
                <AvatarImage 
                  src={ingredient.imageUrl || `/api/ingredient-image?ingredient=${encodeURIComponent(ingredient.name)}`}
                  alt={ingredient.name}
                />
                <AvatarFallback className="bg-primary/10">
                  {ingredient.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>
                <strong>{ingredient.name}</strong>: {ingredient.quantity} {ingredient.unit}
              </span>
            </li>
          )) : (
            <li className="text-sm text-muted-foreground">Ingredient information not available</li>
          )}
        </ul>
      </div>
      
      <div className="border-t pt-3">
        <h3 className="font-medium mb-2">Instructions</h3>
        <ol className="flex flex-col gap-3">
          {instructions.length > 0 ? instructions.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs shrink-0">
                {i + 1}
              </span>
              <span className="text-sm">{step}</span>
            </li>
          )) : (
            <li className="text-sm text-muted-foreground">Instructions not available</li>
          )}
        </ol>
      </div>
      
      {recipe.nutritionFacts && (
        <div className="border-t pt-3">
          <h3 className="font-medium mb-2">Nutrition (per serving)</h3>
          <div className="flex flex-wrap gap-3">
            <div className="px-2 py-1 bg-background rounded text-sm">
              {recipe.nutritionFacts.calories} calories
            </div>
            <div className="px-2 py-1 bg-background rounded text-sm">
              {recipe.nutritionFacts.protein} protein
            </div>
            {recipe.nutritionFacts.carbs && (
              <div className="px-2 py-1 bg-background rounded text-sm">
                {recipe.nutritionFacts.carbs} carbs
              </div>
            )}
            <div className="px-2 py-1 bg-background rounded text-sm">
              {recipe.nutritionFacts.fat} fat
            </div>
          </div>
        </div>
      )}
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
