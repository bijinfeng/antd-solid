import { describe, expect, it } from "vitest";
import { createCache } from "../src/Cache";
import { createStyleElement, extractStyle } from "../src/extractStyle";

describe("extractStyle", () => {
	it("should extract styles from cache", () => {
		const cache = createCache();

		cache.update(["test", "component"], () => ".test { color: red; }");
		cache.update(["test", "component2"], () => ".test2 { color: blue; }");

		const styles = extractStyle(cache);

		expect(styles).toContain("color: red");
		expect(styles).toContain("color: blue");
	});

	it("should return empty string for empty cache", () => {
		const cache = createCache();
		const styles = extractStyle(cache);

		expect(styles).toBe("");
	});
});

describe("createStyleElement", () => {
	it("should return null in non-browser environment", () => {
		const originalDocument = global.document;
		// @ts-expect-error
		delete global.document;

		const result = createStyleElement(".test { color: red; }");

		expect(result).toBeNull();

		global.document = originalDocument;
	});
});
