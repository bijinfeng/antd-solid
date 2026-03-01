import { createEffect, createMemo, onCleanup } from "solid-js";
import { useStyleContext } from "../Context";
import type { Linter } from "../linters";
import type { Transformer } from "../transformers";
import { compileStyle, hash, parseStyle } from "../util";

// 用于管理样式的插入和移除
const STYLE_MARKER = "data-antd-cssinjs-cache-path";

export interface StyleRegisterInfo {
	token: any;
	path: string[];
	hashId?: string;
	layer?: string;
	nonce?: string;
}

export interface StyleRegisterOptions {
	linters?: Linter[];
	transformers?: Transformer[];
	/**
	 * Whether to prepend style to container
	 */
	prepend?: boolean;
	/**
	 * Whether to attach styles (for SSR, set to false)
	 */
	attachTo?: "head" | "parent" | false;
}

function runLinters(
	linters: Linter[] | undefined,
	key: string,
	value: any,
	info: { path: string; hashId?: string; parentSelectors: string[] },
) {
	if (!linters || linters.length === 0) return;

	linters.forEach((linter) => {
		try {
			linter(key, value, info);
		} catch (error) {
			console.error("[antd-cssinjs] Linter error:", error);
		}
	});
}

function applyTransformers(
	transformers: Transformer[] | undefined,
	token: any,
): any {
	if (!transformers || transformers.length === 0) return token;

	return transformers.reduce((acc, transformer) => {
		try {
			return transformer(acc);
		} catch (error) {
			console.error("[antd-cssinjs] Transformer error:", error);
			return acc;
		}
	}, token);
}

export default function useStyleRegister(
	info: StyleRegisterInfo,
	styleFn: () => any,
	options: StyleRegisterOptions = {},
): string {
	const context = useStyleContext();
	const { cache, container, hashPriority } = context;
	const { token, path, hashId: providedHashId, layer, nonce } = info;
	const { linters, transformers, prepend = false, attachTo = "head" } = options;

	// Generate hashId if not provided
	const hashId = createMemo(() => {
		if (providedHashId) return providedHashId;
		const tokenStr = JSON.stringify(token);
		return `css-${hash(tokenStr)}`;
	});

	// 生成唯一 key
	const fullPath = createMemo(() => [hashId(), ...path]);

	// 检查是否已缓存
	const cacheKey = createMemo(() => fullPath().join("%"));

	createEffect(() => {
		const key = cacheKey();
		const exist = cache.get(fullPath());

		if (exist) return;

		// Apply transformers to token
		const _transformedToken = applyTransformers(transformers, token);

		// Generate styles
		const styleObj = styleFn();

		// Run linters on style object
		if (linters && typeof styleObj === "object") {
			const runLintersRecursive = (
				obj: any,
				parentPath: string[] = [],
				parentSelectors: string[] = [],
			) => {
				for (const key in obj) {
					const value = obj[key];
					const currentPath = [...parentPath, key].join(".");

					runLinters(linters, key, value, {
						path: currentPath,
						hashId: hashId(),
						parentSelectors,
					});

					if (
						typeof value === "object" &&
						value !== null &&
						!Array.isArray(value)
					) {
						runLintersRecursive(
							value,
							[...parentPath, key],
							[...parentSelectors, key],
						);
					}
				}
			};

			runLintersRecursive(styleObj);
		}

		const styleContent =
			typeof styleObj === "string" ? styleObj : parseStyle(styleObj);
		const styleId = fullPath().join("-");

		// Skip if attachTo is false (SSR mode)
		if (attachTo === false) {
			cache.update(fullPath(), () => styleContent);
			return;
		}

		// 如果已有 style 标签，跳过
		if (typeof document !== "undefined" && document.getElementById(styleId)) {
			cache.update(fullPath(), () => true);
			return;
		}

		if (typeof document === "undefined") return;

		const style = document.createElement("style");
		style.id = styleId;
		style.setAttribute(STYLE_MARKER, key);

		if (nonce) {
			style.setAttribute("nonce", nonce);
		}

		// 编译样式
		const className = `.${hashId()}`;
		let css = compileStyle(className, styleContent);

		// Add layer support
		if (layer) {
			css = `@layer ${layer} {\n${css}\n}`;
		}

		style.innerHTML = css;

		const targetContainer = container || document.head;

		// Handle prepend and hash priority
		if (prepend || hashPriority === "high") {
			targetContainer.insertBefore(style, targetContainer.firstChild);
		} else {
			targetContainer.appendChild(style);
		}

		// 缓存标记
		cache.update(fullPath(), () => true);

		onCleanup(() => {
			// 移除样式（可选：引用计数）
			// style.remove();
			// cache.update(fullPath(), () => false);
		});
	});

	return hashId();
}
