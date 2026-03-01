# @antd-solidjs/cssinjs

Component level CSS-in-JS solution for antd-solid, ported from [@ant-design/cssinjs](https://github.com/ant-design/cssinjs).

## Features

- 🎨 **Component-level styles** - Scoped styles with automatic hash generation
- 🚀 **Performance optimized** - Built-in cache system for style reuse
- 🎯 **Type-safe** - Full TypeScript support
- 🔧 **Transformers** - Built-in px2rem and other CSS transformers
- ✅ **Linters** - CSS rule validation and best practice warnings
- 🌐 **SSR support** - Server-side rendering with style extraction
- 🎭 **Theme system** - Powerful token-based theming
- ⚡ **SolidJS native** - Built specifically for SolidJS reactivity

## Installation

```bash
npm install @antd-solidjs/cssinjs
# or
pnpm add @antd-solidjs/cssinjs
# or
yarn add @antd-solidjs/cssinjs
```

## Basic Usage

```tsx
import { StyleProvider, useStyleRegister, createCache } from '@antd-solidjs/cssinjs';

// Create a cache instance
const cache = createCache();

function App() {
  return (
    <StyleProvider cache={cache}>
      <MyComponent />
    </StyleProvider>
  );
}

function MyComponent() {
  const hashId = useStyleRegister(
    {
      token: { primaryColor: '#1890ff' },
      path: ['MyComponent'],
    },
    () => ({
      backgroundColor: '#1890ff',
      color: '#fff',
      padding: '16px',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: '#40a9ff',
      },
    })
  );

  return <div class={hashId}>Hello World</div>;
}
```

## Advanced Usage

### With Theme System

```tsx
import { createTheme, useCacheToken, StyleProvider } from '@antd-solidjs/cssinjs';

// Define your design tokens
interface DesignToken {
  primaryColor: string;
  fontSize: number;
}

interface DerivativeToken extends DesignToken {
  primaryColorHover: string;
  lineHeight: number;
}

// Create derivative function
const derivative = (token: DesignToken): DerivativeToken => ({
  ...token,
  primaryColorHover: lighten(token.primaryColor, 0.2),
  lineHeight: token.fontSize * 1.5,
});

// Create theme
const theme = createTheme(derivative);

function MyComponent() {
  const [token, hashId] = useCacheToken(
    theme,
    { primaryColor: '#1890ff', fontSize: 14 },
    { salt: 'my-component' }
  );

  const className = useStyleRegister(
    {
      token: token(),
      path: ['MyComponent'],
      hashId: hashId(),
    },
    () => ({
      color: token().primaryColor,
      fontSize: token().fontSize,
      '&:hover': {
        color: token().primaryColorHover,
      },
    })
  );

  return <div class={className}>Themed Component</div>;
}
```

### With Transformers

```tsx
import { useStyleRegister, px2remTransformer } from '@antd-solidjs/cssinjs';

function MyComponent() {
  const hashId = useStyleRegister(
    {
      token: {},
      path: ['MyComponent'],
    },
    () => ({
      fontSize: '16px',  // Will be converted to rem
      padding: '20px',   // Will be converted to rem
    }),
    {
      transformers: [px2remTransformer({ rootValue: 16 })],
    }
  );

  return <div class={hashId}>Responsive Component</div>;
}
```

### With Linters

```tsx
import {
  useStyleRegister,
  contentQuotesLinter,
  hashedAnimationLinter,
  logicalPropertiesLinter
} from '@antd-solidjs/cssinjs';

function MyComponent() {
  const hashId = useStyleRegister(
    {
      token: {},
      path: ['MyComponent'],
      hashId: 'my-hash',
    },
    () => ({
      content: 'Hello',  // Warning: should be quoted
      animation: 'fadeIn 1s',  // Warning: should use hashId
      marginLeft: '10px',  // Warning: consider using marginInlineStart
    }),
    {
      linters: [
        contentQuotesLinter,
        hashedAnimationLinter,
        logicalPropertiesLinter,
      ],
    }
  );

  return <div class={hashId}>Linted Component</div>;
}
```

### SSR Support

```tsx
import { StyleProvider, createCache, extractStyle } from '@antd-solidjs/cssinjs';

// Server-side
function renderApp() {
  const cache = createCache();

  const html = renderToString(() => (
    <StyleProvider cache={cache}>
      <App />
    </StyleProvider>
  ));

  const styles = extractStyle(cache);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${styles}</style>
      </head>
      <body>
        <div id="root">${html}</div>
      </body>
    </html>
  `;
}
```

### Keyframes Animation

```tsx
import { Keyframes, useStyleRegister } from '@antd-solidjs/cssinjs';

const fadeIn = new Keyframes('fadeIn', {
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

function MyComponent() {
  const hashId = useStyleRegister(
    {
      token: {},
      path: ['MyComponent'],
    },
    () => ({
      animation: `${fadeIn.getName()} 1s ease-in-out`,
      [`@keyframes ${fadeIn.getName()}`]: fadeIn.style,
    })
  );

  return <div class={hashId}>Animated Component</div>;
}
```

## API Reference

### StyleProvider

Provider component for style context.

```tsx
interface StyleProviderProps {
  cache?: Entity;
  hashPriority?: 'low' | 'high';
  container?: Element | ShadowRoot;
  children: JSX.Element;
}
```

### useStyleRegister

Hook to register and inject styles.

```tsx
function useStyleRegister(
  info: StyleRegisterInfo,
  styleFn: () => CSSObject | string,
  options?: StyleRegisterOptions
): string;
```

### useCacheToken

Hook to cache and derive tokens.

```tsx
function useCacheToken<DesignToken, DerivativeToken>(
  theme: Theme<DesignToken, DerivativeToken>,
  tokens: DesignToken,
  options?: { salt?: string }
): Accessor<[DerivativeToken, string]>;
```

### createCache

Create a new cache instance.

```tsx
function createCache(instanceId?: string): Entity;
```

### createTheme

Create a theme with derivative functions.

```tsx
function createTheme<DesignToken, DerivativeToken>(
  derivatives: DerivativeFunc<DesignToken, DerivativeToken> | DerivativeFunc<DesignToken, DerivativeToken>[]
): Theme<DesignToken, DerivativeToken>;
```

### Transformers

- `px2remTransformer(options?)` - Convert px to rem
- `legacyLogicalPropertiesTransformer()` - Convert logical properties to physical

### Linters

- `contentQuotesLinter` - Check content property quotes
- `hashedAnimationLinter` - Check animation name hashing
- `legacyNotSelectorLinter` - Check :not() selector usage
- `logicalPropertiesLinter` - Suggest logical properties
- `parentSelectorLinter` - Check parent selector usage

## License

MIT
