/**
 * YouTube configuration settings
 */

// YouTube cookie from environment variables
export const YOUTUBE_COOKIE = process.env.YOUTUBE_COOKIE || '';

// YouTube API key (if needed)
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// Request timeout settings
export const YOUTUBE_REQUEST_TIMEOUT = 8000; // 8 seconds

// YouTube request headers with cookie
export const getYouTubeRequestHeaders = () => ({
  'Cookie': YOUTUBE_COOKIE,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Content-Type': 'application/json',
  'Origin': 'https://www.youtube.com',
  'Referer': 'https://www.youtube.com/',
  'x-youtube-client-name': '1',
  'x-youtube-client-version': '2.20250403.01.00'
});

// YouTube identity values extracted from the cookie (if present)
export const getYouTubeIdentity = () => {
  try {
    // Default values
    const identity = {
      visitorData: "",
      SID: "",
      HSID: "",
      SSID: "",
      APISID: "",
      SAPISID: ""
    };
    
    // Parse cookie if available
    if (YOUTUBE_COOKIE) {
      const cookieParts = YOUTUBE_COOKIE.split('; ');
      cookieParts.forEach(part => {
        const [key, value] = part.split('=');
        if (key === 'VISITOR_INFO1_LIVE' || 
            key === 'SID' || 
            key === 'HSID' || 
            key === 'SSID' || 
            key === 'APISID' || 
            key === 'SAPISID') {
          // @ts-ignore
          identity[key] = value;
        }
      });
    }
    
    return identity;
  } catch (error) {
    console.error('Error parsing YouTube identity from cookie:', error);
    return {};
  }
};

// Verify the YouTube cookie is set
export function isYouTubeCookieConfigured(): boolean {
  return YOUTUBE_COOKIE !== '' && YOUTUBE_COOKIE.includes('SID=');
}

// Check for minimal authentication needed (just visitor info is enough for search, full login needed for some operations)
export function hasBasicYouTubeAuth(): boolean {
  return YOUTUBE_COOKIE !== '' && 
    (YOUTUBE_COOKIE.includes('VISITOR_INFO1_LIVE=') || YOUTUBE_COOKIE.includes('SID='));
}
