import { clsx } from "clsx";
import type { Component, JSX, ParentComponent } from "solid-js";
import {
	createContext,
	createMemo,
	Index,
	children as resolveChildren,
	Show,
	useContext,
} from "solid-js";

import type { SizeType } from "../_type";
import type { Orientation } from "../_util/hooks";
import { useOrientation } from "../_util/hooks";
import type { DirectionType } from "../config-provider";
import { ConfigContext } from "../config-provider";
import useSize from "../config-provider/hooks/useSize";
import useStyle from "./style/compact";

export interface SpaceCompactItemContextType {
	compactSize?: SizeType;
	compactDirection?: "horizontal" | "vertical";
	isFirstItem?: boolean;
	isLastItem?: boolean;
}

export const SpaceCompactItemContext =
	createContext<SpaceCompactItemContextType | null>(null);

export const useCompactItemContext = (
	prefixCls: string,
	direction: DirectionType,
) => {
	const compactItemContext = useContext(SpaceCompactItemContext);

	const compactItemClassnames = createMemo<string>(() => {
		if (!compactItemContext) {
			return "";
		}
		const { compactDirection, isFirstItem, isLastItem } = compactItemContext;
		const separator = compactDirection === "vertical" ? "-vertical-" : "-";

		return clsx(`${prefixCls}-compact${separator}item`, {
			[`${prefixCls}-compact${separator}first-item`]: isFirstItem,
			[`${prefixCls}-compact${separator}last-item`]: isLastItem,
			[`${prefixCls}-compact${separator}item-rtl`]: direction === "rtl",
		});
	});

	return {
		compactSize: compactItemContext?.compactSize,
		compactDirection: compactItemContext?.compactDirection,
		compactItemClassnames,
	};
};

export const NoCompactStyle: ParentComponent = (props) => {
	const { children } = props;
	return (
		<SpaceCompactItemContext.Provider value={null}>
			{children}
		</SpaceCompactItemContext.Provider>
	);
};

export interface SpaceCompactProps extends JSX.HTMLAttributes<HTMLDivElement> {
	prefixCls?: string;
	size?: SizeType;
	orientation?: Orientation;
	vertical?: boolean;
	block?: boolean;
	rootClassName?: string;
}

const CompactItem: ParentComponent<SpaceCompactItemContextType> = (props) => {
	const { children, ...others } = props;

	const value = createMemo(() => others);

	return (
		<SpaceCompactItemContext.Provider value={value()}>
			{children}
		</SpaceCompactItemContext.Provider>
	);
};

const Compact: Component<SpaceCompactProps> = (props) => {
	const { getPrefixCls, direction: directionConfig } =
		useContext(ConfigContext);
	const compactItemContext = useContext(SpaceCompactItemContext);

	const {
		size,
		orientation,
		block,
		prefixCls: customizePrefixCls,
		rootClassName,
		children,
		vertical,
		...restProps
	} = props;

	const [mergedOrientation, mergedVertical] = useOrientation(
		orientation,
		vertical,
	);
	const mergedSize = useSize((ctx) => size ?? ctx);

	const prefixCls = getPrefixCls("space-compact", customizePrefixCls);
	const [hashId] = useStyle(prefixCls);

	const clx = createMemo(() =>
		clsx(
			prefixCls,
			hashId,
			{
				[`${prefixCls}-rtl`]: directionConfig === "rtl",
				[`${prefixCls}-block`]: block,
				[`${prefixCls}-vertical`]: mergedVertical(),
			},
			restProps.class,
			rootClassName,
		),
	);

	const resolved = resolveChildren(() => children);

	return (
		<Show when={resolved.toArray().length > 0}>
			<div {...restProps} class={clx()}>
				<Index each={resolved.toArray()}>
					{(child, i) => (
						<CompactItem
							compactSize={mergedSize()}
							compactDirection={mergedOrientation()}
							isFirstItem={
								i === 0 &&
								(!compactItemContext || compactItemContext?.isFirstItem)
							}
							isLastItem={
								i === resolved.toArray().length - 1 &&
								(!compactItemContext || compactItemContext?.isLastItem)
							}
						>
							{child()}
						</CompactItem>
					)}
				</Index>
			</div>
		</Show>
	);
};

export default Compact;
