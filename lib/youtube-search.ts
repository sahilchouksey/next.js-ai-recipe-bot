import ytdl from 'ytdl-core';
import youtubeSearchApi from 'youtube-search-api';

// Cache for storing video info to reduce API calls
const videoInfoCache: Record<string, {
  data: any;
  timestamp: number;
}> = {};

// Cache expiration time (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Search for YouTube videos using youtube-search-api
 */
export async function searchYoutube(query: string): Promise<Array<any>> {
  try {
    console.log(`Searching YouTube for: "${query}"`);
    const result = await youtubeSearchApi.GetListByKeyword(query, false, 10, [
      { type: 'video' }
    ]);
    
    if (result && result.items && result.items.length > 0) {
      return result.items;
    }
    return [];
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

/**
 * Get detailed info about a YouTube video using ytdl-core
 */
export async function getVideoInfo(videoId: string): Promise<any> {
  // Check cache first
  if (videoInfoCache[videoId] && 
      (Date.now() - videoInfoCache[videoId].timestamp) < CACHE_DURATION) {
    return videoInfoCache[videoId].data;
  }
  
  try {
    const info = await ytdl.getBasicInfo(videoId);
    
    // Cache the result
    videoInfoCache[videoId] = {
      data: info,
      timestamp: Date.now()
    };
    
    return info;
  } catch (error) {
    console.error(`Error getting video info for ${videoId}:`, error);
    return null;
  }
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds) return "Unknown";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Convert YouTube's ISO 8601 duration format to seconds
 * Example: PT1H30M15S -> 5415 seconds
 */
export function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return 0;
  
  const [_, hours, minutes, seconds] = match;
  
  return (
    (parseInt(hours || '0') * 3600) +
    (parseInt(minutes || '0') * 60) +
    parseInt(seconds || '0')
  );
}
