import { describe, expect, it } from "vitest";
import Entity from "../src/Cache";

describe("Cache", () => {
	it("should cache values", () => {
		const cache = new Entity("test");
		cache.update(["key"], () => "value");
		expect(cache.get(["key"])).toBe("value");
	});

	it("should update values", () => {
		const cache = new Entity("test");
		cache.update(["key"], () => "value1");
		cache.update(["key"], () => "value2");
		expect(cache.get(["key"])).toBe("value2");
	});
});
