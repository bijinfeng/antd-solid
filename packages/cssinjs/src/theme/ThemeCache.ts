import type Theme from "./Theme";
import type { DerivativeFunc, TokenType } from "./Theme";

type ThemeCacheMap = Map<DerivativeFunc<any, any>[], Theme<any, any>>;

export default class ThemeCache {
	public static cache: ThemeCacheMap = new Map();

	private cache: ThemeCacheMap;

	constructor() {
		this.cache = new Map();
	}

	public get<DesignToken extends TokenType, DerivativeToken extends TokenType>(
		derivatives: DerivativeFunc<DesignToken, DerivativeToken>[],
	): Theme<DesignToken, DerivativeToken> | undefined {
		return this.cache.get(derivatives);
	}

	public set<DesignToken extends TokenType, DerivativeToken extends TokenType>(
		derivatives: DerivativeFunc<DesignToken, DerivativeToken>[],
		value: Theme<DesignToken, DerivativeToken>,
	): void {
		this.cache.set(derivatives, value);
	}
}
