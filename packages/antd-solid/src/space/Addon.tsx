import { clsx } from "clsx";
import type { JSX, ParentComponent } from "solid-js";
import { createMemo, useContext } from "solid-js";
import type { InputStatus } from "../_util/statusUtils";
import { getStatusClassNames } from "../_util/statusUtils";
import type { Variant } from "../config-provider";
import { ConfigContext } from "../config-provider";
import { useCompactItemContext } from "./Compact";
import useStyle from "./style/addon";

export interface SpaceCompactCellProps
	extends JSX.HTMLAttributes<HTMLDivElement> {
	prefixCls?: string;
	variant?: Variant;
	disabled?: boolean;
	status?: InputStatus;
}

const SpaceAddon: ParentComponent<SpaceCompactCellProps> = (props) => {
	const {
		class: className,
		children,
		style,
		prefixCls: customizePrefixCls,
		variant = "outlined",
		disabled,
		status,
		...restProps
	} = props;
	const { getPrefixCls, direction: directionConfig } =
		useContext(ConfigContext);

	const prefixCls = getPrefixCls("space-addon", customizePrefixCls);
	const [hashId, cssVarCls] = useStyle(prefixCls);
	const { compactItemClassnames, compactSize } = useCompactItemContext(
		prefixCls,
		directionConfig,
	);

	const classes = createMemo(() => {
		const statusCls = getStatusClassNames(prefixCls, status);

		return clsx(
			prefixCls,
			hashId,
			compactItemClassnames(),
			cssVarCls,
			`${prefixCls}-variant-${variant}`,
			statusCls,
			{
				[`${prefixCls}-${compactSize}`]: compactSize,
				[`${prefixCls}-disabled`]: disabled,
			},
			className,
		);
	});

	return (
		<div class={classes()} style={style} {...restProps}>
			{children}
		</div>
	);
};

export default SpaceAddon;
