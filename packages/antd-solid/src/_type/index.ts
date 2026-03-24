const _ValidateStatuses = [
	"success",
	"warning",
	"error",
	"validating",
	"",
] as const;
export type ValidateStatus = (typeof _ValidateStatuses)[number];

/**
 * Note: `middle` is deprecated and will be removed in v7, please use `medium` instead.
 */
export type SizeType = "small" | "medium" | "middle" | "large" | undefined;
