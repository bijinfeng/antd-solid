import { describe, expect, it } from "vitest";
import { compileStyle, parseStyle, token2key } from "../src/util";

describe("util", () => {
	it("token2key should generate hash", () => {
		const hash = token2key({ color: "red" }, "salt");
		expect(hash).toBeDefined();
		expect(typeof hash).toBe("string");
	});

	it("parseStyle should convert object to css string", () => {
		const style = {
			color: "red",
			fontSize: 12,
			"&:hover": {
				color: "blue",
			},
		};
		const css = parseStyle(style);
		expect(css).toContain("color:red;");
		expect(css).toContain("font-size:12px;");
		expect(css).toContain("&:hover{color:blue;}");
	});

	it("compileStyle should compile css", () => {
		const css = compileStyle(".test", "color:red;");
		expect(css).toContain(".test{color:red;}");
	});
});
