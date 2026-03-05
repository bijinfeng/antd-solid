import type { CSSObject } from '@antd-solidjs/cssinjs';

export const genNoMotionStyle = (): CSSObject => {
  return {
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      animation: 'none',
    },
  };
};
