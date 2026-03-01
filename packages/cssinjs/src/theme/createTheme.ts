import Theme, { type DerivativeFunc, type TokenType } from "./Theme";
import ThemeCache from "./ThemeCache";

const cache = new ThemeCache();

export default function createTheme<
	DesignToken extends TokenType,
	DerivativeToken extends TokenType,
>(
	derivatives:
		| DerivativeFunc<DesignToken, DerivativeToken>
		| DerivativeFunc<DesignToken, DerivativeToken>[],
): Theme<DesignToken, DerivativeToken> {
	const derivativeArr = Array.isArray(derivatives)
		? derivatives
		: [derivatives];

	// Create new theme if not exist
	if (!cache.get(derivativeArr)) {
		const theme = new Theme(derivativeArr);
		cache.set(derivativeArr, theme);
	}

	return cache.get(derivativeArr)!;
}
