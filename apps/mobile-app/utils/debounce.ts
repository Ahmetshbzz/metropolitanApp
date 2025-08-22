//  "debounce.ts"
//  metropolitan app
//  Created by Ahmet on 09.08.2025.
//  Debounce utility for optimizing performance

/**
 * Creates a debounced function that delays invoking the provided function 
 * until after the specified wait time has elapsed since the last time it was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Creates a debounced function that also returns a cleanup function
 * to manually cancel the debounced invocation.
 */
export function debounceWithCleanup<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  debouncedFunc: (...args: Parameters<T>) => void;
  cleanup: () => void;
} {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debouncedFunc = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
  
  const cleanup = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return { debouncedFunc, cleanup };
}

/**
 * Creates a throttled function that only invokes the provided function 
 * at most once per every `wait` milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCallTime: number = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallTime >= wait) {
      lastCallTime = now;
      func(...args);
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        func(...args);
        timeoutId = null;
      }, wait - (now - lastCallTime));
    }
  };
}