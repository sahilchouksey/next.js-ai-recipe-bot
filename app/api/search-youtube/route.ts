import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { geminiFlashModel } from "@/ai";
import { getReliableFallbackVideo } from "@/lib/video-fallbacks";
import { hasBasicYouTubeAuth } from "@/lib/youtube-config";
import { searchYoutube, searchYoutubeDirectAPI, getVideoInfo, formatDuration } from "@/lib/youtube-search";

// Cache for storing search results to avoid repeating searches
const searchCache: Record<string, {
  timestamp: number,
  results: any
}> = {};

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

// Function to generate an AI-enhanced search query for better YouTube results
async function enhanceSearchQuery(recipeName: string): Promise<string> {
  try {
    const { object: searchQuery } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate a precise YouTube search query that will find the most helpful cooking tutorial for: "${recipeName}".
       Include key terms like "how to make" or "recipe" and specific cooking techniques. 
       ONLY output the exact search query text with no additional explanation.`,
      schema: z.string().describe("The optimized YouTube search query for this recipe"),
      temperature: 0.3,
      maxTokens: 100,
    });
    
    console.log(`Enhanced query for "${recipeName}": "${searchQuery}"`);
    return searchQuery;
  } catch (error) {
    console.error("Error generating enhanced query:", error);
    return `how to make ${recipeName} recipe tutorial`;
  }
}

// Search YouTube with improved error handling and direct API support
async function searchYouTubeWithDetails(query: string, cuisine?: string): Promise<{ 
  id: string, 
  title: string, 
  channelName: string, 
  thumbnailUrl: string,
  duration: string,
  views: number
} | null> {
  try {
    // Check cache first
    const cacheKey = query.toLowerCase();
    if (searchCache[cacheKey] && 
        (Date.now() - searchCache[cacheKey].timestamp) < CACHE_EXPIRATION) {
      console.log("Using cached search results");
      return searchCache[cacheKey].results;
    }

    // First try the direct API method if we have basic authentication
    let searchResults = [];
    if (hasBasicYouTubeAuth()) {
      searchResults = await searchYoutubeDirectAPI(query);
    }
    
    // Fall back to youtube-search-api if direct API returned no results
    if (!searchResults || searchResults.length === 0) {
      console.log("Direct API search failed or returned no results, trying youtube-search-api");
      searchResults = await searchYoutube(query);
    }
    
    if (!searchResults || searchResults.length === 0) {
      console.error("No search results found from any source");
      return RELIABLE_VIDEOS[Math.floor(Math.random() * RELIABLE_VIDEOS.length)];
    }
    
    // Score search results to find the most relevant video
    const scoredResults = searchResults.map((item:any) => {
      let score = 0;
      const title = item.title?.toLowerCase() || '';
      
      // Factor 1: Prefer videos with recipe-related terms in title
      if (title.includes('recipe') || 
          title.includes('how to') || 
          title.includes('cooking') || 
          title.includes('make')) {
        score += 10;
      }
      
      // Factor 2: Length is between 5-20 minutes
      const lengthSeconds = (item.length?.seconds || 0);
      if (lengthSeconds >= 300 && lengthSeconds <= 1200) {
        score += 5;
      }
      
      return { item, score };
    });
    
    // Sort by score
    scoredResults.sort((a:any, b:any) => b.score - a.score);
    
    // Get the best match
    const bestMatch = scoredResults[0]?.item;
    
    if (!bestMatch || !bestMatch.id) {
      return RELIABLE_VIDEOS[Math.floor(Math.random() * RELIABLE_VIDEOS.length)];
    }
    
    // Get more details for the video
    const videoInfo = await getVideoInfo(bestMatch.id);
    
    if (videoInfo && videoInfo.videoDetails) {
      const result = {
        id: bestMatch.id,
        title: videoInfo.videoDetails.title || bestMatch.title,
        channelName: videoInfo.videoDetails.author?.name || bestMatch.channelTitle || "Unknown Channel",
        thumbnailUrl: videoInfo.videoDetails.thumbnails?.[0]?.url || 
                    `https://i.ytimg.com/vi/${bestMatch.id}/hqdefault.jpg`,
        duration: videoInfo.videoDetails.lengthSeconds ? 
                formatDuration(parseInt(videoInfo.videoDetails.lengthSeconds)) : 
                bestMatch.length?.text || "Unknown",
        views: parseInt(videoInfo.videoDetails.viewCount || '0')
      };
      
      // Cache the results
      searchCache[cacheKey] = {
        timestamp: Date.now(),
        results: result
      };
      
      return result;
    }
    
    // If detailed info is unavailable, use the basic search result
    const fallbackResult = {
      id: bestMatch.id,
      title: bestMatch.title || `How to Make ${query}`,
      channelName: bestMatch.channelTitle || "Cooking Channel",
      thumbnailUrl: bestMatch.thumbnail?.thumbnails?.[0]?.url || 
                  `https://i.ytimg.com/vi/${bestMatch.id}/hqdefault.jpg`,
      duration: bestMatch.length?.text || "Unknown",
      views: 0
    };
    
    // Cache the results
    searchCache[cacheKey] = {
      timestamp: Date.now(),
      results: fallbackResult
    };
    
    return fallbackResult;
  } catch (error) {
    console.error("Error searching YouTube:", error);
    // Get a fallback video taking into account the cuisine if possible
    return getReliableFallbackVideo(cuisine, query);
  }
}

// Updated RELIABLE_VIDEOS with cuisine-specific options
const RELIABLE_VIDEOS = [
  {
    id: "4qKgYCm9Nv4",
    title: "Restaurant Style Chicken Tikka Masala",
    channelName: "Indian Cooking",
    thumbnailUrl: "https://i.ytimg.com/vi/4qKgYCm9Nv4/hqdefault.jpg",
    duration: "12:45",
    views: 350000
  },
  {
    id: "JsimwZYPmTw",
    title: "Essential Cooking Skills Everyone Should Know",
    channelName: "Cooking Basics",
    thumbnailUrl: "https://i.ytimg.com/vi/JsimwZYPmTw/hqdefault.jpg",
    duration: "15:24",
    views: 250000
  },
  {
    id: "VVnZd8A84z4",
    title: "How to Make Perfect Italian Pasta",
    channelName: "Chef Mario",
    thumbnailUrl: "https://i.ytimg.com/vi/VVnZd8A84z4/hqdefault.jpg",
    duration: "10:45",
    views: 150000
  },
  {
    id: "OCunSb81vUA", 
    title: "Simple Recipes for Beginners",
    channelName: "Beginner Cook",
    thumbnailUrl: "https://i.ytimg.com/vi/OCunSb81vUA/hqdefault.jpg",
    duration: "8:30",
    views: 100000
  },
  {
    id: "ZJy1ajvMU1k",
    title: "Professional Cooking Tips and Tricks",
    channelName: "Pro Chef Tips",
    thumbnailUrl: "https://i.ytimg.com/vi/ZJy1ajvMU1k/hqdefault.jpg",
    duration: "20:00",
    views: 300000
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const cuisine = searchParams.get('cuisine') || undefined;
    
    if (!query) {
      return NextResponse.json({ 
        error: "Missing query parameter", 
        video: RELIABLE_VIDEOS[Math.floor(Math.random() * RELIABLE_VIDEOS.length)] 
      }, { status: 400 });
    }
    
    // First, enhance the search query with AI to get better results
    const enhancedQuery = await enhanceSearchQuery(query);
    
    // Then, search YouTube with the enhanced query
    const video = await searchYouTubeWithDetails(enhancedQuery, cuisine);
    
    if (video) {
      return NextResponse.json({ video });
    }
    
    // If search fails, return a reliable fallback video
    const fallbackVideo = getReliableFallbackVideo(cuisine, query);
    return NextResponse.json({ video: fallbackVideo });
  } catch (error) {
    console.error("YouTube search API error:", error);
    // Return a fallback on error
    return NextResponse.json({ 
      video: RELIABLE_VIDEOS[Math.floor(Math.random() * RELIABLE_VIDEOS.length)] 
    });
  }
}
