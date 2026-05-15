/**
 * In-memory caching layer for performance optimization
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      defaultTTL: this.defaultTTL,
    };
  }
}

/**
 * Embeddings cache
 * Stores generated embeddings to avoid recomputation
 */
export const embeddingsCache = new Cache<number[]>(60 * 60 * 1000); // 1 hour TTL

/**
 * Search results cache
 * Stores search results for frequent queries
 */
export const searchCache = new Cache<any>(5 * 60 * 1000); // 5 minutes TTL

/**
 * File content cache
 * Stores file contents to avoid repeated file reads
 */
export const fileCache = new Cache<string>(10 * 60 * 1000); // 10 minutes TTL

/**
 * Repository metadata cache
 * Stores repository information
 */
export const repoCache = new Cache<any>(30 * 60 * 1000); // 30 minutes TTL

/**
 * Generate cache key for embeddings
 */
export function getEmbeddingCacheKey(text: string, provider: string): string {
  // Use first 100 chars + length as key (simple hash alternative)
  const preview = text.substring(0, 100);
  return `emb:${provider}:${preview}:${text.length}`;
}

/**
 * Generate cache key for search
 */
export function getSearchCacheKey(
  projectId: string,
  query: string,
  filters?: any
): string {
  const filterStr = filters ? JSON.stringify(filters) : '';
  return `search:${projectId}:${query}:${filterStr}`;
}

/**
 * Generate cache key for file content
 */
export function getFileCacheKey(projectId: string, filePath: string): string {
  return `file:${projectId}:${filePath}`;
}

/**
 * Invalidate cache for a specific repository
 */
export function invalidateRepositoryCache(repositoryId: string): void {
  // Clear search cache for this repository
  const searchKeys = Array.from((searchCache as any).cache.keys()).filter(
    (key: string) => key.startsWith(`search:${repositoryId}:`)
  );
  searchKeys.forEach(key => searchCache.delete(key));

  // Clear file cache for this repository
  const fileKeys = Array.from((fileCache as any).cache.keys()).filter(
    (key: string) => key.startsWith(`file:${repositoryId}:`)
  );
  fileKeys.forEach(key => fileCache.delete(key));

  // Clear repo cache
  repoCache.delete(`repo:${repositoryId}`);

  console.log(`Invalidated cache for repository: ${repositoryId}`);
}

/**
 * Get all cache statistics
 */
export function getAllCacheStats() {
  return {
    embeddings: embeddingsCache.getStats(),
    search: searchCache.getStats(),
    file: fileCache.getStats(),
    repo: repoCache.getStats(),
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  embeddingsCache.clear();
  searchCache.clear();
  fileCache.clear();
  repoCache.clear();
  console.log('All caches cleared');
}
