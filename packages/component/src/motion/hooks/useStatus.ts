import type { JSX } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import type { CSSMotionProps } from "../CSSMotion";
import type {
	MotionEvent,
	MotionEventHandler,
	MotionPrepareEventHandler,
	MotionStatus,
	StepStatus,
} from "../interface";
import {
	STATUS_APPEAR,
	STATUS_ENTER,
	STATUS_LEAVE,
	STATUS_NONE,
	STEP_ACTIVE,
	STEP_PREPARE,
	STEP_PREPARED,
	STEP_START,
} from "../interface";
import useDomMotionEvents from "./useDomMotionEvents";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";
import useStepQueue, { DoStep, isActive, SkipStep } from "./useStepQueue";

export default function useStatus(
	supportMotion: () => boolean,
	visible: () => boolean,
	getElement: () => HTMLElement,
	props: CSSMotionProps,
): [
	status: () => MotionStatus,
	stepStatus: () => StepStatus,
	style: () => JSX.CSSProperties,
	visible: () => boolean,
	styleReady: () => "NONE" | boolean,
] {
	// Used for outer render usage to avoid `visible: false & status: none` to render nothing
	const [asyncVisible, setAsyncVisible] = createSignal<boolean>();
	const [getStatus, setStatus] = createSignal<MotionStatus>(STATUS_NONE);
	const [style, setStyle] = createSignal<
		[style: JSX.CSSProperties | undefined | null, step: StepStatus | null]
	>([null, null]);
	const [mounted, setMounted] = createSignal(false);

	let deadlineId: ReturnType<typeof setTimeout> | null = null;

	// =========================== Dom Node ===========================
	function getDomElement() {
		return getElement();
	}

	// ========================== Motion End ==========================
	let activeRef = false;

	/**
	 * Clean up status & style
	 */
	function updateMotionEndStatus() {
		setStatus(STATUS_NONE);
		setStyle([null, null]);
	}

	const onInternalMotionEnd = (event: MotionEvent) => {
		const status = getStatus();
		// Do nothing since not in any transition status.
		// This may happen when `motionDeadline` trigger.
		if (status === STATUS_NONE) {
			return;
		}

		const element = getDomElement();
		if (event && !event.deadline && event.target !== element) {
			// event exists
			// not initiated by deadline
			// transitionEnd not fired by inner elements
			return;
		}

		const currentActive = activeRef;

		let canEnd: boolean | void;
		if (status === STATUS_APPEAR && currentActive) {
			canEnd = props.onAppearEnd?.(element, event);
		} else if (status === STATUS_ENTER && currentActive) {
			canEnd = props.onEnterEnd?.(element, event);
		} else if (status === STATUS_LEAVE && currentActive) {
			canEnd = props.onLeaveEnd?.(element, event);
		}

		// Only update status when `canEnd` and not destroyed
		if (currentActive && canEnd !== false) {
			updateMotionEndStatus();
		}
	};

	const [patchMotionEvents] = useDomMotionEvents(onInternalMotionEnd);

	// ============================= Step =============================
	const getEventHandlers = (targetStatus: MotionStatus) => {
		switch (targetStatus) {
			case STATUS_APPEAR:
				return {
					[STEP_PREPARE]: props.onAppearPrepare,
					[STEP_START]: props.onAppearStart,
					[STEP_ACTIVE]: props.onAppearActive,
				};

			case STATUS_ENTER:
				return {
					[STEP_PREPARE]: props.onEnterPrepare,
					[STEP_START]: props.onEnterStart,
					[STEP_ACTIVE]: props.onEnterActive,
				};

			case STATUS_LEAVE:
				return {
					[STEP_PREPARE]: props.onLeavePrepare,
					[STEP_START]: props.onLeaveStart,
					[STEP_ACTIVE]: props.onLeaveActive,
				};

			default:
				return {};
		}
	};

	const eventHandlers = createMemo<{
		[STEP_PREPARE]?: MotionPrepareEventHandler;
		[STEP_START]?: MotionEventHandler;
		[STEP_ACTIVE]?: MotionEventHandler;
	}>(() => getEventHandlers(getStatus()));

	const [startStep, step] = useStepQueue(
		getStatus,
		() => !supportMotion(),
		(newStep) => {
			const currentHandlers = eventHandlers();

			// Only prepare step can be skip
			if (newStep === STEP_PREPARE) {
				const onPrepare = currentHandlers[STEP_PREPARE];
				if (!onPrepare) {
					return SkipStep;
				}

				return onPrepare(getDomElement());
			}

			// Rest step is sync update
			if (newStep in currentHandlers) {
				setStyle([
					currentHandlers[newStep]?.(getDomElement(), null) || null,
					newStep,
				]);
			}

			if (newStep === STEP_ACTIVE && getStatus() !== STATUS_NONE) {
				// Patch events when motion needed
				patchMotionEvents(getDomElement());

				const motionDeadline = props.motionDeadline;
				if (motionDeadline > 0) {
					if (deadlineId) {
						clearTimeout(deadlineId);
					}

					deadlineId = setTimeout(() => {
						onInternalMotionEnd({
							deadline: true,
						} as MotionEvent);
					}, motionDeadline);
				}
			}

			if (newStep === STEP_PREPARED) {
				updateMotionEndStatus();
			}

			return DoStep;
		},
	);

	createEffect(() => {
		activeRef = isActive(step());
	});

	// ============================ Status ============================
	let visibleRef: boolean | null = null;
	const motionAppear = () => props.motionAppear ?? true;
	const motionEnter = () => props.motionEnter ?? true;
	const motionLeave = () => props.motionLeave ?? true;
	const motionLeaveImmediately = () => props.motionLeaveImmediately;

	// Update with new status
	useIsomorphicLayoutEffect(() => {
		const nextVisible = visible();

		// When use Suspense, the `visible` will repeat trigger,
		// But not real change of the `visible`, we need to skip it.
		// https://github.com/ant-design/ant-design/issues/44379
		if (mounted() && visibleRef === nextVisible) {
			return;
		}

		setAsyncVisible(nextVisible);

		const isMounted = mounted();
		if (!isMounted) {
			setMounted(true);
		}

		// if (!supportMotion) {
		//   return;
		// }

		let nextStatus: MotionStatus;

		// Appear
		if (!isMounted && nextVisible && motionAppear()) {
			nextStatus = STATUS_APPEAR;
		}

		// Enter
		if (isMounted && nextVisible && motionEnter()) {
			nextStatus = STATUS_ENTER;
		}

		// Leave
		if (
			(isMounted && !nextVisible && motionLeave()) ||
			(!isMounted && motionLeaveImmediately() && !nextVisible && motionLeave())
		) {
			nextStatus = STATUS_LEAVE;
		}

		const nextEventHandlers = getEventHandlers(nextStatus);

		// Update to next status
		if (nextStatus && (supportMotion() || nextEventHandlers[STEP_PREPARE])) {
			setStatus(nextStatus);
			startStep();
		} else {
			// Set back in case no motion but prev status has prepare step
			setStatus(STATUS_NONE);
		}

		visibleRef = nextVisible;
	});

	// ============================ Effect ============================
	// Reset when motion changed
	createEffect(() => {
		const currentStatus = getStatus();
		if (
			// Cancel appear
			(currentStatus === STATUS_APPEAR && !motionAppear()) ||
			// Cancel enter
			(currentStatus === STATUS_ENTER && !motionEnter()) ||
			// Cancel leave
			(currentStatus === STATUS_LEAVE && !motionLeave())
		) {
			setStatus(STATUS_NONE);
		}
	});

	onCleanup(() => {
		setMounted(false);
		if (deadlineId) {
			clearTimeout(deadlineId);
			deadlineId = null;
		}
	});

	// Trigger `onVisibleChanged`
	let firstMountChangeRef = false;
	createEffect(() => {
		// [visible & motion not end] => [!visible & motion end] still need trigger onVisibleChanged
		if (asyncVisible()) {
			firstMountChangeRef = true;
		}

		if (asyncVisible() !== undefined && getStatus() === STATUS_NONE) {
			// Skip first render is invisible since it's nothing changed
			if (firstMountChangeRef || asyncVisible()) {
				props.onVisibleChanged?.(asyncVisible());
			}
			firstMountChangeRef = true;
		}
	});

	// ============================ Styles ============================
	const mergedStyle = createMemo<JSX.CSSProperties>(() => {
		const [currentStyle] = style();
		const currentHandlers = eventHandlers();

		if (currentHandlers[STEP_PREPARE] && step() === STEP_START) {
			return {
				transition: "none",
				...(currentStyle || {}),
			} as JSX.CSSProperties;
		}

		return (currentStyle || null) as JSX.CSSProperties;
	});

	const mergedVisible = createMemo(() => asyncVisible() ?? visible());

	const styleReady = createMemo<"NONE" | boolean>(() => {
		const currentStatus = getStatus();
		const currentStep = step();
		const [, styleStep] = style();

		// Appear Check
		if (
			!mounted() &&
			currentStatus === STATUS_NONE &&
			supportMotion() &&
			motionAppear()
		) {
			return "NONE";
		}

		// Enter or Leave check
		if (currentStep === STEP_START || currentStep === STEP_ACTIVE) {
			return styleStep === currentStep;
		}

		return true;
	});

	return [getStatus, step, mergedStyle, mergedVisible, styleReady];
}
