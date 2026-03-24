import { createMemo } from "solid-js";

export interface OrientationContextType {
	orientation?: Orientation;
	vertical?: boolean;
}

export type Orientation = "horizontal" | "vertical";

const isValidOrientation = (orientation?: Orientation) => {
	return orientation === "horizontal" || orientation === "vertical";
};

export const useOrientation = (
	orientation?: Orientation,
	vertical?: boolean,
) => {
	const _orientation = createMemo<OrientationContextType>(() => {
		const validOrientation = isValidOrientation(orientation);
		let mergedOrientation: Orientation = "horizontal";
		if (validOrientation) {
			mergedOrientation = orientation;
		} else if (typeof vertical === "boolean") {
			mergedOrientation = vertical ? "vertical" : "horizontal";
		}

		return {
			orientation: mergedOrientation,
			vertical: mergedOrientation === "vertical",
		};
	});

	const mergedOrientation = createMemo(() => _orientation().orientation);
	const isVertical = createMemo(() => _orientation().vertical);

	return [mergedOrientation, isVertical] as const;
};
