import { useContext, createEffect, onCleanup } from 'solid-js'

import { pathKey, type KeyType } from '../Cache';
import StyleContext from '../StyleContext';
import useHMR from './useHMR';

export type ExtractStyle<CacheValue> = (
  cache: CacheValue,
  effectStyles: Record<string, boolean>,
  options?: {
    plain?: boolean;
    autoPrefix?: boolean;
  },
) => [order: number, styleId: string, style: string] | null;

const effectMap = new Map<string, boolean>();

export default function useGlobalCache<CacheType>(
  prefix: string,
  keyPath: KeyType[],
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType, fromHMR: boolean) => void,
  // Add additional effect trigger by `useInsertionEffect`
  onCacheEffect?: (cachedValue: CacheType) => void,
): CacheType {
  const { cache: globalCache } = useContext(StyleContext);
  const fullPath = [prefix, ...keyPath];
  const fullPathStr = pathKey(fullPath);

  const HMRUpdate = useHMR();

  type UpdaterArgs = [times: number, cache: CacheType];

  const buildCache = (updater?: (data: UpdaterArgs) => UpdaterArgs) => {
    globalCache.opUpdate(fullPathStr, (prevCache) => {
      const [times = 0, cache] = prevCache || [undefined, undefined];

      // HMR should always ignore cache since developer may change it
      let tmpCache = cache;
      if (process.env.NODE_ENV !== 'production' && cache && HMRUpdate) {
        onCacheRemove?.(tmpCache, HMRUpdate);
        tmpCache = null;
      }

      const mergedCache = tmpCache || cacheFn();

      const data: UpdaterArgs = [times, mergedCache];

      // Call updater if need additional logic
      return updater ? updater(data) : data;
    });
  };

  // Create cache - in Solid, component only runs once, so we build cache immediately
  buildCache();

  let cacheEntity = globalCache.opGet(fullPathStr);

  // HMR clean the cache but not trigger rebuild again
  // Let's fallback of this
  // ref https://github.com/ant-design/cssinjs/issues/127
  if (process.env.NODE_ENV !== 'production' && !cacheEntity) {
    buildCache();
    cacheEntity = globalCache.opGet(fullPathStr);
  }

  // At this point cacheEntity should exist, but add a safety check
  if (!cacheEntity) {
    throw new Error(`Cache entity not found for path: ${fullPathStr}`);
  }

  const cacheContent = cacheEntity[1];

  // Increment reference count and handle cleanup
  // In Solid, createEffect runs after rendering (similar to useEffect)
  // For CSS-in-JS, we need this to run as early as possible
  createEffect(() => {
    // Increment reference count
    buildCache(([times, cache]) => [times + 1, cache]);

    // Trigger cache effect once per unique path
    if (!effectMap.has(fullPathStr)) {
      onCacheEffect?.(cacheContent);
      effectMap.set(fullPathStr, true);

      // 微任务清理缓存，可以认为是单次 batch render 中只触发一次 effect
      Promise.resolve().then(() => {
        effectMap.delete(fullPathStr);
      });
    }

    // Cleanup: decrement reference count when component unmounts
    onCleanup(() => {
      globalCache.opUpdate(fullPathStr, (prevCache) => {
        const [times = 0, cache] = prevCache || [];
        const nextCount = times - 1;

        if (nextCount === 0) {
          onCacheRemove?.(cache, false);
          effectMap.delete(fullPathStr);
          return null;
        }

        return [times - 1, cache];
      });
    });
  });

  return cacheContent;
}