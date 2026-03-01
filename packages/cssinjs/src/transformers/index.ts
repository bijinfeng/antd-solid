export type Transformer = (token: any, options?: any) => any;

export interface TransformOptions {
	/**
	 * Transform px to rem
	 */
	px2rem?: {
		rootValue?: number;
		unitPrecision?: number;
		minPixelValue?: number;
	};
}

/**
 * px2rem transformer
 * Converts px values to rem based on root font size
 */
export function px2remTransformer(
	options: TransformOptions["px2rem"] = {},
): Transformer {
	const { rootValue = 16, unitPrecision = 5, minPixelValue = 0 } = options;

	return (token: any) => {
		if (!token || typeof token !== "object") {
			return token;
		}

		const transform = (value: any): any => {
			if (typeof value === "string") {
				return value.replace(/(\d+(?:\.\d+)?)px/g, (match, num) => {
					const n = parseFloat(num);
					if (n <= minPixelValue) {
						return match;
					}
					const rem = n / rootValue;
					return `${rem.toFixed(unitPrecision).replace(/\.?0+$/, "")}rem`;
				});
			}

			if (typeof value === "number") {
				// Don't transform numbers directly, only string values
				return value;
			}

			if (Array.isArray(value)) {
				return value.map(transform);
			}

			if (typeof value === "object") {
				const result: any = {};
				for (const key in value) {
					result[key] = transform(value[key]);
				}
				return result;
			}

			return value;
		};

		return transform(token);
	};
}

/**
 * Legacy transformer for compatibility
 */
export function legacyLogicalPropertiesTransformer(): Transformer {
	return (token: any) => {
		if (!token || typeof token !== "object") {
			return token;
		}

		const logicalToPhysical: Record<string, string> = {
			marginInlineStart: "marginLeft",
			marginInlineEnd: "marginRight",
			paddingInlineStart: "paddingLeft",
			paddingInlineEnd: "paddingRight",
			insetInlineStart: "left",
			insetInlineEnd: "right",
		};

		const transform = (obj: any): any => {
			if (!obj || typeof obj !== "object") {
				return obj;
			}

			if (Array.isArray(obj)) {
				return obj.map(transform);
			}

			const result: any = {};
			for (const key in obj) {
				const newKey = logicalToPhysical[key] || key;
				result[newKey] = transform(obj[key]);
			}
			return result;
		};

		return transform(token);
	};
}

export const transformers: {
	px2rem: typeof px2remTransformer;
	legacyLogicalProperties: typeof legacyLogicalPropertiesTransformer;
} = {
	px2rem: px2remTransformer,
	legacyLogicalProperties: legacyLogicalPropertiesTransformer,
};
