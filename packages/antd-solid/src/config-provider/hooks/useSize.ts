import { useContext, createMemo } from 'solid-js';

import type { SizeType } from '../SizeContext';
import SizeContext from '../SizeContext';

const useSize = <T extends string | undefined | number | object>(
  customSize?: T | ((ctxSize: SizeType) => T),
): T => {
  const size = useContext<SizeType>(SizeContext);
  const mergedSize = createMemo<T>(() => {
    if (!customSize) {
      return size as T;
    }
    if (typeof customSize === 'string') {
      return customSize ?? size;
    }
    if (typeof customSize === 'function') {
      return customSize(size);
    }
    return size as T;
  });
  return mergedSize();
};

export default useSize;
