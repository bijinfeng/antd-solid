import { warning } from '@antd-solidjs/util';
import { createEffect, onCleanup } from 'solid-js';

// DO NOT register functions in onCleanup function, or functions that registered will never be called.
const useEffectCleanupRegister = (deps?: () => unknown) => {
  const effectCleanups: (() => void)[] = [];
  let cleanupFlag = false;

  function register(fn: () => void) {
    if (cleanupFlag) {
      if (process.env.NODE_ENV !== 'production') {
        warning(
          false,
          '[Ant Design CSS-in-JS] You are registering a cleanup function after unmount, which will not have any effect.',
        );
      }
      return;
    }
    effectCleanups.push(fn);
  }

  createEffect(() => {
    // Track dependencies if provided
    deps?.();

    // Compatible with strict mode
    cleanupFlag = false;

    onCleanup(() => {
      cleanupFlag = true;
      if (effectCleanups.length) {
        effectCleanups.forEach((fn) => { fn() });
      }
    });
  });

  return register;
};

export default useEffectCleanupRegister;