/**
 * Comprehensive ingredient image database with semantic categorization
 * This provides a structured approach to ingredient image retrieval similar to CLIP's semantic matching
 */

// Main ingredient database with verified, high-quality images
export const INGREDIENT_IMAGES: Record<string, {
  imageUrl: string;
  category: string;
  aliases: string[];
}> = {
  // Vegetables
  "onion": {
    imageUrl: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["yellow onion", "white onion", "red onion", "sweet onion"]
  },
  "garlic": {
    imageUrl: "https://images.unsplash.com/photo-1615474634824-f45fb12b24a7?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["garlic clove", "minced garlic", "garlic powder"]
  },
  "tomato": {
    imageUrl: "https://images.unsplash.com/photo-1561136594-7f68413baa99?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["roma tomato", "cherry tomato", "tomatoes", "diced tomatoes"]
  },
  "potato": {
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["russet potato", "yukon gold potato", "sweet potato", "potatoes"]
  },
  "carrot": {
    imageUrl: "https://images.unsplash.com/photo-1598170845057-d2686cfc7e1b?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["carrots", "baby carrots", "sliced carrots", "shredded carrots"]
  },
  "bell pepper": {
    imageUrl: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["red pepper", "green pepper", "yellow pepper", "sweet pepper", "capsicum"]
  },
  "broccoli": {
    imageUrl: "https://images.unsplash.com/photo-1584270354949-c26b0d080672?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["broccoli florets"]
  },
  "spinach": {
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["baby spinach", "fresh spinach", "spinach leaves"]
  },
  "cucumber": {
    imageUrl: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["cucumbers", "english cucumber", "pickle"]
  },
  "lettuce": {
    imageUrl: "https://images.unsplash.com/photo-1621794939886-6494d66a8c3e?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["romaine lettuce", "iceberg lettuce", "green leaf lettuce"]
  },
  "mushroom": {
    imageUrl: "https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["mushrooms", "cremini mushrooms", "portobello mushrooms", "shiitake mushrooms"]
  },
  "zucchini": {
    imageUrl: "https://images.unsplash.com/photo-1587334207855-d698c41c546c?w=200&h=200&fit=crop",
    category: "vegetable",
    aliases: ["courgette", "summer squash"]
  },
  
  // Fruits
  "apple": {
    imageUrl: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=200&h=200&fit=crop",
    category: "fruit",
    aliases: ["green apple", "red apple", "granny smith", "fuji apple", "apples"]
  },
  "banana": {
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop",
    category: "fruit",
    aliases: ["bananas", "ripe banana"]
  },
  "lemon": {
    imageUrl: "https://images.unsplash.com/photo-1582287014914-1db836440335?w=200&h=200&fit=crop",
    category: "fruit",
    aliases: ["lemons", "lemon juice", "lemon zest"]
  },
  "lime": {
    imageUrl: "https://images.unsplash.com/photo-1622957461168-202c792b3703?w=200&h=200&fit=crop",
    category: "fruit",
    aliases: ["limes", "lime juice", "lime zest"]
  },
  "orange": {
    imageUrl: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=200&h=200&fit=crop",
    category: "fruit",
    aliases: ["oranges", "orange juice", "orange zest", "mandarin"]
  },
  "strawberry": {
    imageUrl: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=200&h=200&fit=crop",
    category: "fruit",
    aliases: ["strawberries", "sliced strawberries"]
  },
  "blueberry": {
    imageUrl: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=200&h=200&fit=crop",
    category: "fruit",
    aliases: ["blueberries", "fresh blueberries"]
  },
  "avocado": {
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop",
    category: "fruit",
    aliases: ["avocados", "avocado slices", "guacamole"]
  },
  
  // Proteins
  "chicken": {
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop",
    category: "protein",
    aliases: ["chicken breast", "chicken thigh", "chicken leg", "chicken wings", "ground chicken"]
  },
  "beef": {
    imageUrl: "https://images.unsplash.com/photo-1588347875129-2a3133cbae99?w=200&h=200&fit=crop",
    category: "protein",
    aliases: ["ground beef", "steak", "beef chuck", "beef tenderloin", "stewing beef"]
  },
  "pork": {
    imageUrl: "https://images.unsplash.com/photo-1602901248692-06c8935adac0?w=200&h=200&fit=crop",
    category: "protein",
    aliases: ["pork chop", "pork tenderloin", "ground pork", "pork shoulder", "bacon"]
  },
  "fish": {
    imageUrl: "https://images.unsplash.com/photo-1611171711791-b34b41b1b1a4?w=200&h=200&fit=crop", 
    category: "protein",
    aliases: ["white fish", "tilapia", "cod", "halibut", "trout"]
  },
  "salmon": {
    imageUrl: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=200&h=200&fit=crop",
    category: "protein",
    aliases: ["salmon fillet", "smoked salmon", "grilled salmon"]
  },
  "shrimp": {
    imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&h=200&fit=crop",
    category: "protein",
    aliases: ["prawns", "jumbo shrimp", "shrimps"]
  },
  "tofu": {
    imageUrl: "https://images.unsplash.com/photo-1584321893279-012788df9f22?w=200&h=200&fit=crop",
    category: "protein",
    aliases: ["firm tofu", "silken tofu", "extra firm tofu"]
  },
  "egg": {
    imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200&h=200&fit=crop",
    category: "protein",
    aliases: ["eggs", "egg whites", "egg yolks", "hard boiled eggs", "fried egg"]
  },
  
  // Dairy
  "milk": {
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop",
    category: "dairy",
    aliases: ["whole milk", "skim milk", "2% milk", "almond milk", "soy milk"]
  },
  "butter": {
    imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop",
    category: "dairy",
    aliases: ["unsalted butter", "salted butter", "melted butter"]
  },
  "cheese": {
    imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop",
    category: "dairy",
    aliases: ["cheddar", "mozzarella", "parmesan", "feta", "cream cheese"]
  },
  "yogurt": {
    imageUrl: "https://images.unsplash.com/photo-1584278868734-7d1d2388c55c?w=200&h=200&fit=crop",
    category: "dairy",
    aliases: ["greek yogurt", "plain yogurt", "vanilla yogurt"]
  },
  "cream": {
    imageUrl: "https://images.unsplash.com/photo-1587657565520-6c0c52d70b2a?w=200&h=200&fit=crop",
    category: "dairy",
    aliases: ["heavy cream", "whipping cream", "sour cream", "half and half"]
  },
  "parmesan": {
    imageUrl: "https://images.unsplash.com/photo-1646627928092-44c8e964481d?w=200&h=200&fit=crop",
    category: "dairy",
    aliases: ["parmesan cheese", "grated parmesan", "parmigiano reggiano"]
  },
  
  // Grains and Pasta
  "rice": {
    imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=200&h=200&fit=crop",
    category: "grain",
    aliases: ["white rice", "brown rice", "jasmine rice", "basmati rice", "arborio rice"]
  },
  "pasta": {
    imageUrl: "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=200&h=200&fit=crop",
    category: "grain",
    aliases: ["noodles", "macaroni", "penne", "rotini", "farfalle"]
  },
  "spaghetti": {
    imageUrl: "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=200&h=200&fit=crop",
    category: "grain",
    aliases: ["spaghettini", "linguine", "fettuccine", "angel hair pasta"]
  },
  "bread": {
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=200&h=200&fit=crop",
    category: "grain",
    aliases: ["white bread", "wheat bread", "sourdough", "baguette", "rolls"]
  },
  "flour": {
    imageUrl: "https://images.unsplash.com/photo-1612878100556-032e2dccb2f8?w=200&h=200&fit=crop",
    category: "grain",
    aliases: ["all-purpose flour", "bread flour", "cake flour", "whole wheat flour"]
  },
  
  // Herbs and Spices
  "basil": {
    imageUrl: "https://images.unsplash.com/photo-1600692280094-368bccd586c1?w=200&h=200&fit=crop",
    category: "herb",
    aliases: ["fresh basil", "basil leaves", "dried basil"]
  },
  "parsley": {
    imageUrl: "https://images.unsplash.com/photo-1590759485418-80637e77174d?w=200&h=200&fit=crop",
    category: "herb",
    aliases: ["fresh parsley", "dried parsley", "parsley leaves", "chopped parsley"]
  },
  "cilantro": {
    imageUrl: "https://images.unsplash.com/photo-1596546463702-7d15868439ae?w=200&h=200&fit=crop",
    category: "herb",
    aliases: ["coriander", "fresh cilantro", "chinese parsley"]
  },
  "mint": {
    imageUrl: "https://images.unsplash.com/photo-1628196237219-9d0ab2abeee1?w=200&h=200&fit=crop",
    category: "herb",
    aliases: ["fresh mint", "mint leaves", "peppermint", "spearmint"]
  },
  "salt": {
    imageUrl: "https://images.unsplash.com/photo-1610154941541-0c11face5b2e?w=200&h=200&fit=crop", 
    category: "spice",
    aliases: ["sea salt", "kosher salt", "table salt", "pink salt"]
  },
  "pepper": {
    imageUrl: "https://images.unsplash.com/photo-1556060986-7ad911cc81b8?w=200&h=200&fit=crop",
    category: "spice",
    aliases: ["black pepper", "white pepper", "ground pepper", "peppercorns"]
  },
  "cinnamon": {
    imageUrl: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=200&h=200&fit=crop",
    category: "spice",
    aliases: ["ground cinnamon", "cinnamon sticks", "cassia"]
  },
  "cumin": {
    imageUrl: "https://images.pexels.com/photos/4198384/pexels-photo-4198384.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1",
    category: "spice",
    aliases: ["ground cumin", "cumin seeds", "jeera"]
  },
  
  // Oils and Condiments
  "olive oil": {
    imageUrl: "https://images.unsplash.com/photo-1579448824458-19df7f39f146?w=200&h=200&fit=crop",
    category: "condiment",
    aliases: ["extra virgin olive oil", "EVOO", "virgin olive oil"]
  },
  "vegetable oil": {
    imageUrl: "https://images.pexels.com/photos/2611814/pexels-photo-2611814.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1",
    category: "condiment",
    aliases: ["canola oil", "cooking oil", "sunflower oil", "corn oil"]
  },
  "sugar": {
    imageUrl: "https://images.unsplash.com/photo-1584478400633-3c9ed0161667?w=200&h=200&fit=crop",
    category: "condiment",
    aliases: ["white sugar", "granulated sugar", "cane sugar", "brown sugar"]
  },
  "honey": {
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop",
    category: "condiment",
    aliases: ["raw honey", "clover honey", "wildflower honey"]
  },
  "vinegar": {
    imageUrl: "https://images.unsplash.com/photo-1593486918626-6d589403e4de?w=200&h=200&fit=crop",
    category: "condiment",
    aliases: ["white vinegar", "apple cider vinegar", "balsamic vinegar", "red wine vinegar"]
  },
  "soy sauce": {
    imageUrl: "https://images.unsplash.com/photo-1598546924034-798a5637a823?w=200&h=200&fit=crop",
    category: "condiment",
    aliases: ["tamari", "shoyu", "light soy sauce", "dark soy sauce"]
  },
};

// Category-based fallback images for when no specific match is found
export const CATEGORY_FALLBACKS: Record<string, string> = {
  "vegetable": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop",
  "fruit": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop",
  "protein": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop",
  "dairy": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop",
  "grain": "https://images.unsplash.com/photo-1586444248890-2e772fcbdcb2?w=200&h=200&fit=crop",
  "herb": "https://images.unsplash.com/photo-1611822417661-e6a3cc9892b8?w=200&h=200&fit=crop",
  "spice": "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=200&h=200&fit=crop",
  "condiment": "https://images.unsplash.com/photo-1589540306194-e0054daa4ae9?w=200&h=200&fit=crop"
};

// Generic fallback for when no category match is found
export const GENERIC_FOOD_FALLBACK = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop";
