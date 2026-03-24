import { getDOM } from "@antd-solidjs/util/dom/findDOMNode";
import { mergeRefs, type Ref } from "@solid-primitives/refs";
import { clsx } from "clsx";
import type { Component, JSX } from "solid-js";
import { createEffect, createMemo, mergeProps, useContext } from "solid-js";

import { Context } from "./context";
import useStatus from "./hooks/useStatus";
import { isActive } from "./hooks/useStepQueue";
import type {
	MotionEndEventHandler,
	MotionEventHandler,
	MotionName,
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
		const mergedProps = mergeProps(
			{ visible: true, removeOnLeave: true },
			props,
		);

		const { motion: contextMotion } = useContext(Context);

		const supportMotion = createMemo(() =>
			isSupportTransition(mergedProps, contextMotion),
		);

		// Ref to the react node, it may be a HTMLElement
		let nodeRef: any;
		const setNodeRef: Ref<any> = (element) => {
			nodeRef = element;
		};
		const mergedNodeRef = mergeRefs(mergedProps.internalRef, setNodeRef);

		function getDomElement() {
			return getDOM(nodeRef) as HTMLElement;
		}

		const [getStatus, getStep, getStyle, getMergedVisible, getStyleReady] =
			useStatus(
				supportMotion,
				() => mergedProps.visible,
				getDomElement,
				mergedProps,
			);

		// Record whether content has rendered
		// Will return null for un-rendered even when `removeOnLeave={false}`
		let renderedRef = false;
		createEffect(() => {
			if (getMergedVisible()) {
				renderedRef = true;
			}
		});

		// ====================== Refs ======================
		const refObj = {} as CSSMotionRef;
		Object.defineProperties(refObj, {
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
				get: () => () => supportMotion(),
			},
		});

		// We lock `deps` here since function return object
		// will repeat trigger ref from `refConfig` -> `null` -> `refConfig`
		createEffect(() => {
			const ref = mergedProps.ref;
			if (typeof ref === "function") {
				ref(refObj);
			}
		});

		// ===================== Render =====================
		// We should render children when motionStyle is sync with stepStatus
		const styleReady = getStyleReady();
		if (styleReady === "NONE") {
			return null;
		}

		let motionChildren: JSX.Element;
		const mergedChildrenProps = {
			...(mergedProps.eventProps || {}),
			visible: mergedProps.visible,
		};
		const status = getStatus();
		const statusStep = getStep();
		const statusStyle = getStyle();
		const mergedVisible = getMergedVisible();

		if (!mergedProps.children) {
			// No children
			motionChildren = null;
		} else if (status === STATUS_NONE) {
			// Stable children
			if (mergedVisible) {
				motionChildren = mergedProps.children({
					...mergedChildrenProps,
					ref: mergedNodeRef,
				});
			} else if (
				!mergedProps.removeOnLeave &&
				renderedRef &&
				mergedProps.leavedClassName
			) {
				motionChildren = mergedProps.children({
					...mergedChildrenProps,
					className: mergedProps.leavedClassName,
					ref: mergedNodeRef,
				});
			} else if (
				mergedProps.forceRender ||
				(!mergedProps.removeOnLeave && !mergedProps.leavedClassName)
			) {
				motionChildren = mergedProps.children({
					...mergedChildrenProps,
					style: { display: "none" },
					ref: mergedNodeRef,
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
				mergedProps.motionName,
				`${status}-${statusSuffix}`,
			);

			motionChildren = mergedProps.children({
				...mergedChildrenProps,
				className: clsx(getTransitionName(mergedProps.motionName, status), {
					[motionCls]: motionCls && statusSuffix,
					[mergedProps.motionName as string]:
						typeof mergedProps.motionName === "string",
				}),
				style: statusStyle,
				ref: mergedNodeRef,
			});
		}

		return motionChildren;
	};

	return CSSMotion;
}

export default genCSSMotion(supportTransition);
