import { describe, expect, it } from "vitest";
import {
	contentQuotesLinter,
	hashedAnimationLinter,
	logicalPropertiesLinter,
} from "../src/linters";

describe("Linters", () => {
	it("contentQuotesLinter should warn for unquoted content", () => {
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		contentQuotesLinter("content", "Hello", {
			path: "test",
			parentSelectors: [],
		});

		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("hashedAnimationLinter should warn for unhashed animation", () => {
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		hashedAnimationLinter("animation", "fadeIn 1s", {
			path: "test",
			hashId: "hash-123",
			parentSelectors: [],
		});

		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("logicalPropertiesLinter should suggest logical properties", () => {
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		logicalPropertiesLinter("marginLeft", "10px", {
			path: "test",
			parentSelectors: [],
		});

		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});
