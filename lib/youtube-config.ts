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
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.youtube.com'
});

// Verify the YouTube cookie is set
export function isYouTubeCookieConfigured(): boolean {
  return YOUTUBE_COOKIE !== '' && YOUTUBE_COOKIE.includes('SID=');
}
