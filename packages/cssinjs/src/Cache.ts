export type KeyType = string | number;

class Entity {
	instanceId: string;
	cache: Map<string, any>;

	constructor(instanceId: string) {
		this.instanceId = instanceId;
		this.cache = new Map();
	}

	get(keys: KeyType[]): any {
		return this.cache.get(keys.join("%"));
	}

	update(keys: KeyType[], valueFn: (origin: any) => any): void {
		const path = keys.join("%");
		const prevValue = this.cache.get(path);
		const nextValue = valueFn(prevValue);
		this.cache.set(path, nextValue);
	}

	/**
	 * Clear all cache
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Delete specific cache entry
	 */
	delete(keys: KeyType[]): boolean {
		return this.cache.delete(keys.join("%"));
	}

	/**
	 * Check if cache has specific entry
	 */
	has(keys: KeyType[]): boolean {
		return this.cache.has(keys.join("%"));
	}

	/**
	 * Get cache size
	 */
	get size(): number {
		return this.cache.size;
	}
}

/**
 * Create a new cache instance
 * @param instanceId - Unique identifier for the cache instance
 */
export function createCache(instanceId?: string): Entity {
	const id =
		instanceId ||
		`cssinjs-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	return new Entity(id);
}

export default createCache;
