// Re-export all utilities
export * from './editor'
export * from './formations'
export * from './history'

// Add any common utility functions here
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (e) {
    return fallback
  }
}

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => func(...args), waitFor)
  }
} 