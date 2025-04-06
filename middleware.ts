import NextAuth from "next-auth";

import { authConfig } from "@/app/(auth)/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/", "/:id", "/api/:path*", "/login", "/register"],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of valid image hosts we trust
const VALID_IMAGE_HOSTS = [
  'source.unsplash.com',
  'images.unsplash.com',
  'images.pexels.com',
  'via.placeholder.com',
  'img.youtube.com',
  'i.ytimg.com',
  'i.imgur.com',
  'upload.wikimedia.org',
  'spoonacular.com',
  'img.spoonacular.com', // Add Spoonacular image domain
  'example.com',  // For testing
  'placehold.co',
  'placekitten.com'
];

export function middleware(request: NextRequest) {
  // Fix API URL issues
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Ensure proper handling of API routes
    // For /api/search-youtube and /api/ingredient-image
    if (
      request.nextUrl.pathname.startsWith('/api/search-youtube') || 
      request.nextUrl.pathname.startsWith('/api/ingredient-image') ||
      request.nextUrl.pathname.startsWith('/api/dish-image')  // Add dish-image API
    ) {
      // Allow these API routes to proceed normally
      return NextResponse.next();
    }
  }
  
  // Only check image requests
  if (request.nextUrl.pathname.startsWith('/_next/image')) {
    const imageUrl = request.nextUrl.searchParams.get('url');
    if (!imageUrl) return NextResponse.next();
    
    try {
      const url = new URL(imageUrl);
      // Check if the image is from a trusted source
      if (!VALID_IMAGE_HOSTS.some(host => url.hostname.includes(host))) {
        console.warn(`Untrusted image source blocked: ${url.hostname}`);
        // Redirect to a placeholder image instead
        const fallbackUrl = new URL(request.url);
        fallbackUrl.searchParams.set('url', encodeURIComponent('https://via.placeholder.com/800x500?text=Recipe+Image'));
        return NextResponse.rewrite(fallbackUrl);
      }
    } catch (error) {
      // If URL parsing fails, also use placeholder
      const fallbackUrl = new URL(request.url);
      fallbackUrl.searchParams.set('url', encodeURIComponent('https://via.placeholder.com/800x500?text=Error'));
      return NextResponse.rewrite(fallbackUrl);
    }
  }

  return NextResponse.next();
}
