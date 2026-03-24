import {
	StyleContext as CssInJsStyleContext,
	createTheme,
} from "@antd-solidjs/cssinjs";
import { IconProvider } from "@antd-solidjs/icons/dist/components/Context";
import type { Component, JSX } from "solid-js";
import { createMemo, useContext } from "solid-js";
// import MotionWrapper from './MotionWrapper';
import type { SizeType } from "../_type";
import type { WarningContextProps } from "../_util/warning";
import warning, { WarningContext } from "../_util/warning";
import type { Locale } from "../locale";
import LocaleProvider, { ANT_MARK } from "../locale";
import type { LocaleContextProps } from "../locale/context";
import LocaleContext from "../locale/context";
import defaultLocale from "../locale/en_US";
import { DesignTokenContext, defaultTheme } from "../theme/context";
import defaultSeedToken from "../theme/themes/seed";
import type {
	ComponentStyleConfig,
	ConfigConsumerProps,
	CSPConfig,
	DirectionType,
	EmptyConfig,
	SpaceConfig,
	ThemeConfig,
	Variant,
} from "./context";
import {
	ConfigContext,
	defaultIconPrefixCls,
	defaultPrefixCls,
	Variants,
} from "./context";
import { DisabledContextProvider } from "./DisabledContext";
import type { RenderEmptyHandler } from "./defaultRenderEmpty";
import useConfig from "./hooks/useConfig";
import useTheme from "./hooks/useTheme";
import { SizeContextProvider } from "./SizeContext";
import useStyle from "./style";

/**
 * This component registers icon styles inside the DesignTokenContext.Provider
 * so that CSS variables use the correct cssVar key from the theme config.
 */
const IconStyle: Component<{ iconPrefixCls: string; csp?: CSPConfig }> = ({
	iconPrefixCls,
	csp,
}) => {
	useStyle(iconPrefixCls, csp);
	return null;
};

export type { Variant };

export { Variants };

/**
 * Since too many feedback using static method like `Modal.confirm` not getting theme, we record the
 * theme register info here to help developer get warning info.
 */
let existThemeConfig = false;

export const warnContext: (componentName: string) => void =
	process.env.NODE_ENV !== "production"
		? (componentName: string) => {
				warning(
					!existThemeConfig,
					componentName,
					`Static function can not consume context like dynamic theme. Please use 'App' component instead.`,
				);
			}
		: /* istanbul ignore next */
			null!;

export {
	type ConfigConsumerProps,
	ConfigContext,
	type CSPConfig,
	defaultIconPrefixCls,
	defaultPrefixCls,
	type DirectionType,
	type RenderEmptyHandler,
	type ThemeConfig,
};

export const configConsumerProps = [
	"getTargetContainer",
	"getPopupContainer",
	"rootPrefixCls",
	"getPrefixCls",
	"renderEmpty",
	"csp",
	"locale",
];

// These props is used by `useContext` directly in sub component
const PASSED_PROPS: Exclude<
	keyof ConfigConsumerProps,
	"rootPrefixCls" | "getPrefixCls" | "warning"
>[] = [
	"getTargetContainer",
	"getPopupContainer",
	"renderEmpty",
	// TODO: 这里需要补充缺失的组件
	// 'input',
	// 'pagination',
	// 'form',
	// 'select',
	// 'button',
];

export interface ConfigProviderProps {
	getTargetContainer?: () => HTMLElement | Window | ShadowRoot;
	getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot;
	prefixCls?: string;
	iconPrefixCls?: string;
	children?: JSX.Element;
	renderEmpty?: RenderEmptyHandler;
	csp?: CSPConfig;
	variant?: Variant;
	// form?: FormConfig;
	// input?: InputConfig;
	// inputSearch?: InputSearchConfig;
	// otp?: OTPConfig;
	// inputNumber?: InputNumberConfig;
	// textArea?: TextAreaConfig;
	// select?: SelectConfig;
	// pagination?: PaginationConfig;
	/**
	 * @descCN 语言包配置，语言包可到 `antd/locale` 目录下寻找。
	 * @descEN Language package setting, you can find the packages in `antd/locale`.
	 */
	locale?: Locale;
	componentSize?: SizeType;
	componentDisabled?: boolean;
	/**
	 * @descCN 设置布局展示方向。
	 * @descEN Set direction of layout.
	 * @default ltr
	 */
	direction?: DirectionType;
	space?: SpaceConfig;
	splitter?: ComponentStyleConfig;
	/**
	 * @descCN 设置 `false` 时关闭虚拟滚动。
	 * @descEN Close the virtual scrolling when setting `false`.
	 * @default true
	 */
	virtual?: boolean;
	popupMatchSelectWidth?: boolean;
	// popupOverflow?: PopupOverflow;
	theme?: ThemeConfig;
	warning?: WarningContextProps;
	// alert?: AlertConfig;
	affix?: ComponentStyleConfig;
	anchor?: ComponentStyleConfig;
	app?: ComponentStyleConfig;
	// button?: ButtonConfig;
	calendar?: ComponentStyleConfig;
	carousel?: ComponentStyleConfig;
	// cascader?: CascaderConfig;
	// treeSelect?: TreeSelectConfig;
	// collapse?: CollapseConfig;
	divider?: ComponentStyleConfig;
	// drawer?: DrawerConfig;
	typography?: ComponentStyleConfig;
	// skeleton?: SkeletonConfig;
	// spin?: SpinConfig;
	segmented?: ComponentStyleConfig;
	statistic?: ComponentStyleConfig;
	steps?: ComponentStyleConfig;
	// image?: ImageConfig;
	layout?: ComponentStyleConfig;
	// list?: ListConfig;
	// mentions?: MentionsConfig;
	// modal?: ModalConfig;
	// progress?: ProgressConfig;
	result?: ComponentStyleConfig;
	slider?: ComponentStyleConfig;
	// masonry?: MasonryConfig;
	// breadcrumb?: BreadcrumbConfig;
	// menu?: MenuConfig;
	// floatButton?: FloatButtonConfig;
	// floatButtonGroup?: FloatButtonGroupConfig;
	// checkbox?: CheckboxConfig;
	descriptions?: ComponentStyleConfig;
	empty?: EmptyConfig;
	// badge?: BadgeConfig;
	// radio?: RadioConfig;
	rate?: ComponentStyleConfig;
	// ribbon?: RibbonConfig;
	// switch?: SwitchStyleConfig;
	// transfer?: TransferConfig;
	avatar?: ComponentStyleConfig;
	// message?: MessageConfig;
	// tag?: TagConfig;
	// table?: TableConfig;
	// card?: CardConfig;
	// cardMeta?: CardMetaConfig;
	// tabs?: TabsConfig;
	timeline?: ComponentStyleConfig;
	// timePicker?: TimePickerConfig;
	// upload?: UploadConfig;
	// notification?: NotificationConfig;
	tree?: ComponentStyleConfig;
	// colorPicker?: ColorPickerConfig;
	// datePicker?: DatePickerConfig;
	// rangePicker?: RangePickerConfig;
	// dropdown?: DropdownConfig;
	// flex?: FlexConfig;
	/**
	 * Wave is special component which only patch on the effect of component interaction.
	 */
	// wave?: WaveConfig;
	// tour?: TourConfig;
	// tooltip?: TooltipConfig;
	// popover?: PopoverConfig;
	// popconfirm?: PopconfirmConfig;
	watermark?: ComponentStyleConfig;
	// qrcode?: QRcodeConfig;
}

interface ProviderChildrenProps extends ConfigProviderProps {
	parentContext: ConfigConsumerProps;
	legacyLocale: Locale;
}

type holderRenderType = (children: JSX.Element) => JSX.Element;

let globalPrefixCls: string;
let globalIconPrefixCls: string;
let globalTheme: ThemeConfig;
let globalHolderRender: holderRenderType | undefined;

function getGlobalPrefixCls() {
	return globalPrefixCls || defaultPrefixCls;
}

function getGlobalIconPrefixCls() {
	return globalIconPrefixCls || defaultIconPrefixCls;
}

export interface GlobalConfigProps {
	prefixCls?: string;
	iconPrefixCls?: string;
	theme?: ThemeConfig;
	holderRender?: holderRenderType;
}

const setGlobalConfig = (props: GlobalConfigProps) => {
	const { prefixCls, iconPrefixCls, theme, holderRender } = props;
	if (prefixCls !== undefined) {
		globalPrefixCls = prefixCls;
	}
	if (iconPrefixCls !== undefined) {
		globalIconPrefixCls = iconPrefixCls;
	}
	if ("holderRender" in props) {
		globalHolderRender = holderRender;
	}

	if (theme) {
		globalTheme = theme;
	}
};

export const globalConfig = () => ({
	getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => {
		if (customizePrefixCls) {
			return customizePrefixCls;
		}
		return suffixCls
			? `${getGlobalPrefixCls()}-${suffixCls}`
			: getGlobalPrefixCls();
	},
	getIconPrefixCls: getGlobalIconPrefixCls,
	getRootPrefixCls: () => {
		// If Global prefixCls provided, use this
		if (globalPrefixCls) {
			return globalPrefixCls;
		}

		// Fallback to default prefixCls
		return getGlobalPrefixCls();
	},
	getTheme: () => globalTheme,
	holderRender: globalHolderRender,
});

const ProviderChildren: Component<ProviderChildrenProps> = (props) => {
	const {
		children,
		csp: customCsp,
		locale,
		componentSize,
		parentContext,
		iconPrefixCls: customIconPrefixCls,
		theme,
		componentDisabled,
	} = props;

	// =================================== Context ===================================
	const getPrefixCls = (suffixCls: string, customizePrefixCls?: string) => {
		const { prefixCls } = props;

		if (customizePrefixCls) {
			return customizePrefixCls;
		}

		const mergedPrefixCls = prefixCls || parentContext.getPrefixCls("");

		return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
	};

	const prefixCls = createMemo(() => getPrefixCls(""));
	const iconPrefixCls = createMemo(
		() =>
			customIconPrefixCls ||
			parentContext.iconPrefixCls ||
			defaultIconPrefixCls,
	);
	const csp = createMemo(() => customCsp || parentContext.csp);

	const mergedTheme = useTheme(theme, parentContext.theme, {
		prefixCls: prefixCls(),
	});

	if (process.env.NODE_ENV !== "production") {
		existThemeConfig = existThemeConfig || !!mergedTheme();
	}

	const memoConfig = createMemo(() => {
		const baseConfig = {
			csp: csp(),
			getPrefixCls,
			theme: mergedTheme(),
			direction: props.direction,
			locale: props.locale || props.legacyLocale,
			space: props.space,
		};

		const config: ConfigConsumerProps = {
			...parentContext,
		};

		(Object.keys(baseConfig) as (keyof typeof baseConfig)[]).forEach((key) => {
			if (baseConfig[key] !== undefined) {
				(config as any)[key] = baseConfig[key];
			}
		});

		// Pass the props used by `useContext` directly with child component.
		// These props should merged into `config`.
		PASSED_PROPS.forEach((propName) => {
			const propValue = props[propName];
			if (propValue) {
				(config as any)[propName] = propValue;
			}
		});

		return config;
	});

	const { layer } = useContext(CssInJsStyleContext);

	const memoIconContextValue = createMemo(() => ({
		prefixCls: iconPrefixCls(),
		csp: csp(),
		layer: layer ? "antd" : undefined,
	}));

	let childNode = (
		<>
			<IconStyle iconPrefixCls={iconPrefixCls()} csp={csp()} />
			{children}
		</>
	);

	// const validateMessages = React.useMemo(
	//   () =>
	//     merge(
	//       defaultLocale.Form?.defaultValidateMessages || {},
	//       memoedConfig.locale?.Form?.defaultValidateMessages || {},
	//       memoedConfig.form?.validateMessages || {},
	//       form?.validateMessages || {},
	//     ),
	//   [memoedConfig, form?.validateMessages],
	// );

	// if (Object.keys(validateMessages).length > 0) {
	//   childNode = (
	//     <ValidateMessagesContext.Provider value={validateMessages}>
	//       {childNode}
	//     </ValidateMessagesContext.Provider>
	//   );
	// }

	if (locale) {
		childNode = (
			<LocaleProvider locale={locale} _ANT_MARK__={ANT_MARK}>
				{childNode}
			</LocaleProvider>
		);
	}

	if (iconPrefixCls() || csp()) {
		childNode = (
			<IconProvider value={memoIconContextValue()}>{childNode}</IconProvider>
		);
	}

	if (componentSize) {
		childNode = (
			<SizeContextProvider size={componentSize}>
				{childNode}
			</SizeContextProvider>
		);
	}

	// =================================== Motion ===================================
	// childNode = <MotionWrapper>{childNode}</MotionWrapper>;

	// // ================================ Tooltip Unique ===============================
	// if (tooltip?.unique) {
	//   childNode = <UniqueProvider>{childNode}</UniqueProvider>;
	// }

	// ================================ Dynamic theme ================================
	const memoTheme = createMemo(() => {
		const { algorithm, token, components, cssVar, ...rest } =
			mergedTheme() || {};
		const themeObj =
			algorithm && (!Array.isArray(algorithm) || algorithm.length > 0)
				? createTheme(algorithm)
				: defaultTheme;

		const parsedComponents: any = {};
		Object.entries(components || {}).forEach(
			([componentName, componentToken]) => {
				const parsedToken: typeof componentToken & {
					theme?: typeof defaultTheme;
				} = {
					...componentToken,
				};
				if ("algorithm" in parsedToken) {
					if (parsedToken.algorithm === true) {
						parsedToken.theme = themeObj;
					} else if (
						Array.isArray(parsedToken.algorithm) ||
						typeof parsedToken.algorithm === "function"
					) {
						parsedToken.theme = createTheme(parsedToken.algorithm);
					}
					delete parsedToken.algorithm;
				}
				parsedComponents[componentName] = parsedToken;
			},
		);

		const mergedToken = {
			...defaultSeedToken,
			...token,
		};

		return {
			...rest,
			theme: themeObj,

			token: mergedToken,
			components: parsedComponents,
			override: {
				override: mergedToken,
				...parsedComponents,
			},
			cssVar,
		};
	});

	if (theme) {
		childNode = (
			<DesignTokenContext.Provider value={memoTheme()}>
				{childNode}
			</DesignTokenContext.Provider>
		);
	}

	// ================================== Warning ===================================
	if (memoConfig().warning) {
		childNode = (
			<WarningContext.Provider value={memoConfig().warning!}>
				{childNode}
			</WarningContext.Provider>
		);
	}

	// =================================== Render ===================================
	if (componentDisabled !== undefined) {
		childNode = (
			<DisabledContextProvider disabled={componentDisabled}>
				{childNode}
			</DisabledContextProvider>
		);
	}

	return (
		<ConfigContext.Provider value={memoConfig()}>
			{childNode}
		</ConfigContext.Provider>
	);
};

const ConfigProvider: Component<ConfigProviderProps> & {
	/** @private internal Usage. do not use in your production */
	ConfigContext: typeof ConfigContext;
	config: typeof setGlobalConfig;
	useConfig: typeof useConfig;
} = (props) => {
	const context = useContext<ConfigConsumerProps>(ConfigContext);
	const antLocale = useContext<LocaleContextProps | undefined>(LocaleContext);
	return (
		<ProviderChildren
			parentContext={context}
			legacyLocale={antLocale!}
			{...props}
		/>
	);
};

ConfigProvider.ConfigContext = ConfigContext;
ConfigProvider.config = setGlobalConfig;
ConfigProvider.useConfig = useConfig;

export default ConfigProvider;
