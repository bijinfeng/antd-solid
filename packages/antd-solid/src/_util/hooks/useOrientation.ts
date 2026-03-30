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
	const validOrientation = isValidOrientation(orientation);
	let mergedOrientation: Orientation = "horizontal";
	if (validOrientation) {
		mergedOrientation = orientation;
	} else if (typeof vertical === "boolean") {
		mergedOrientation = vertical ? "vertical" : "horizontal";
	}

	return [mergedOrientation, mergedOrientation === "vertical"] as const;
};
