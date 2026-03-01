export type Linter = (key: string, value: any, info: LinterInfo) => void;

export interface LinterInfo {
	path: string;
	hashId?: string;
	parentSelectors: string[];
}

export interface LinterConfig {
	contentQuotesLinter?: boolean;
	hashedAnimationLinter?: boolean;
	legacyNotSelectorLinter?: boolean;
	logicalPropertiesLinter?: boolean;
	parentSelectorLinter?: boolean;
}

// Content quotes linter - 检查 content 属性是否有引号
export const contentQuotesLinter: Linter = (key, value, info) => {
	if (key === "content") {
		const contentValuePattern = /(attr|counters?|url)\(/;
		const strValue = String(value);

		if (
			!contentValuePattern.test(strValue) &&
			!strValue.match(/^(['"]).*\1$/)
		) {
			console.warn(
				`[antd-cssinjs] Content value '${value}' should be wrapped in quotes. Path: ${info.path}`,
			);
		}
	}
};

// Hashed animation linter - 检查动画名称是否使用了 hashId
export const hashedAnimationLinter: Linter = (key, value, info) => {
	if (key === "animation" || key === "animationName") {
		if (info.hashId && value && typeof value === "string") {
			const animationNames = value
				.split(",")
				.map((name) => name.trim().split(/\s+/)[0]);
			animationNames.forEach((name) => {
				if (name && info.hashId && !name.startsWith(info.hashId)) {
					console.warn(
						`[antd-cssinjs] Animation '${name}' should be hashed with '${info.hashId}'. Path: ${info.path}`,
					);
				}
			});
		}
	}
};

// Legacy :not() selector linter
export const legacyNotSelectorLinter: Linter = (key, _value, info) => {
	if (typeof key === "string" && key.includes(":not")) {
		const notContent = key.match(/:not\(([^)]+)\)/);
		if (notContent?.[1]) {
			const selectors = notContent[1].split(/\s*,\s*/);
			if (selectors.length > 1) {
				console.warn(
					`[antd-cssinjs] ':not()' selector with multiple selectors is not well supported. Path: ${info.path}`,
				);
			}
		}
	}
};

// Logical properties linter - 检查是否使用了逻辑属性
export const logicalPropertiesLinter: Linter = (key, _value, info) => {
	const logicalPropertiesMap: Record<string, string> = {
		marginLeft: "marginInlineStart",
		marginRight: "marginInlineEnd",
		paddingLeft: "paddingInlineStart",
		paddingRight: "paddingInlineEnd",
		left: "insetInlineStart",
		right: "insetInlineEnd",
		borderLeft: "borderInlineStart",
		borderLeftWidth: "borderInlineStartWidth",
		borderLeftStyle: "borderInlineStartStyle",
		borderLeftColor: "borderInlineStartColor",
		borderRight: "borderInlineEnd",
		borderRightWidth: "borderInlineEndWidth",
		borderRightStyle: "borderInlineEndStyle",
		borderRightColor: "borderInlineEndColor",
		borderTopLeftRadius: "borderStartStartRadius",
		borderTopRightRadius: "borderStartEndRadius",
		borderBottomLeftRadius: "borderEndStartRadius",
		borderBottomRightRadius: "borderEndEndRadius",
	};

	if (logicalPropertiesMap[key]) {
		console.warn(
			`[antd-cssinjs] Consider using logical property '${logicalPropertiesMap[key]}' instead of '${key}'. Path: ${info.path}`,
		);
	}
};

// Parent selector linter - 检查父选择器使用
export const parentSelectorLinter: Linter = (key, _value, info) => {
	if (typeof key === "string" && key.includes("&")) {
		const parentSelectorPattern = /&\s*[^&\s]/;
		if (!parentSelectorPattern.test(key)) {
			console.warn(
				`[antd-cssinjs] Parent selector '&' should be followed by a valid selector. Path: ${info.path}`,
			);
		}
	}
};

export const linters: Record<string, Linter> = {
	contentQuotesLinter,
	hashedAnimationLinter,
	legacyNotSelectorLinter,
	logicalPropertiesLinter,
	parentSelectorLinter,
};
