import { NextResponse } from "next/server";

import { getVideoInfo } from "@/lib/youtube-search";

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
    
    // Try to validate with ytdl-core using our updated function with cookie support
    try {
      const videoInfo = await getVideoInfo(videoId);
      
      if (videoInfo && videoInfo.videoDetails) {
        return NextResponse.json({ valid: true });
      }
    } catch (ytdlError) {
      console.error("ytdl-core validation failed:", ytdlError);
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
