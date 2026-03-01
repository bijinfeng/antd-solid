import { renderHook } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { createTheme, useCacheToken } from "../src";

describe("useCacheToken", () => {
	it("should cache token", () => {
		const derivative = (token: any) => ({ ...token, value: token.value * 2 });
		const theme = createTheme(derivative);

		const { result } = renderHook(() => useCacheToken(theme, { value: 1 }));

		// useCacheToken returns a Memo that returns [token, hashId]
		const [token, hashId] = result();

		expect(token).toEqual({ value: 2, _tokenKey: expect.any(String) });
		expect(hashId).toEqual(expect.any(String));
	});

	it("should share same token for same input", () => {
		const derivative = (token: any) => token;
		const theme = createTheme(derivative);

		const { result: result1 } = renderHook(() =>
			useCacheToken(theme, { value: 1 }),
		);
		const { result: result2 } = renderHook(() =>
			useCacheToken(theme, { value: 1 }),
		);

		const [_token1, hash1] = result1();
		const [_token2, hash2] = result2();

		expect(hash1).toBe(hash2);
	});
});
