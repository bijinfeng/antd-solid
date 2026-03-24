import { clsx } from "clsx";
import type { Component, JSX } from "solid-js";
import { createMemo, Index, children as solidChildren } from "solid-js";
import type { SizeType } from "../_type";
import { isPresetSize, isValidGapNumber } from "../_util/gapSize";
import type {
	Orientation,
	SemanticClassNamesType,
	SemanticStylesType,
} from "../_util/hooks";
import { useMergeSemantic, useOrientation } from "../_util/hooks";
import isNonNullable from "../_util/isNonNullable";
import { useComponentConfig } from "../config-provider/context";
import Addon from "./Addon";
import Compact from "./Compact";
import type { SpaceContextType } from "./context";
import { SpaceContextProvider } from "./context";
import Item from "./Item";
import useStyle from "./style";

export { SpaceContext } from "./context";

export type SpaceSize = SizeType | number;

export type SpaceSemanticName = keyof SpaceSemanticClassNames &
	keyof SpaceSemanticStyles;

export type SpaceSemanticClassNames = {
	root?: string;
	item?: string;
	separator?: string;
};

export type SpaceSemanticStyles = {
	root?: JSX.CSSProperties;
	item?: JSX.CSSProperties;
	separator?: JSX.CSSProperties;
};

export type SpaceClassNamesType = SemanticClassNamesType<
	SpaceProps,
	SpaceSemanticClassNames
>;

export type SpaceStylesType = SemanticStylesType<
	SpaceProps,
	SpaceSemanticStyles
>;

export interface SpaceProps extends JSX.HTMLAttributes<HTMLDivElement> {
	prefixCls?: string;
	class?: string;
	rootClassName?: string;
	style?: JSX.CSSProperties;
	size?: SpaceSize | [SpaceSize, SpaceSize];
	vertical?: boolean;
	orientation?: Orientation;
	// No `stretch` since many components do not support that.
	align?: "start" | "end" | "center" | "baseline";
	separator?: JSX.Element;
	wrap?: boolean;
	classes?: SpaceClassNamesType;
	styles?: SpaceStylesType;
}

const InternalSpace: Component<SpaceProps> = (props) => {
	const {
		getPrefixCls,
		direction: directionConfig,
		size: contextSize,
		class: contextClassName,
		style: contextStyle,
		classes: contextClassNames,
		styles: contextStyles,
	} = useComponentConfig("space");

	const {
		size = contextSize ?? "small",
		align,
		class: className,
		rootClassName,
		children,
		orientation,
		prefixCls: customizePrefixCls,
		separator,
		style,
		vertical,
		wrap = false,
		classes,
		styles,
		...restProps
	} = props;

	const sizes = createMemo(() =>
		Array.isArray(size) ? size : ([size, size] as const),
	);
	const isPresetVerticalSize = createMemo(() => isPresetSize(sizes()[1]));
	const isPresetHorizontalSize = createMemo(() => isPresetSize(sizes()[0]));
	const isValidVerticalSize = createMemo(() => isValidGapNumber(sizes()[1]));
	const isValidHorizontalSize = createMemo(() => isValidGapNumber(sizes()[0]));

	const [mergedOrientation, mergedVertical] = useOrientation(
		orientation,
		vertical,
	);

	const mergedAlign = createMemo(() =>
		align === undefined && !mergedVertical() ? "center" : align,
	);

	const prefixCls = getPrefixCls("space", customizePrefixCls);

	const [hashId, cssVarCls] = useStyle(prefixCls);

	// =========== Merged Props for Semantic ==========
	const mergedProps: SpaceProps = {
		...props,
		size,
		orientation: mergedOrientation(),
		align: mergedAlign(),
	};

	const [mergedClassNames, mergedStyles] = useMergeSemantic<
		SpaceClassNamesType,
		SpaceStylesType,
		SpaceProps
	>([contextClassNames, classes], [contextStyles, styles], {
		props: mergedProps,
	});

	const rootClassNames = createMemo(() => {
		return clsx(
			prefixCls,
			contextClassName,
			hashId,
			`${prefixCls}-${mergedOrientation()}`,
			{
				[`${prefixCls}-rtl`]: directionConfig === "rtl",
				[`${prefixCls}-align-${mergedAlign}`]: mergedAlign,
				[`${prefixCls}-gap-row-${sizes()[1]}`]: isPresetVerticalSize(),
				[`${prefixCls}-gap-col-${sizes()[0]}`]: isPresetHorizontalSize(),
			},
			className,
			rootClassName,
			cssVarCls,
			mergedClassNames().root,
		);
	});

	const itemClassName = createMemo(() =>
		clsx(`${prefixCls}-item`, mergedClassNames().item),
	);

	const childNodes = solidChildren(() => children);

	const memoizedSpaceContext = createMemo<SpaceContextType>(() => {
		const calcLatestIndex = childNodes
			.toArray()
			.reduce<number>(
				(latest, child, i) => (isNonNullable(child) ? i : latest),
				0,
			);
		return { latestIndex: calcLatestIndex };
	});

	const mergedStyle = createMemo<JSX.CSSProperties>(() => {
		const gapStyle: JSX.CSSProperties = {};

		if (wrap) {
			gapStyle["flex-wrap"] = "wrap";
		}

		if (!isPresetHorizontalSize() && isValidHorizontalSize()) {
			gapStyle["column-gap"] = `${sizes()[0]}px`;
		}

		if (!isPresetVerticalSize() && isValidVerticalSize()) {
			gapStyle["row-gap"] = `${sizes()[1]}px`;
		}

		return { ...gapStyle, ...mergedStyles().root, ...contextStyle, ...style };
	});

	return (
		<div class={rootClassNames()} style={mergedStyle()} {...restProps}>
			<SpaceContextProvider value={memoizedSpaceContext()}>
				<Index each={childNodes.toArray()}>
					{(child, i) => (
						<Item
							prefix={prefixCls}
							classes={mergedClassNames()}
							styles={mergedStyles()}
							class={itemClassName()}
							index={i}
							separator={separator}
							style={mergedStyles().item}
						>
							{child()}
						</Item>
					)}
				</Index>
			</SpaceContextProvider>
		</div>
	);
};

type CompoundedComponent = typeof InternalSpace & {
	Compact: typeof Compact;
	Addon: typeof Addon;
};

const Space = InternalSpace as CompoundedComponent;

Space.Compact = Compact;
Space.Addon = Addon;

export default Space;
