/**
 * Timeout handling utility - Wraps async operations with configurable timeout
 * Prevents operations from hanging indefinitely
 */

export interface TimeoutOptions {
  duration?: number; // milliseconds (default: 30000)
  onTimeout?: () => void;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Wrap async operation with timeout
 * Throws error if operation exceeds timeout duration
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  options?: TimeoutOptions
): Promise<T> {
  const { duration = DEFAULT_TIMEOUT, onTimeout } = options || {};

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        onTimeout?.();
        reject(new Error(`İstek zaman aşımına uğradı (${duration}ms)`));
      }, duration);
    }),
  ]);
}

/**
 * Wrap function that returns a promise with timeout
 */
export function createTimeoutWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: TimeoutOptions
): (...args: Parameters<T>) => Promise<any> {
  return async (...args: Parameters<T>) => {
    return withTimeout(fn(...args), options);
  };
}
