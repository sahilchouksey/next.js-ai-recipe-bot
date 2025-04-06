import Image from "next/image";
import { Play } from "lucide-react";

const SAMPLE = {
  title: "How to Make Classic Spaghetti Carbonara",
  channelName: "Italian Cuisine Master",
  videoId: "dQw4w9WgXcQ", // Example YouTube ID
  thumbnailUrl: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800",
  duration: "10:25"
};

export function RecipeVideo({ videoInfo = SAMPLE }) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <h3 className="font-medium mb-2">Recipe Video</h3>
      <div className="flex flex-col gap-2">
        <a 
          href={`https://www.youtube.com/watch?v=${videoInfo.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block group"
        >
          <div className="relative aspect-video overflow-hidden rounded-md">
            <Image 
              src={videoInfo.thumbnailUrl} 
              alt={videoInfo.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 600px"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/75 rounded-full p-3 group-hover:bg-primary transition-colors">
                <Play className="h-6 w-6 text-white" fill="white" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
              {videoInfo.duration}
            </div>
          </div>
          <div className="mt-1">
            <p className="font-medium group-hover:text-primary transition-colors">{videoInfo.title}</p>
            <p className="text-sm text-muted-foreground">{videoInfo.channelName}</p>
          </div>
        </a>
      </div>
    </div>
  );
}
