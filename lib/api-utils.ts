/**
 * Utility functions for API calls that work in both client and server environments
 */

// Get the base URL for API calls that works in both environments
export function getBaseUrl(): string {
  // For server-side rendering or API routes
  if (typeof window === 'undefined') {
    // When running in a Vercel environment, use VERCEL_URL
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // For local development server
    return 'http://localhost:3000';
  }
  
  // Client side - use the window location
  return window.location.origin;
}

/**
 * Create an absolute URL from a relative path that works in both client and server
 */
export function createApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${getBaseUrl()}/${cleanPath}`;
}
