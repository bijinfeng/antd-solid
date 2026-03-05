import type { CSSObject } from '../hooks/useStyleRegister';

export interface Transformer {
  visit?: (cssObj: CSSObject) => CSSObject;
}