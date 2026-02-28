import solid from "rolldown-plugin-solid";
import { defineConfig } from "tsdown";

// export both js and jsx
export default defineConfig([
	{
		platform: "neutral",
		unbundle: true,
		// use the solid plugin to handle jsx
		plugins: [solid()],
	},
	{
		platform: "neutral",
		unbundle: true,
		inputOptions(options) {
			options.transform = {
				...options.transform,
				jsx: "preserve",
			};
		},
		outExtensions: () => ({ js: ".jsx" }),
	},
]);
