import { JSX, Component, useContext } from "solid-js"
import { clsx } from "clsx"
import { mergeRefs } from "@solid-primitives/refs";

import { svgBaseProps, warning, useInsertStyles } from '../utils'
import Context from './Context';

export interface IconBaseProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  spin?: boolean;
  rotate?: number;
}

export interface CustomIconComponentProps {
  width: string | number;
  height: string | number;
  fill?: string;
  viewBox?: string;
  class?: string;
  style?: JSX.CSSProperties;
}

export interface IconComponentProps extends IconBaseProps {
  viewBox?: string;
  component?: Component<CustomIconComponentProps>;
  ariaLabel?: JSX.AriaAttributes['aria-label'];
}

const Icon: Component<IconComponentProps> = (props) => {
  const {
    // affect inner <svg>...</svg>
    component: Component,
    viewBox,
    spin,
    rotate,

    tabIndex,
    onClick,

    // children
    children,
    ref,
    ...restProps
  } = props;

  let iconRef: HTMLSpanElement | undefined = undefined;

  warning(Boolean(Component || children), 'Should have `component` prop or `children`.');

  useInsertStyles(iconRef);

  const { prefixCls = 'anticon', rootClassName } = useContext(Context);

  const classString = clsx(
    rootClassName,
    prefixCls,
    {
      [`${prefixCls}-spin`]: !!spin && !!Component,
    },
    restProps.class,
  )

  const svgClassString = clsx({ [`${prefixCls}-spin`]: !!spin });

  const svgStyle: JSX.CSSProperties | undefined = rotate
    ? {
        '--ms-transform': `rotate(${rotate}deg)`,
        transform: `rotate(${rotate}deg)`,
      }
    : undefined;

  const innerSvgProps: CustomIconComponentProps = {
    ...svgBaseProps,
    class: svgClassString,
    style: svgStyle,
    viewBox,
  };

  if (!viewBox) {
    delete innerSvgProps.viewBox;
  }

  // component > children
  const renderInnerNode = () => {
    if (Component) {
      return <Component {...innerSvgProps}>{children}</Component>;
    }

    if (children) {
      // TODO
      // const childrenArray = Children(() => children).toArray()
      // warning(
      //   Boolean(viewBox) || (childrenArray.length === 1 && !!childrenArray[0] && childrenArray[0].type === 'use'),
      //   'Make sure that you provide correct `viewBox`' +
      //     ' prop (default `0 0 1024 1024`) to the icon.',
      // );

      return (
        <svg {...innerSvgProps} viewBox={viewBox}>
          {children}
        </svg>
      );
    }

    return null;
  }

  let iconTabIndex = tabIndex;
  if (iconTabIndex === undefined && onClick) {
    iconTabIndex = -1;
  }

  return (
    <span
      role="img"
      {...restProps}
      ref={mergeRefs(ref, el => (iconRef = el))}
      tabIndex={iconTabIndex}
      onClick={onClick}
      class={classString}
    >
      {renderInnerNode()}
    </span>
  )
}

export default Icon;
