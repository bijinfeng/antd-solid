import { getDOM } from "@antd-solidjs/util/dom/findDOMNode";
import type { Ref } from "@solid-primitives/refs";
import { clsx } from "clsx";
import type { Component, JSX } from "solid-js";
import { createEffect, createMemo, useContext } from "solid-js";

import { Context } from "./context";
import useStatus from "./hooks/useStatus";
import { isActive } from "./hooks/useStepQueue";
import type {
	MotionEndEventHandler,
	MotionEventHandler,
	MotionPrepareEventHandler,
	MotionStatus,
} from "./interface";
import { STATUS_NONE, STEP_PREPARE, STEP_START } from "./interface";
import { getTransitionName, supportTransition } from "./utils/motion";

export interface CSSMotionRef {
	nativeElement: HTMLElement;
	inMotion: () => boolean;
	enableMotion: () => boolean;
}

export type CSSMotionConfig =
	| boolean
	| {
			transitionSupport?: boolean;
	  };

export type MotionName =
	| string
	| {
			appear?: string;
			enter?: string;
			leave?: string;
			appearActive?: string;
			enterActive?: string;
			leaveActive?: string;
	  };

export interface CSSMotionProps {
	motionName?: MotionName;
	visible?: boolean;
	motionAppear?: boolean;
	motionEnter?: boolean;
	motionLeave?: boolean;
	motionLeaveImmediately?: boolean;
	motionDeadline?: number;
	/**
	 * Create element in view even the element is invisible.
	 * Will patch `display: none` style on it.
	 */
	forceRender?: boolean;
	/**
	 * Remove element when motion end. This will not work when `forceRender` is set.
	 */
	removeOnLeave?: boolean;
	leavedClassName?: string;
	/** @private Used by CSSMotionList. Do not use in your production. */
	eventProps?: object;

	// Prepare groups
	/** Prepare phase is used for measure element info. It will always trigger even motion is off */
	onAppearPrepare?: MotionPrepareEventHandler;
	/** Prepare phase is used for measure element info. It will always trigger even motion is off */
	onEnterPrepare?: MotionPrepareEventHandler;
	/** Prepare phase is used for measure element info. It will always trigger even motion is off */
	onLeavePrepare?: MotionPrepareEventHandler;

	// Normal motion groups
	onAppearStart?: MotionEventHandler;
	onEnterStart?: MotionEventHandler;
	onLeaveStart?: MotionEventHandler;

	onAppearActive?: MotionEventHandler;
	onEnterActive?: MotionEventHandler;
	onLeaveActive?: MotionEventHandler;

	onAppearEnd?: MotionEndEventHandler;
	onEnterEnd?: MotionEndEventHandler;
	onLeaveEnd?: MotionEndEventHandler;

	// Special
	/** This will always trigger after final visible changed. Even if no motion configured. */
	onVisibleChanged?: (visible: boolean) => void;

	internalRef?: Ref<any>;
	ref?: Ref<CSSMotionRef>;

	children?: (props: {
		visible?: boolean;
		className?: string;
		style?: JSX.CSSProperties;
		ref: Ref<any>;
		[key: string]: any;
	}) => JSX.Element;
}

export interface CSSMotionState {
	status?: MotionStatus;
	statusActive?: boolean;
	newStatus?: boolean;
	statusStyle?: JSX.CSSProperties;
	prevProps?: CSSMotionProps;
}

/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
export function genCSSMotion(config: CSSMotionConfig) {
	let transitionSupport = config;

	if (typeof config === "object") {
		({ transitionSupport } = config);
	}

	function isSupportTransition(props: CSSMotionProps, contextMotion?: boolean) {
		return !!(props.motionName && transitionSupport && contextMotion !== false);
	}

	const CSSMotion: Component<CSSMotionProps> = (props) => {
		const {
			ref,
			// Default config
			visible = true,
			removeOnLeave = true,

			forceRender,
			children,
			motionName,
			leavedClassName,
			eventProps,
		} = props;

		const { motion: contextMotion } = useContext(Context);

		const supportMotion = isSupportTransition(props, contextMotion);

		// Ref to the react node, it may be a HTMLElement
		let nodeRef: any;

		function getDomElement() {
			return getDOM(nodeRef) as HTMLElement;
		}

		const [getStatus, statusStep, statusStyle, mergedVisible, styleReady] =
			useStatus(supportMotion, visible, getDomElement, props);
		const status = getStatus();

		// Record whether content has rendered
		// Will return null for un-rendered even when `removeOnLeave={false}`
		let renderedRef = mergedVisible;
		if (mergedVisible) {
			renderedRef = true;
		}

		// ====================== Refs ======================
		const refObj = createMemo<CSSMotionRef>(() => {
			const obj = {} as CSSMotionRef;
			Object.defineProperties(obj, {
				nativeElement: {
					enumerable: true,
					get: getDomElement,
				},
				inMotion: {
					enumerable: true,
					get: () => () => getStatus() !== STATUS_NONE,
				},
				enableMotion: {
					enumerable: true,
					get: () => () => supportMotion,
				},
			});
			return obj;
		});

		// We lock `deps` here since function return object
		// will repeat trigger ref from `refConfig` -> `null` -> `refConfig`
		createEffect(() => {
			if (typeof ref === "function") {
				ref(refObj());
			}
		});

		// ===================== Render =====================
		// return motionChildren as React.ReactElement;
		let idRef = 0;
		if (styleReady) {
			idRef += 1;
		}

		// We should render children when motionStyle is sync with stepStatus
		const memoChildren = createMemo(() => {
			if (styleReady === "NONE") {
				return null;
			}

			let motionChildren: JSX.Element;
			const mergedProps = { ...eventProps, visible };

			if (!children) {
				// No children
				motionChildren = null;
			} else if (status === STATUS_NONE) {
				// Stable children
				if (mergedVisible) {
					motionChildren = children({ ...mergedProps, ref: nodeRef });
				} else if (!removeOnLeave && renderedRef && leavedClassName) {
					motionChildren = children({
						...mergedProps,
						className: leavedClassName,
						ref: nodeRef,
					});
				} else if (forceRender || (!removeOnLeave && !leavedClassName)) {
					motionChildren = children({
						...mergedProps,
						style: { display: "none" },
						ref: nodeRef,
					});
				} else {
					motionChildren = null;
				}
			} else {
				// In motion
				let statusSuffix: string;
				if (statusStep === STEP_PREPARE) {
					statusSuffix = "prepare";
				} else if (isActive(statusStep)) {
					statusSuffix = "active";
				} else if (statusStep === STEP_START) {
					statusSuffix = "start";
				}

				const motionCls = getTransitionName(
					motionName,
					`${status}-${statusSuffix}`,
				);

				motionChildren = children({
					...mergedProps,
					className: clsx(getTransitionName(motionName, status), {
						[motionCls]: motionCls && statusSuffix,
						[motionName as string]: typeof motionName === "string",
					}),
					style: statusStyle,
					ref: nodeRef,
				});
			}

			return motionChildren;
		});

		return memoChildren();
	};

	return CSSMotion;
}

export default genCSSMotion(supportTransition);
