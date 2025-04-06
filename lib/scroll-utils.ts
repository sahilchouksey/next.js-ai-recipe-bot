/**
 * Utility functions to help with scroll management
 */

// Store the last known scroll positions by element ID
const scrollPositions: Record<string, number> = {};

/**
 * Save the current scroll position of an element
 */
export function saveScrollPosition(elementId: string, element: HTMLElement): void {
  scrollPositions[elementId] = element.scrollTop;
}

/**
 * Restore a previously saved scroll position
 */
export function restoreScrollPosition(elementId: string, element: HTMLElement): void {
  const savedPosition = scrollPositions[elementId];
  if (savedPosition !== undefined) {
    // Use requestAnimationFrame to ensure the scroll happens after any layout updates
    requestAnimationFrame(() => {
      element.scrollTop = savedPosition;
    });
  }
}

/**
 * Determine if user is near the bottom of the scroll container
 */
export function isNearBottom(element: HTMLElement, threshold = 100): boolean {
  return element.scrollHeight - element.scrollTop <= element.clientHeight + threshold;
}
