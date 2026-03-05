import { useStyleRegister } from '@antd-solidjs/cssinjs';
import { calc } from '@antd-solidjs/util'
import { mergeToken, statistic, statisticToken } from '@antd-solidjs/cssinjs-utils';
export type { CSSUtil, TokenWithCommonCls } from '@antd-solidjs/cssinjs-utils';

import type {
  AliasToken,
  FullToken,
  GenerateStyle,
  GenStyleFn,
  GetDefaultToken,
  GlobalToken,
  OverrideComponent,
  PresetColorKey,
  PresetColorType,
  SeedToken,
  UseComponentStyleResult,
} from './interface';
import { PresetColors } from './interface';
import { getLineHeight } from './themes/shared/genFontSizes';
import useToken from './useToken';
import { genComponentStyleHook, genStyleHooks, genSubStyleComponent } from './util/genStyleUtils';
import genPresetColor from './util/genPresetColor';
import useResetIconStyle from './util/useResetIconStyle';

export { defaultConfig, DesignTokenContext } from './context';

export {
  calc,
  // generators
  genComponentStyleHook,
  genPresetColor,
  genStyleHooks,
  genSubStyleComponent,
  getLineHeight,
  // utils
  mergeToken,
  // constant
  PresetColors,
  statistic,
  statisticToken,
  // hooks
  useResetIconStyle,
  useStyleRegister,
  useToken,
};
export type {
  AliasToken,
  FullToken,
  GenerateStyle,
  GenStyleFn,
  GetDefaultToken,
  GlobalToken,
  OverrideComponent,
  PresetColorKey,
  PresetColorType,
  SeedToken,
  UseComponentStyleResult,
};
