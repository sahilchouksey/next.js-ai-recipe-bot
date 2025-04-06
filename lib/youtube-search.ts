import youtubeSearchApi from 'youtube-search-api';
import ytdl from 'ytdl-core';
import { YOUTUBE_COOKIE, getYouTubeRequestHeaders } from './youtube-config';

// Cache for storing video info to reduce API calls
const videoInfoCache: Record<string, {
  data: any;
  timestamp: number;
}> = {};

// Cache expiration time (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

// Get YouTube cookie from environment variable
// const YOUTUBE_COOKIE = process.env.YOUTUBE_COOKIE || '';

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
 * Search for YouTube videos using YouTube's internal API directly
 * This is more reliable than third-party packages in deployed environments
 */
export async function searchYoutubeDirectAPI(query: string): Promise<Array<any>> {
  try {
    console.log(`Searching YouTube Direct API for: "${query}"`);
    
    const url = 'https://www.youtube.com/youtubei/v1/search?prettyPrint=false';
    
    // Use the cookie from environment variables
    const headers = {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'cookie': YOUTUBE_COOKIE,
      'origin': 'https://www.youtube.com',
      'referer': `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      'x-youtube-client-name': '1',
      'x-youtube-client-version': '2.20250403.01.00'
    };
    
    // Basic payload structure required by YouTube API
    const payload = {
      context: {
        client: {
          hl: "en",
          gl: "US",
          clientName: "WEB",
          clientVersion: "2.20250403.01.00"
        }
      },
      query: query
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract video results from the response
    const videoResults = extractVideoResults(data);
    
    console.log(`Found ${videoResults.length} videos via direct API`);
    return videoResults;
  } catch (error) {
    console.error('Error searching YouTube Direct API:', error);
    return [];
  }
}

/**
 * Extract video results from the YouTube API response
 */
function extractVideoResults(data: any): Array<any> {
  const results: Array<any> = [];
  
  try {
    // Navigate through YouTube's response structure to find video content
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    
    // Find the item list renderer containing search results
    let itemSectionRenderer = null;
    for (const content of contents) {
      if (content?.itemSectionRenderer) {
        itemSectionRenderer = content.itemSectionRenderer;
        break;
      }
    }
    
    if (itemSectionRenderer && itemSectionRenderer.contents) {
      // Process each video result
      for (const item of itemSectionRenderer.contents) {
        // Check if this is a video renderer
        const videoRenderer = item?.videoRenderer;
        if (!videoRenderer) continue;
        
        // Extract essential video information
        const videoId = videoRenderer.videoId;
        const title = videoRenderer?.title?.runs?.[0]?.text || '';
        const channelTitle = videoRenderer?.ownerText?.runs?.[0]?.text || '';
        const channelId = videoRenderer?.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || '';
        
        // Extract thumbnail
        const thumbnails = videoRenderer?.thumbnail?.thumbnails || [];
        const thumbnail = { thumbnails };
        
        // Extract video length
        const lengthText = videoRenderer?.lengthText?.simpleText || '';
        const lengthSeconds = lengthTextToSeconds(lengthText);
        const length = { text: lengthText, seconds: lengthSeconds };
        
        // Extract view count
        const viewCountText = videoRenderer?.viewCountText?.simpleText || '';
        let viewCount = 0;
        if (viewCountText) {
          const viewMatch = viewCountText.match(/[\d,]+/);
          if (viewMatch) {
            viewCount = parseInt(viewMatch[0].replace(/,/g, ''));
          }
        }
        
        // Format result similar to youtube-search-api output for compatibility
        results.push({
          id: videoId,
          title,
          type: 'video',
          thumbnail,
          channelTitle,
          channelId,
          length,
          // @ts-ignore
          isLive: !!videoRenderer.badges?.find(badge => badge?.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW"),
          viewCount
        });
      }
    }
  } catch (err) {
    console.error('Error extracting video results:', err);
  }
  
  return results;
}

/**
 * Convert YouTube length text (like "10:30") to seconds
 */
function lengthTextToSeconds(lengthText: string): number {
  if (!lengthText) return 0;
  
  const parts = lengthText.split(':').map(Number);
  
  if (parts.length === 3) { // hours:minutes:seconds
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) { // minutes:seconds
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) { // seconds
    return parts[0];
  }
  
  return 0;
}

/**
 * Get detailed info about a YouTube video using ytdl-core with cookie support
 */
export async function getVideoInfo(videoId: string): Promise<any> {
  // Check cache first
  if (videoInfoCache[videoId] && 
      (Date.now() - videoInfoCache[videoId].timestamp) < CACHE_DURATION) {
    return videoInfoCache[videoId].data;
  }
  
  try {
    // Set up request options with cookie for authentication
    const requestOptions: ytdl.getInfoOptions = {
      requestOptions: {
        headers: {
          // Add the cookie for authentication
          'Cookie': YOUTUBE_COOKIE
        }
      }
    };

    // Set a timeout to prevent hanging requests
    const timeout = 8000; // 8 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), timeout);
    });
    
    // Create the ytdl info request with our options
    const infoPromise = ytdl.getBasicInfo(videoId, requestOptions);
    
    // Race between the actual request and the timeout
    const info = await Promise.race([infoPromise, timeoutPromise]) as ytdl.videoInfo;
    
    // Cache the result
    videoInfoCache[videoId] = {
      data: info,
      timestamp: Date.now()
    };
    
    return info;
  } catch (error) {
    console.error(`Error getting video info for ${videoId}:`, error);
    // Return null to signal that a fallback should be used
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
