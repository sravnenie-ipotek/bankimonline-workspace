/**
 * Memory-efficient cache implementation with automatic cleanup
 * Prevents memory leaks by proactively removing expired entries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
  accessCount?: number;
  lastAccessed?: number;
}

interface CacheOptions {
  ttl?: number;              // Time to live in milliseconds
  maxSize?: number;           // Maximum number of entries
  cleanupInterval?: number;   // How often to run cleanup (ms)
  onEvict?: (key: string, value: any) => void; // Callback when entry is evicted
}

export class MemoryEfficientCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly cleanupInterval: number;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private readonly onEvict?: (key: string, value: any) => void;
  
  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // Default: 5 minutes
    this.maxSize = options.maxSize || 100;   // Default: 100 entries
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // Default: 1 minute
    this.onEvict = options.onEvict;
    
    // Start automatic cleanup
    this.startCleanupTimer();
    
    // Cleanup on browser tab close/refresh
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.destroy());
    }
  }
  
  /**
   * Set a value in the cache
   */
  set(key: string, data: T): void {
    const now = Date.now();
    
    // Check if we need to evict entries due to size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLeastRecentlyUsed();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expires: now + this.ttl,
      accessCount: 0,
      lastAccessed: now
    };
    
    this.cache.set(key, entry);
  }
  
  /**
   * Get a value from the cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    
    // Check if expired
    if (now > entry.expires) {
      this.delete(key);
      return null;
    }
    
    // Update access statistics
    entry.accessCount = (entry.accessCount || 0) + 1;
    entry.lastAccessed = now;
    
    return entry.data;
  }
  
  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expires) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Delete a specific entry
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry && this.onEvict) {
      this.onEvict(key, entry.data);
    }
    return this.cache.delete(key);
  }
  
  /**
   * Clear all entries
   */
  clear(): void {
    if (this.onEvict) {
      this.cache.forEach((entry, key) => {
        this.onEvict!(key, entry.data);
      });
    }
    this.cache.clear();
  }
  
  /**
   * Get the current size of the cache
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    let totalHits = 0;
    let totalAccess = 0;
    let memoryUsage = 0;
    
    this.cache.forEach((entry) => {
      totalAccess++;
      totalHits += entry.accessCount || 0;
      // Rough estimate of memory usage
      memoryUsage += JSON.stringify(entry.data).length;
    });
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalAccess > 0 ? totalHits / totalAccess : 0,
      memoryUsage
    };
  }
  
  /**
   * Start the automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
    
    // Don't block the event loop in Node.js environments
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expires) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.delete(key));
    
    // Log cleanup statistics in development
    if (process.env.NODE_ENV === 'development' && keysToDelete.length > 0) {
      console.debug(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }
  
  /**
   * Evict the least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let lruKey: string | null = null;
    let lruTime = Date.now();
    
    this.cache.forEach((entry, key) => {
      const lastAccessed = entry.lastAccessed || entry.timestamp;
      if (lastAccessed < lruTime) {
        lruTime = lastAccessed;
        lruKey = key;
      }
    });
    
    if (lruKey) {
      this.delete(lruKey);
      
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Cache eviction: removed LRU entry with key "${lruKey}"`);
      }
    }
  }
  
  /**
   * Destroy the cache and clean up resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

/**
 * Create a singleton cache instance for dropdown data
 */
export const createDropdownCache = () => {
  return new MemoryEfficientCache({
    ttl: 5 * 60 * 1000,        // 5 minutes
    maxSize: 50,                // Maximum 50 dropdown entries
    cleanupInterval: 60 * 1000, // Cleanup every minute
    onEvict: (key, value) => {
      // Optional: Log evictions in development
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Dropdown cache evicted: ${key}`);
      }
    }
  });
};