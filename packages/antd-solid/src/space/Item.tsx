import clsx from "clsx";
import type { JSX, ParentComponent } from "solid-js";
import { Show, useContext } from "solid-js";

import isNonNullable from "../_util/isNonNullable";
import type { SpaceContextType } from "./context";
import { SpaceContext } from "./context";

export interface ItemProps {
	class: string;
	prefix: string;
	index: number;
	separator?: JSX.Element;
	style?: JSX.CSSProperties;
	classes?: {
		separator?: string;
	};
	styles?: {
		separator?: JSX.CSSProperties;
	};
}

const Item: ParentComponent<ItemProps> = (props) => {
	const {
		class: className,
		prefix,
		index,
		children,
		separator,
		style,
		classes,
		styles,
	} = props;

	const { latestIndex } = useContext<SpaceContextType>(SpaceContext);

	return (
		<Show when={isNonNullable(children)}>
			<div class={className} style={style}>
				{children}
			</div>
			{index < latestIndex && separator && (
				<span
					class={clsx(`${prefix}-item-separator`, classes?.separator)}
					style={styles?.separator}
				>
					{separator}
				</span>
			)}
		</Show>
	);
};

export default Item;
