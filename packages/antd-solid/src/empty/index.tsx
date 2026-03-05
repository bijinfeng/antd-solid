import { clsx } from 'clsx';
import type { JSX, Component } from 'solid-js';

import { useMergeSemantic } from '../_util/hooks';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import { useLocale } from '../locale';
import DefaultEmptyImg from './empty';
import SimpleEmptyImg from './simple';
import useStyle from './style';

const defaultEmptyImg = <DefaultEmptyImg />;
const simpleEmptyImg = <SimpleEmptyImg />;

export interface TransferLocale {
  description: string;
}

export type EmptySemanticName = keyof EmptySemanticClassNames & keyof EmptySemanticStyles;

export type EmptySemanticClassNames = {
  root?: string;
  image?: string;
  description?: string;
  footer?: string;
};

export type EmptySemanticStyles = {
  root?: JSX.CSSProperties;
  image?: JSX.CSSProperties;
  description?: JSX.CSSProperties;
  footer?: JSX.CSSProperties;
};

export type EmptyClassNamesType = SemanticClassNamesType<EmptyProps, EmptySemanticClassNames>;

export type EmptyStylesType = SemanticStylesType<EmptyProps, EmptySemanticStyles>;

// For backward compatibility
export type SemanticName = EmptySemanticName;

export interface EmptyProps {
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  style?: JSX.CSSProperties;
  /** @deprecated Please use `styles.image` instead */
  imageStyle?: JSX.CSSProperties;
  image?: JSX.Element;
  description?: JSX.Element;
  children?: JSX.Element;
  classNames?: EmptyClassNamesType;
  styles?: EmptyStylesType;
}

type CompoundedComponent = Component<EmptyProps> & {
  PRESENTED_IMAGE_DEFAULT: JSX.Element;
  PRESENTED_IMAGE_SIMPLE: JSX.Element;
};

const Empty: CompoundedComponent = (props) => {
  const {
    className,
    rootClassName,
    prefixCls: customizePrefixCls,
    image,
    description,
    children,
    imageStyle,
    style,
    classNames,
    styles,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    image: contextImage,
  } = useComponentConfig('empty');

  const prefixCls = getPrefixCls('empty', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);

  const [mergedClassNames, mergedStyles] = useMergeSemantic<
    EmptyClassNamesType,
    EmptyStylesType,
    EmptyProps
  >([contextClassNames, classNames], [contextStyles, styles], {
    props,
  });

  const [locale] = useLocale('Empty');

  const des = typeof description !== 'undefined' ? description : locale?.description;

  const alt = typeof des === 'string' ? des : 'empty';

  const mergedImage = image ?? contextImage ?? defaultEmptyImg;

  let imageNode: JSX.Element | null = null;

  if (typeof mergedImage === 'string') {
    imageNode = <img draggable={false} alt={alt} src={mergedImage} />;
  } else {
    imageNode = mergedImage;
  }

  // ============================= Warning ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Empty');

    [['imageStyle', 'styles.image']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }

  return (
    <div
      class={clsx(
        hashId,
        cssVarCls,
        prefixCls,
        contextClassName,
        {
          [`${prefixCls}-normal`]: mergedImage === simpleEmptyImg,
          [`${prefixCls}-rtl`]: direction === 'rtl',
        },
        className,
        rootClassName,
        mergedClassNames().root,
      )}
      style={{ ...mergedStyles().root, ...contextStyle, ...style }}
      {...restProps}
    >
      <div
        class={clsx(`${prefixCls}-image`, mergedClassNames().image)}
        style={{ ...imageStyle, ...mergedStyles().image }}
      >
        {imageNode}
      </div>
      {des && (
        <div
          class={clsx(`${prefixCls}-description`, mergedClassNames().description)}
          style={mergedStyles().description}
        >
          {des}
        </div>
      )}
      {children && (
        <div
          class={clsx(`${prefixCls}-footer`, mergedClassNames().footer)}
          style={mergedStyles().footer}
        >
          {children}
        </div>
      )}
    </div>
  );
};

Empty.PRESENTED_IMAGE_DEFAULT = defaultEmptyImg;
Empty.PRESENTED_IMAGE_SIMPLE = simpleEmptyImg;

export default Empty;
