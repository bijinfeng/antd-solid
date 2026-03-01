import type Entity from "./Cache";

export interface ExtractStyleOptions {
	/**
	 * Whether to remove style tags after extraction
	 */
	plain?: boolean;
}

/**
 * Extract all styles from cache for SSR
 * This function collects all registered styles and returns them as a string
 */
export function extractStyle(
	cache: Entity,
	options: ExtractStyleOptions = {},
): string {
	const { plain = false } = options;
	const _styles: string[] = [];
	const styleMap = new Map<string, string>();

	// Iterate through cache and collect styles
	cache.cache.forEach((value, key) => {
		if (typeof value === "string") {
			styleMap.set(key, value);
		}
	});

	// Get all style elements from document
	if (typeof document !== "undefined") {
		const styleElements = document.querySelectorAll(
			"style[data-antd-cssinjs-cache-path]",
		);

		styleElements.forEach((styleEl) => {
			const path = styleEl.getAttribute("data-antd-cssinjs-cache-path");
			const content = styleEl.innerHTML;

			if (path && content) {
				styleMap.set(path, content);

				// Remove style element if not plain mode
				if (!plain) {
					styleEl.remove();
				}
			}
		});
	}

	// Convert map to array and sort by path for consistent output
	const sortedStyles = Array.from(styleMap.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([_, content]) => content);

	return sortedStyles.join("\n");
}

/**
 * Create style tags from extracted style string
 * Used for hydration on client side
 */
export function createStyleTagsFromCache(
	styleContent: string,
	_cache: Entity,
): void {
	if (typeof document === "undefined") {
		return;
	}

	const styles = styleContent.split("\n").filter(Boolean);

	styles.forEach((css, index) => {
		const style = document.createElement("style");
		style.setAttribute("data-antd-cssinjs-cache-path", `ssr-${index}`);
		style.innerHTML = css;
		document.head.appendChild(style);
	});
}

/**
 * Create a style element with given content
 */
export function createStyleElement(
	css: string,
	options: {
		path?: string[];
		hashId?: string;
		prepend?: boolean;
		container?: Element | ShadowRoot;
	} = {},
): HTMLStyleElement | null {
	if (typeof document === "undefined") {
		return null;
	}

	const {
		path = [],
		hashId = "",
		prepend = false,
		container = document.head,
	} = options;

	const styleId = [...(hashId ? [hashId] : []), ...path].join("-");

	// Check if style already exists
	const existingStyle = document.getElementById(styleId);
	if (existingStyle) {
		return existingStyle as HTMLStyleElement;
	}

	const style = document.createElement("style");
	style.id = styleId;

	if (path.length > 0) {
		style.setAttribute("data-antd-cssinjs-cache-path", path.join("%"));
	}

	style.innerHTML = css;

	if (prepend && container.firstChild) {
		container.insertBefore(style, container.firstChild);
	} else {
		container.appendChild(style);
	}

	return style;
}
