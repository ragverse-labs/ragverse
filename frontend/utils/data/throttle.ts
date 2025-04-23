// throttle.ts

/**
 * Throttles a function so that it's only called at most once every `delay` milliseconds.
 * 
 * @param func The function to throttle.
 * @param delay The number of milliseconds to wait before allowing another call.
 * @returns A throttled version of the input function.
 */
export function throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
  
    return function (...args: Parameters<T>) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }
  