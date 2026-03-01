import { useStyleRegister, hash } from '@antd-solidjs/cssinjs';

export function StyleTest() {
  const token = {
    colorPrimary: 'blue',
    borderRadius: 4,
  };

  const styleFn = () => ({
    color: token.colorPrimary,
    borderRadius: token.borderRadius,
    padding: '10px 20px',
    border: '1px solid #ccc',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  });

  // 模拟 hash 计算
  const hashId = `css-${hash(JSON.stringify(token))}`;

  useStyleRegister(
    {
      token,
      path: ['StyleTest'],
      hashId,
    },
    styleFn
  );

  return (
    <div class={hashId}>
      Styled Div with SolidJS & @antd-solid/cssinjs
    </div>
  );
}
