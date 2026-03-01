import { type Accessor, createMemo, useContext } from "solid-js";
import { StyleContext } from "../Context";
import type { Theme } from "../theme";
import { token2key } from "../util";

export default function useCacheToken<
	DesignToken extends object = any,
	DerivativeToken extends object = any,
>(
	theme: Theme<DesignToken, DerivativeToken>,
	tokens: DesignToken,
	options: { salt?: string } = {},
): Accessor<readonly [DerivativeToken, string]> {
	const context = useContext(StyleContext);

	return createMemo(() => {
		const salt = options.salt || "";
		const tokenKey = token2key(tokens, salt);

		// Check global cache first
		// In SolidJS, we access the cache reactively if needed, but here cache is an Entity
		// We should ideally use a signal or similar if cache updates are reactive
		// But ant-design/cssinjs cache is mutable, so we might just read it.

		// Note: Entity.get is synchronous
		const cachedToken = context.cache.get(["token", theme.id, tokenKey]);

		if (cachedToken) {
			return [cachedToken, tokenKey] as const;
		}

		// Generate new token
		const derivativeToken = theme.getDerivativeToken(tokens);

		// Merge with seed token (simplification)
		const mergedToken = {
			...tokens,
			...derivativeToken,
			_tokenKey: tokenKey,
		} as DerivativeToken;

		// Update cache
		context.cache.update(["token", theme.id, tokenKey], () => mergedToken);

		return [mergedToken, tokenKey] as const;
	});
}
