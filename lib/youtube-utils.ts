/**
 * Converts a YouTube time string (like "10:30" or "1:30:45") to seconds
 */
export function convertYouTubeTimeToSeconds(timeString: string): number {
  if (!timeString) return 0;
  
  const parts = timeString.split(':').map(Number);
  
  if (parts.length === 3) {
    // Hours:Minutes:Seconds format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // Minutes:Seconds format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // Seconds only
    return parts[0];
  }
  
  return 0;
}

/**
 * Determines if a video title is relevant to a recipe search
 */
export function isRelevantCookingTitle(title: string, recipeName: string): boolean {
  const titleLower = title.toLowerCase();
  const recipeNameLower = recipeName.toLowerCase();
  
  // Check if title contains the recipe name
  if (titleLower.includes(recipeNameLower)) {
    return true;
  }
  
  // Check for cooking-related keywords
  const cookingKeywords = ['recipe', 'cook', 'make', 'how to', 'homemade', 'tutorial'];
  return cookingKeywords.some(keyword => titleLower.includes(keyword));
}

/**
 * Score a video based on its relevance to recipes and cooking
 */
export function scoreYouTubeVideo(
  video: {
    title: string;
    channelName: string;
    duration?: string;
    views?: number;
  },
  recipeName: string
): number {
  let score = 0;
  const titleLower = video.title.toLowerCase();
  const channelLower = video.channelName.toLowerCase();
  const recipeNameLower = recipeName.toLowerCase();
  
  // Recipe name in title (highest value)
  if (titleLower.includes(recipeNameLower)) {
    score += 20;
  }
  
  // Recipe-specific keywords in title
  if (titleLower.includes('recipe') || titleLower.includes('how to make')) {
    score += 15;
  }
  
  // Cooking channel or chef in name
  const channelKeywords = ['cook', 'chef', 'kitchen', 'food', 'recipe', 'culinary', 'taste'];
  if (channelKeywords.some(word => channelLower.includes(word))) {
    score += 10;
  }
  
  // Ideal video length (5-20 minutes is ideal for recipes)
  if (video.duration) {
    const durationSeconds = convertYouTubeTimeToSeconds(video.duration);
    if (durationSeconds > 300 && durationSeconds < 1200) {
      score += 8;
    } else if (durationSeconds > 180 && durationSeconds < 1800) {
      // Slightly less ideal range, but still good
      score += 5;
    }
  }
  
  // Videos with more views generally indicate higher quality 
  if (video.views) {
    if (video.views > 1000000) {
      score += 7;
    } else if (video.views > 100000) {
      score += 5;
    } else if (video.views > 10000) {
      score += 3;
    }
  }
  
  return score;
}
