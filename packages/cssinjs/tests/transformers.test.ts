import { describe, expect, it } from "vitest";
import {
	legacyLogicalPropertiesTransformer,
	px2remTransformer,
} from "../src/transformers";

describe("Transformers", () => {
	describe("px2remTransformer", () => {
		it("should transform px to rem", () => {
			const transformer = px2remTransformer({ rootValue: 16 });
			const result = transformer({ fontSize: "16px", padding: "32px" });

			expect(result.fontSize).toBe("1rem");
			expect(result.padding).toBe("2rem");
		});

		it("should respect minPixelValue", () => {
			const transformer = px2remTransformer({
				rootValue: 16,
				minPixelValue: 2,
			});
			const result = transformer({ borderWidth: "1px" });

			expect(result.borderWidth).toBe("1px");
		});

		it("should handle nested objects", () => {
			const transformer = px2remTransformer({ rootValue: 16 });
			const result = transformer({
				fontSize: "16px",
				"&:hover": {
					fontSize: "18px",
				},
			});

			expect(result.fontSize).toBe("1rem");
			expect(result["&:hover"].fontSize).toBe("1.125rem");
		});
	});

	describe("legacyLogicalPropertiesTransformer", () => {
		it("should transform logical properties to physical", () => {
			const transformer = legacyLogicalPropertiesTransformer();
			const result = transformer({
				marginInlineStart: "10px",
				marginInlineEnd: "20px",
			});

			expect(result.marginLeft).toBe("10px");
			expect(result.marginRight).toBe("20px");
		});
	});
});
