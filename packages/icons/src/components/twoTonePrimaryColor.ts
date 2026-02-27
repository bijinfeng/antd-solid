import IconBase from './IconBase';
import { normalizeTwoToneColors } from '../utils';

export type TwoToneColor = string | [string, string];

export function setTwoToneColor(twoToneColor: TwoToneColor): void {
  const [primaryColor, secondaryColor] = normalizeTwoToneColors(twoToneColor);
  return IconBase.setTwoToneColors({
    primaryColor,
    secondaryColor,
  });
}

export function getTwoToneColor(): TwoToneColor {
  const colors = IconBase.getTwoToneColors();
  if (!colors.calculated) {
    return colors.primaryColor;
  }
  return [colors.primaryColor, colors.secondaryColor as string];
}
