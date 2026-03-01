import type { JSX } from "solid-js";
import type { Linter } from "./linters";
import type { Transformer } from "./transformers";

/**
 * CSS properties type
 */
export type CSSProperties = JSX.CSSProperties;

/**
 * CSS object type with nested selectors support
 */
export interface CSSObject extends CSSProperties {
	[key: string]: any;
}

/**
 * Style function type
 */
export type StyleFunction<Token = any> = (token: Token) => CSSObject | string;

/**
 * CSS interpolation type
 */
export type CSSInterpolation =
	| CSSObject
	| string
	| number
	| false
	| null
	| undefined;

/**
 * Keyframe definition
 */
export interface KeyframeDefinition {
	[percent: string]: CSSObject;
}

/**
 * Style config for useStyleRegister
 */
export interface StyleConfig<Token = any> {
	/**
	 * Component path for cache key
	 */
	path: string[];
	/**
	 * Hash ID for style isolation
	 */
	hashId?: string;
	/**
	 * Design token
	 */
	token: Token;
	/**
	 * CSS layer name
	 */
	layer?: string;
	/**
	 * Nonce for CSP
	 */
	nonce?: string;
	/**
	 * Linters to apply
	 */
	linters?: Linter[];
	/**
	 * Transformers to apply
	 */
	transformers?: Transformer[];
}

/**
 * Cache entity interface
 */
export interface CacheEntity {
	instanceId: string;
	cache: Map<string, any>;
	get(keys: (string | number)[]): any;
	update(keys: (string | number)[], valueFn: (origin: any) => any): void;
	clear(): void;
	delete(keys: (string | number)[]): boolean;
	has(keys: (string | number)[]): boolean;
	readonly size: number;
}

/**
 * Theme interface
 */
export interface ThemeConfig<DesignToken = any, DerivativeToken = any> {
	/**
	 * Theme ID
	 */
	id: number;
	/**
	 * Get derivative token from design token
	 */
	getDerivativeToken(token: DesignToken): DerivativeToken;
}

/**
 * Style provider props
 */
export interface StyleProviderProps {
	/**
	 * Cache instance
	 */
	cache?: CacheEntity;
	/**
	 * Hash priority for style insertion order
	 */
	hashPriority?: "low" | "high";
	/**
	 * Container for style injection
	 */
	container?: Element | ShadowRoot;
	/**
	 * Children elements
	 */
	children: JSX.Element;
	/**
	 * SSR mode
	 */
	ssrInline?: boolean;
	/**
	 * Transformers to apply globally
	 */
	transformers?: Transformer[];
	/**
	 * Linters to apply globally
	 */
	linters?: Linter[];
}
