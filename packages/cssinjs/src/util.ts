import hash from "@emotion/hash";
import unitless from "@emotion/unitless";
import { compile, middleware, prefixer, serialize, stringify } from "stylis";

export function token2key(token: any, salt: string): string {
	return hash(`${salt}_${JSON.stringify(token)}`);
}

function hyphenate(string: string) {
	return string.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function parseStyle(style: any, _selector?: string): string {
	if (!style) return "";
	let css = "";

	for (const key in style) {
		const value = style[key];
		if (value === null || value === undefined) continue;

		// Handle nested selectors and pseudo-classes
		if (typeof value === "object" && !Array.isArray(value)) {
			// Check if it's a nested selector or pseudo-class
			if (
				key.startsWith("&") ||
				key.startsWith(":") ||
				key.startsWith("@") ||
				key.includes(" ")
			) {
				css += `${key}{${parseStyle(value)}}`;
			} else {
				// Regular nested object, treat as properties
				css += parseStyle(value);
			}
		} else {
			const prop = hyphenate(key);
			let val: string;

			if (Array.isArray(value)) {
				// Handle array values (e.g., multiple backgrounds)
				val = value.join(", ");
			} else if (typeof value === "number" && !unitless[key]) {
				val = `${value}px`;
			} else {
				val = String(value);
			}

			css += `${prop}:${val};`;
		}
	}
	return css;
}

// 简单的样式处理，直接使用 stylis
export function compileStyle(selector: string, styleStr: string): string {
	return serialize(
		compile(`${selector}{${styleStr}}`),
		middleware([prefixer, stringify]),
	);
}

/**
 * Generate a unique hash ID for styles
 */
export function genHashId(componentName: string, token?: any): string {
	const tokenStr = token ? JSON.stringify(token) : "";
	const hashStr = hash(`${componentName}${tokenStr}`);
	return `${componentName}-${hashStr}`;
}

/**
 * Merge multiple style objects
 */
export function mergeStyles(...styles: any[]): any {
	return styles.reduce((acc, style) => {
		if (!style) return acc;

		for (const key in style) {
			const value = style[key];

			if (
				typeof value === "object" &&
				!Array.isArray(value) &&
				value !== null
			) {
				acc[key] = mergeStyles(acc[key] || {}, value);
			} else {
				acc[key] = value;
			}
		}

		return acc;
	}, {});
}

/**
 * Check if a value is a valid CSS value
 */
export function isValidCSSValue(value: any): boolean {
	if (value === null || value === undefined) return false;
	if (typeof value === "string" || typeof value === "number") return true;
	if (Array.isArray(value)) return value.every(isValidCSSValue);
	return false;
}

/**
 * Convert camelCase to kebab-case
 */
export function toKebabCase(str: string): string {
	return hyphenate(str);
}

export { hash };
