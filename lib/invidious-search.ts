import { load } from 'cheerio';

// Type definitions for Invidious instances
interface InvidiousInstance {
  flag: string;
  region: string;
  stats?: {
    version: string;
    software: {
      name: string;
      version: string;
      branch: string;
    };
    openRegistrations: boolean;
    usage?: {
      users?: {
        total: number;
        activeHalfyear: number;
        activeMonth: number;
      };
    };
    playback?: any;
  };
  cors?: boolean;
  api?: boolean;
  type: string;
  uri: string;
  monitor?: {
    uptime: number;
    down: boolean;
    up_since?: string;
  };
}

interface InvidiousInstanceEntry extends Array<any> {
  0: string; // hostname
  1: InvidiousInstance;
}

// Type for video search results
interface VideoResult {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  thumbnailUrl: string;
  duration: string;
  durationSeconds: number;
  viewCount: number;
  publishedTimeText: string;
}

// Cache the list of instances to avoid repeated fetch calls
let instancesCache: InvidiousInstanceEntry[] | null = null;
let lastInstanceFetch: number = 0;
const INSTANCE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Cache the selected best instance to use consistently
let selectedInstance: string | null = null;

// Cache for search results
const searchCache: Record<string, {
  timestamp: number,
  results: VideoResult[]
}> = {};
const SEARCH_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Convert duration text (e.g., "8:09") to seconds
 */
function durationToSeconds(duration: string): number {
  if (!duration) return 0;
  
  const parts = duration.split(':').map(Number);
  
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
 * Parse view count text (e.g., "763K views") to number
 */
function parseViewCount(viewText: string): number {
  if (!viewText || !viewText.includes('view')) return 0;
  
  const numStr = viewText.replace(/[^\d.KMB]/g, '');
  const num = parseFloat(numStr);
  
  if (isNaN(num)) return 0;
  
  if (viewText.includes('K')) {
    return Math.round(num * 1000);
  } else if (viewText.includes('M')) {
    return Math.round(num * 1000000);
  } else if (viewText.includes('B')) {
    return Math.round(num * 1000000000);
  }
  
  return Math.round(num);
}

/**
 * Get the list of available Invidious instances
 */
async function getInvidiousInstances(): Promise<InvidiousInstanceEntry[]> {
  // Use cache if available and recent
  if (instancesCache && (Date.now() - lastInstanceFetch) < INSTANCE_CACHE_DURATION) {
    return instancesCache;
  }
  
  try {
    const response = await fetch('https://api.invidious.io/instances.json?pretty=1&sort_by=type,users');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Invidious instances: ${response.status}`);
    }
    
    const instances = await response.json() as InvidiousInstanceEntry[];
    
    // Update cache
    instancesCache = instances;
    lastInstanceFetch = Date.now();
    
    return instances;
  } catch (error) {
    console.error('Error fetching Invidious instances:', error);
    
    // If we have cached instances, return them even if expired
    if (instancesCache) {
      return instancesCache;
    }
    
    // Hard-coded fallback instances
    return [
      [
        "inv.nadeko.net", 
        {
          flag: "🇨🇱",
          region: "CL",
          type: "https",
          uri: "https://inv.nadeko.net",
          monitor: { uptime: 98, down: false, up_since: "2025-04-06T00:44:19Z" }
        }
      ],
      [
        "yewtu.be",
        {
          flag: "🇩🇪",
          region: "DE",
          type: "https",
          uri: "https://yewtu.be",
          monitor: { uptime: 99, down: false, up_since: "2025-04-02T23:18:07Z" }
        }
      ]
    ];
  }
}

/**
 * Select the best Invidious instance to use
 * Prioritizes HTTPS instances with high uptime
 */
async function selectBestInstance(): Promise<string> {
  // Return cached instance if available
  if (selectedInstance) {
    return selectedInstance;
  }
  
  const instances = await getInvidiousInstances();
  
  // Filter to only include HTTPS instances and sort by uptime
  const validInstances = instances
    .filter(([, info]) => (
      info.type === 'https' && 
      info.monitor && 
      !info.monitor.down && 
      info.monitor.uptime > 90
    ))
    .sort((a, b) => (b[1].monitor?.uptime || 0) - (a[1].monitor?.uptime || 0));
  
  if (validInstances.length === 0) {
    // Fallback to a known instance
    selectedInstance = 'inv.nadeko.net';
  } else {
    selectedInstance = validInstances[0][0];
  }
  
  return selectedInstance;
}

/**
 * Search for videos using Invidious
 */
export async function searchInvidious(query: string): Promise<VideoResult[]> {
  try {
    // Check cache first
    const cacheKey = query.toLowerCase();
    if (searchCache[cacheKey] && 
        (Date.now() - searchCache[cacheKey].timestamp) < SEARCH_CACHE_DURATION) {
      console.log("Using cached Invidious search results");
      return searchCache[cacheKey].results;
    }
    
    const instance = await selectBestInstance();
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://${instance}/search?q=${encodedQuery}`;
    
    console.log(`Searching Invidious (${instance}) for: "${query}"`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Invidious search failed: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse HTML using Cheerio
    const $ = load(html);
    const videos: VideoResult[] = [];
    
    // Extract videos from search results page
    $('.pure-u-1.pure-u-md-1-4').each((_, element) => {
      try {
        const videoElement = $(element);
        
        // Extract video ID from href attribute
        const videoLink = videoElement.find('.thumbnail a').attr('href');
        const videoId = videoLink?.match(/watch\?v=([^&]+)/)?.[1] || '';
        
        if (!videoId) return;
        
        // Extract title
        const title = videoElement.find('.video-card-row a p').first().text().trim();
        
        // Extract channel name
        const channelName = videoElement.find('.channel-name').text().trim();
        
        // Extract channel ID
        const channelLink = videoElement.find('.channel-name').parent().attr('href');
        const channelId = channelLink?.match(/channel\/([^/]+)/)?.[1] || '';
        
        // Extract duration
        const durationText = videoElement.find('.bottom-right-overlay .length').text().trim();
        const durationSeconds = durationToSeconds(durationText);
        
        // Extract view count
        const viewCountText = videoElement.find('.flex-right .video-data').text().trim();
        const viewCount = parseViewCount(viewCountText);
        
        // Extract published time
        const publishedTimeText = videoElement.find('.flex-left .video-data').text().trim();
        
        // Create thumbnail URL
        const thumbnailUrl = `https://${instance}/vi/${videoId}/mqdefault.jpg`;
        
        videos.push({
          id: videoId,
          title,
          channelName,
          channelId,
          thumbnailUrl,
          duration: durationText,
          durationSeconds,
          viewCount,
          publishedTimeText
        });
      } catch (err) {
        // Skip errors in individual videos
        console.error('Error parsing video element:', err);
      }
    });
    
    console.log(`Found ${videos.length} videos via Invidious`);
    
    // Cache the results
    searchCache[cacheKey] = {
      timestamp: Date.now(),
      results: videos
    };
    
    return videos;
  } catch (error) {
    console.error('Error searching Invidious:', error);
    return [];
  }
}

/**
 * Get video details from Invidious
 */
export async function getVideoDetailsInvidious(videoId: string): Promise<any> {
  try {
    if (!videoId) {
      throw new Error('Invalid video ID');
    }
    
    const instance = await selectBestInstance();
    const apiUrl = `https://${instance}/api/v1/videos/${videoId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video details: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the response to match our expected structure
    return {
      videoDetails: {
        videoId: data.videoId,
        title: data.title,
        author: {
          name: data.author,
          id: data.authorId
        },
        thumbnails: [
          { url: `https://${instance}/vi/${videoId}/maxres.jpg` }
        ],
        lengthSeconds: data.lengthSeconds.toString(),
        viewCount: data.viewCount.toString()
      }
    };
  } catch (error) {
    console.error(`Error getting Invidious video details for ${videoId}:`, error);
    // Return a basic fallback with minimal information
    return {
      videoDetails: {
        videoId,
        title: "YouTube Video",
        thumbnails: [{ url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }]
      }
    };
  }
}
