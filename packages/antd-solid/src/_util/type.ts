export type Primitive = null | undefined | string | number | boolean | symbol | bigint;

/** https://github.com/Microsoft/TypeScript/issues/29729 */
export type LiteralUnion<T, U extends Primitive = string> = T | (U & Record<never, never>);

export type AnyObject = Record<PropertyKey, any>;

export type EmptyObject = Record<never, never>;

export type ValidChar =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';
