# @antd-solidjs/cssinjs

为 antd-solid 提供的组件级 CSS-in-JS 解决方案，移植自 [@ant-design/cssinjs](https://github.com/ant-design/cssinjs)。

## 特性

- 🎨 **组件级样式** - 自动生成哈希的作用域样式
- 🚀 **性能优化** - 内置缓存系统实现样式复用
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🔧 **转换器** - 内置 px2rem 等 CSS 转换器
- ✅ **校验器** - CSS 规则验证和最佳实践警告
- 🌐 **SSR 支持** - 服务端渲染与样式提取
- 🎭 **主题系统** - 强大的基于 token 的主题化
- ⚡ **SolidJS 原生** - 专为 SolidJS 响应式系统构建

## 安装

```bash
npm install @antd-solidjs/cssinjs
# 或
pnpm add @antd-solidjs/cssinjs
# 或
yarn add @antd-solidjs/cssinjs
```

## 基础用法

```tsx
import { StyleProvider, useStyleRegister, createCache } from '@antd-solidjs/cssinjs';

// 创建缓存实例
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

## 高级用法

### 使用主题系统

```tsx
import { createTheme, useCacheToken, StyleProvider } from '@antd-solidjs/cssinjs';

// 定义设计 token
interface DesignToken {
  primaryColor: string;
  fontSize: number;
}

interface DerivativeToken extends DesignToken {
  primaryColorHover: string;
  lineHeight: number;
}

// 创建派生函数
const derivative = (token: DesignToken): DerivativeToken => ({
  ...token,
  primaryColorHover: lighten(token.primaryColor, 0.2),
  lineHeight: token.fontSize * 1.5,
});

// 创建主题
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

  return <div class={className}>主题化组件</div>;
}
```

### 使用转换器

```tsx
import { useStyleRegister, px2remTransformer } from '@antd-solidjs/cssinjs';

function MyComponent() {
  const hashId = useStyleRegister(
    {
      token: {},
      path: ['MyComponent'],
    },
    () => ({
      fontSize: '16px',  // 将被转换为 rem
      padding: '20px',   // 将被转换为 rem
    }),
    {
      transformers: [px2remTransformer({ rootValue: 16 })],
    }
  );

  return <div class={hashId}>响应式组件</div>;
}
```

### 使用校验器

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
      content: 'Hello',  // 警告：应该使用引号
      animation: 'fadeIn 1s',  // 警告：应该使用 hashId
      marginLeft: '10px',  // 警告：考虑使用 marginInlineStart
    }),
    {
      linters: [
        contentQuotesLinter,
        hashedAnimationLinter,
        logicalPropertiesLinter,
      ],
    }
  );

  return <div class={hashId}>已校验组件</div>;
}
```

### SSR 支持

```tsx
import { StyleProvider, createCache, extractStyle } from '@antd-solidjs/cssinjs';

// 服务端
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

### 关键帧动画

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

  return <div class={hashId}>动画组件</div>;
}
```

## API 参考

### StyleProvider

样式上下文的 Provider 组件。

```tsx
interface StyleProviderProps {
  cache?: Entity;
  hashPriority?: 'low' | 'high';
  container?: Element | ShadowRoot;
  children: JSX.Element;
}
```

### useStyleRegister

注册和注入样式的 Hook。

```tsx
function useStyleRegister(
  info: StyleRegisterInfo,
  styleFn: () => CSSObject | string,
  options?: StyleRegisterOptions
): string;
```

### useCacheToken

缓存和派生 token 的 Hook。

```tsx
function useCacheToken<DesignToken, DerivativeToken>(
  theme: Theme<DesignToken, DerivativeToken>,
  tokens: DesignToken,
  options?: { salt?: string }
): Accessor<[DerivativeToken, string]>;
```

### createCache

创建新的缓存实例。

```tsx
function createCache(instanceId?: string): Entity;
```

### createTheme

使用派生函数创建主题。

```tsx
function createTheme<DesignToken, DerivativeToken>(
  derivatives: DerivativeFunc<DesignToken, DerivativeToken> | DerivativeFunc<DesignToken, DerivativeToken>[]
): Theme<DesignToken, DerivativeToken>;
```

### 转换器

- `px2remTransformer(options?)` - 将 px 转换为 rem
- `legacyLogicalPropertiesTransformer()` - 将逻辑属性转换为物理属性

### 校验器

- `contentQuotesLinter` - 检查 content 属性引号
- `hashedAnimationLinter` - 检查动画名称哈希
- `legacyNotSelectorLinter` - 检查 :not() 选择器用法
- `logicalPropertiesLinter` - 建议使用逻辑属性
- `parentSelectorLinter` - 检查父选择器用法

## 许可证

MIT
