
import { NextResponse } from "next/server";

import { getYouTubeRequestHeaders } from "@/lib/youtube-config";

// YouTube valid video IDs we know work
const KNOWN_VALID_VIDEOS = [
  "JsimwZYPmTw", // Cooking basics
  "VVnZd8A84z4", // Recipe tutorial
  "OCunSb81vUA", // Simple recipes
  "ZJy1ajvMU1k"  // Cooking tips
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  
  if (!videoId) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  
  try {
    // First check if it's one of our known valid IDs
    if (KNOWN_VALID_VIDEOS.includes(videoId)) {
      return NextResponse.json({ valid: true });
    }
    
    // Basic validation check - YouTube IDs are 11 characters
    const isValidFormat = /^[a-zA-Z0-9_-]{11}$/.test(videoId);
    if (!isValidFormat) {
      return NextResponse.json({ 
        valid: false,
        fallbackId: KNOWN_VALID_VIDEOS[Math.floor(Math.random() * KNOWN_VALID_VIDEOS.length)]
      });
    }
    
    // Try to validate with oEmbed API endpoint (lighter than ytdl-core)
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { 
          headers: getYouTubeRequestHeaders(),
          method: 'HEAD' // Only need headers, not the full response
        }
      );
      
      if (response.ok) {
        return NextResponse.json({ valid: true });
      }
    } catch (apiError) {
      console.error("YouTube validation API error:", apiError);
      // Continue to fallback
    }
    
    // If validation fails or errors, return a random known valid ID
    const fallbackId = KNOWN_VALID_VIDEOS[Math.floor(Math.random() * KNOWN_VALID_VIDEOS.length)];
    return NextResponse.json({ valid: false, fallbackId });
  } catch (error) {
    console.error("YouTube validation error:", error);
    return NextResponse.json({ 
      valid: false,
      fallbackId: KNOWN_VALID_VIDEOS[0]
    });
  }
}
