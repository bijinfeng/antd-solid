import type { IconDefinition } from '@ant-design/icons-svg/lib/types';
import { blue } from '@ant-design/colors';
import { Component, JSX, useContext } from 'solid-js';
import { clsx } from 'clsx';

import type { IconBaseProps } from './Icon';
import IconBase from './IconBase';
import Context from './Context';
import { getTwoToneColor, setTwoToneColor } from './twoTonePrimaryColor';
import type { TwoToneColor } from './twoTonePrimaryColor';
import { normalizeTwoToneColors } from '../utils';

export interface AntdIconProps extends IconBaseProps {
  twoToneColor?: TwoToneColor;
}

export interface IconComponentProps extends AntdIconProps {
  icon: IconDefinition;
}

interface IconBaseComponent extends Component<IconComponentProps> {
  getTwoToneColor: typeof getTwoToneColor;
  setTwoToneColor: typeof setTwoToneColor;
}

// Initial setting
// should move it to antd main repo?
setTwoToneColor(blue.primary as string);

const Icon: IconBaseComponent = (props) => {
  const {
    // affect inner <svg>...</svg>
    icon,
    spin,
    rotate,

    tabIndex,
    onClick,

    // other
    twoToneColor,

    ...restProps
  } = props;

  const { prefixCls = 'anticon', rootClassName } = useContext(Context);

  const classString = clsx(
    rootClassName,
    prefixCls,
    {
      [`${prefixCls}-${icon.name}`]: !!icon.name,
      [`${prefixCls}-spin`]: !!spin || icon.name === 'loading',
    },
    restProps.class,
  );

  let iconTabIndex = tabIndex;
  if (iconTabIndex === undefined && onClick) {
    iconTabIndex = -1;
  }

  const svgStyle: JSX.CSSProperties | undefined = rotate
    ? {
        '--ms-transform': `rotate(${rotate}deg)`,
        transform: `rotate(${rotate}deg)`,
      }
    : undefined;

  const [primaryColor, secondaryColor] = normalizeTwoToneColors(twoToneColor);

  return (
    <span
      role="img"
      aria-label={icon.name}
      {...restProps}
      tabIndex={iconTabIndex}
      onClick={onClick}
      class={classString}
    >
      <IconBase
        icon={icon}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        style={svgStyle}
      />
    </span>
  )
}


Icon.getTwoToneColor = getTwoToneColor;
Icon.setTwoToneColor = setTwoToneColor;

export default Icon;
