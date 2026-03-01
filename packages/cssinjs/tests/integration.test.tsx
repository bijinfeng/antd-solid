import { render } from "@solidjs/testing-library";
import { createCache, StyleProvider, useStyleRegister } from "../src";

describe("Integration Tests", () => {
	it("should render component with styles", () => {
		const cache = createCache();

		function TestComponent() {
			const hashId = useStyleRegister(
				{
					token: { color: "red" },
					path: ["TestComponent"],
				},
				() => ({
					color: "red",
					fontSize: "14px",
				}),
			);

			return <div class={hashId}>Test</div>;
		}

		const { container } = render(() => (
			<StyleProvider cache={cache}>
				<TestComponent />
			</StyleProvider>
		));

		expect(container.querySelector("div")).toBeTruthy();
	});

	it("should apply transformers", () => {
		const cache = createCache();

		function TestComponent() {
			const hashId = useStyleRegister(
				{
					token: {},
					path: ["TestComponent"],
				},
				() => ({
					fontSize: "16px",
				}),
				{
					transformers: [],
				},
			);

			return <div class={hashId}>Test</div>;
		}

		const { container } = render(() => (
			<StyleProvider cache={cache}>
				<TestComponent />
			</StyleProvider>
		));

		expect(container.querySelector("div")).toBeTruthy();
	});

	it("should cache styles", () => {
		const cache = createCache();

		function TestComponent() {
			const hashId = useStyleRegister(
				{
					token: { color: "blue" },
					path: ["TestComponent"],
				},
				() => ({
					color: "blue",
				}),
			);

			return <div class={hashId}>Test</div>;
		}

		render(() => (
			<StyleProvider cache={cache}>
				<TestComponent />
				<TestComponent />
			</StyleProvider>
		));

		// Cache should have the style
		expect(cache.size).toBeGreaterThan(0);
	});
});
