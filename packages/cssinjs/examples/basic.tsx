import { render } from 'solid-js/web';
import { StyleProvider, useStyleRegister, createCache, createTheme, useCacheToken } from '../src';

// Example 1: Basic usage
function BasicExample() {
  const hashId = useStyleRegister(
    {
      token: {},
      path: ['BasicExample'],
    },
    () => ({
      padding: '20px',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      '&:hover': {
        backgroundColor: '#e0e0e0',
      },
    })
  );

  return <div class={hashId}>Basic Styled Component</div>;
}

// Example 2: With theme
interface DesignToken {
  primaryColor: string;
  fontSize: number;
}

interface DerivativeToken extends DesignToken {
  primaryColorHover: string;
  lineHeight: number;
}

const derivative = (token: DesignToken): DerivativeToken => ({
  ...token,
  primaryColorHover: '#40a9ff',
  lineHeight: token.fontSize * 1.5,
});

const theme = createTheme(derivative);

function ThemedExample() {
  const tokenMemo = useCacheToken(
    theme,
    { primaryColor: '#1890ff', fontSize: 14 },
    { salt: 'themed-example' }
  );

  const hashId = useStyleRegister(
    {
      token: tokenMemo()[0],
      path: ['ThemedExample'],
    },
    () => {
      const token = tokenMemo()[0];
      return {
        color: token.primaryColor,
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        '&:hover': {
          color: token.primaryColorHover,
        },
      };
    }
  );

  return <div class={hashId}>Themed Component</div>;
}

// Example 3: Complete app
function App() {
  const cache = createCache();

  return (
    <StyleProvider cache={cache}>
      <div style={{ padding: '20px' }}>
        <h1>@antd-solidjs/cssinjs Examples</h1>
        <BasicExample />
        <br />
        <ThemedExample />
      </div>
    </StyleProvider>
  );
}

// Mount the app
const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
}

export default App;
