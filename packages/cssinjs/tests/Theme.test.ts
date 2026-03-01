import { describe, expect, it } from "vitest";
import { createTheme, Theme } from "../src/theme";

describe("Theme", () => {
	it("should create theme correctly", () => {
		const derivative = (token: any) => ({ ...token, derived: true });
		const theme = createTheme(derivative);
		expect(theme).toBeInstanceOf(Theme);
		expect(theme.id).toBeDefined();
	});

	it("should get derivative token", () => {
		const derivative = (token: any) => ({ ...token, value: token.value * 2 });
		const theme = createTheme(derivative);
		const token = { value: 1 };
		const derived = theme.getDerivativeToken(token);
		expect(derived).toEqual({ value: 2 });
	});

	it("should cache theme instance", () => {
		const derivatives = [(token: any) => token];
		const theme1 = createTheme(derivatives);
		const theme2 = createTheme(derivatives);
		// Theme caching works by reference equality of derivative array
		// Since we're using the same array reference, they should return the same theme
		expect(theme1).toBe(theme2);
	});
});
