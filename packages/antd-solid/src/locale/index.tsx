import { type Component, createMemo, type JSX } from 'solid-js'

import { devUseWarning } from '../_util/warning';
import type { LocaleContextProps } from './context';
import LocaleContext from './context';
import type { TransferLocale as TransferLocaleForEmpty } from '../empty';

export { default as useLocale } from './useLocale';

export const ANT_MARK = 'internalMark';

export interface Locale {
  locale: string;
  Empty?: TransferLocaleForEmpty;
  global?: {
    placeholder?: string;
    close?: string;
    sortable?: string;
  };
  Icon?: Record<string, any>;
  Text?: {
    edit?: any;
    copy?: any;
    copied?: any;
    expand?: any;
    collapse?: any;
  };
}

export interface LocaleProviderProps {
  locale: Locale;
  children?: JSX.Element;
  /** @internal */
  _ANT_MARK__?: string;
}

const LocaleProvider: Component<LocaleProviderProps> = (props) => {
  const { locale = {} as Locale, children, _ANT_MARK__ } = props;

  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('LocaleProvider');

    warning(
      _ANT_MARK__ === ANT_MARK,
      'deprecated',
      '`LocaleProvider` is deprecated. Please use `locale` with `ConfigProvider` instead: http://u.ant.design/locale',
    );
  }

  const getMemoizedContextValue = createMemo<LocaleContextProps>(
    () => ({ ...locale, exist: true })
  );

  return (
    <LocaleContext.Provider value={getMemoizedContextValue()}>{children}</LocaleContext.Provider>
  );
}

export default LocaleProvider;
