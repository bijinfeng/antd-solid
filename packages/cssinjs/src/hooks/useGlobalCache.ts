import type Entity from "../Cache";

/**
 * Global cache for sharing styles across different StyleProvider instances
 */
const globalCacheMap = new Map<string, Entity>();

export interface UseGlobalCacheOptions {
	/**
	 * Cache key for global cache
	 */
	key: string;
	/**
	 * Cache instance factory
	 */
	createCache: () => Entity;
}

/**
 * Hook to get or create a global cache instance
 * Useful for sharing styles across multiple apps or micro-frontends
 */
export default function useGlobalCache(options: UseGlobalCacheOptions): Entity {
	const { key, createCache } = options;

	if (!globalCacheMap.has(key)) {
		globalCacheMap.set(key, createCache());
	}

	return globalCacheMap.get(key)!;
}

/**
 * Clear global cache by key
 */
export function clearGlobalCache(key?: string): void {
	if (key) {
		const cache = globalCacheMap.get(key);
		if (cache) {
			cache.clear();
			globalCacheMap.delete(key);
		}
	} else {
		globalCacheMap.forEach((cache) => cache.clear());
		globalCacheMap.clear();
	}
}

/**
 * Get all global cache keys
 */
export function getGlobalCacheKeys(): string[] {
	return Array.from(globalCacheMap.keys());
}
