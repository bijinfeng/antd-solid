import type { ComponentToken as AffixComponentToken } from '../../affix/style';
import type { ComponentToken as EmptyComponentToken } from '../../empty/style';

export interface ComponentTokenMap {
  Affix?: AffixComponentToken;
  Empty?: EmptyComponentToken;
}
