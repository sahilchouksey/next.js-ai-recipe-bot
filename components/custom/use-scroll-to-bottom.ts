import { useState, useRef, useEffect, RefObject } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>, 
  RefObject<HTMLDivElement>,
  boolean,
  () => void
] {
  const containerRef = useRef<T>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // Track if the user has manually scrolled up
  const userHasScrolled = useRef(false);
  
  // Optional function to force scroll to bottom
  const forceScrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "instant", block: "end" });
      setShouldAutoScroll(true);
      userHasScrolled.current = false;
    }
  };
  
  // Handle new messages
  useEffect(() => {
    if (bottomRef.current && shouldAutoScroll) {
      bottomRef.current.scrollIntoView({ behavior: "instant", block: "end" });
    }
  });
  
  // Add scroll event listener to detect manual scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (!container) return;
      
      // Calculate scroll position
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      // Update scroll state only if different from current state
      if (isAtBottom !== shouldAutoScroll) {
        setShouldAutoScroll(isAtBottom);
        userHasScrolled.current = !isAtBottom;
      }
    };
    
    container.addEventListener("scroll", handleScroll);
    
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [shouldAutoScroll]);
  
  return [containerRef, bottomRef, shouldAutoScroll, forceScrollToBottom];
}
