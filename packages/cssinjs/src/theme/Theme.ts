export type DerivativeFunc<
	DesignToken extends object,
	DerivativeToken extends object,
> = (token: DesignToken) => DerivativeToken;

export type TokenType = object;

let uuid = 0;

export default class Theme<
	DesignToken extends TokenType,
	DerivativeToken extends TokenType,
> {
	private derivatives: DerivativeFunc<DesignToken, DerivativeToken>[];

	public readonly id: number;

	constructor(
		derivatives:
			| DerivativeFunc<DesignToken, DerivativeToken>
			| DerivativeFunc<DesignToken, DerivativeToken>[],
	) {
		this.derivatives = Array.isArray(derivatives) ? derivatives : [derivatives];
		this.id = uuid;

		if (derivatives.length === 0) {
			console.warn(
				"[antd-cssinjs] Theme should have at least one derivative function.",
			);
		}

		uuid += 1;
	}

	getDerivativeToken(token: DesignToken): DerivativeToken {
		return this.derivatives.reduce<DerivativeToken>((_result, derivative) => {
			return derivative(token);
		}, undefined as any);
	}
}
