import type { Ref } from "@solid-primitives/refs";
import type { Component, JSX } from "solid-js";
import { createEffect, For, mergeProps, Show, splitProps } from "solid-js";
import { createStore, reconcile, unwrap } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import type { CSSMotionProps } from "./CSSMotion";
import OriginCSSMotion from "./CSSMotion";
import type { KeyObject } from "./utils/diff";
import {
	diffKeys,
	parseKeys,
	STATUS_ADD,
	STATUS_KEEP,
	STATUS_REMOVE,
	STATUS_REMOVED,
} from "./utils/diff";
import { supportTransition } from "./utils/motion";

const MOTION_PROP_NAMES = [
	"eventProps",
	"visible",
	"children",
	"motionName",
	"motionAppear",
	"motionEnter",
	"motionLeave",
	"motionLeaveImmediately",
	"motionDeadline",
	"removeOnLeave",
	"leavedClassName",
	"onAppearPrepare",
	"onAppearStart",
	"onAppearActive",
	"onAppearEnd",
	"onEnterStart",
	"onEnterActive",
	"onEnterEnd",
	"onLeaveStart",
	"onLeaveActive",
	"onLeaveEnd",
] as const;

export interface CSSMotionListProps
	extends Omit<CSSMotionProps, "onVisibleChanged" | "children">,
		Omit<JSX.HTMLAttributes<any>, "children" | "ref"> {
	keys: (string | number | { key: string | number; [name: string]: any })[];
	component?: string | Component | false;

	/** This will always trigger after final visible changed. Even if no motion configured. */
	onVisibleChanged?: (visible: boolean, info: { key: string | number }) => void;
	/** All motion leaves in the screen */
	onAllRemoved?: () => void;
	children?: (props: {
		visible?: boolean;
		className?: string;
		style?: JSX.CSSProperties;
		index?: number;
		ref: Ref<any>;
		[key: string]: any;
	}) => JSX.Element;
}

export interface CSSMotionListState {
	keyEntities: KeyObject[];
}

/**
 * Generate a CSSMotionList component with config
 * @param transitionSupport No need since CSSMotionList no longer depends on transition support
 * @param CSSMotion CSSMotion component
 */
export function genCSSMotionList(
	transitionSupport: boolean,
	CSSMotion = OriginCSSMotion,
): Component<CSSMotionListProps> {
	const CSSMotionList: Component<CSSMotionListProps> = (props) => {
		const mergedProps = mergeProps({ component: "div" }, props);
		const [state, setState] = createStore<CSSMotionListState>({
			keyEntities: [],
		});

		createEffect(() => {
			const parsedKeyObjects = parseKeys(mergedProps.keys);
			const mixedKeyEntities = diffKeys(
				unwrap(state.keyEntities),
				parsedKeyObjects,
			);

			const nextEntities = mixedKeyEntities.filter((entity) => {
				const prevEntity = state.keyEntities.find(
					({ key }) => entity.key === key,
				);

				// Remove if already mark as removed
				if (
					prevEntity &&
					prevEntity.status === STATUS_REMOVED &&
					entity.status === STATUS_REMOVE
				) {
					return false;
				}
				return true;
			});

			setState("keyEntities", reconcile(nextEntities));
		});

		const removeKey = (removeKey: string | number) => {
			setState(
				"keyEntities",
				(entity) => entity.key === removeKey,
				"status",
				STATUS_REMOVED,
			);

			const restKeysCount = state.keyEntities.filter(
				({ status }) => status !== STATUS_REMOVED,
			).length;

			if (restKeysCount === 0 && mergedProps.onAllRemoved) {
				mergedProps.onAllRemoved();
			}
		};

		return (
			<Show
				when={mergedProps.component}
				fallback={
					<For each={state.keyEntities}>
						{(item, index) => {
							const { status, ...eventProps } = item;
							const visible = status === STATUS_ADD || status === STATUS_KEEP;

							const [motionProps] = splitProps(mergedProps, MOTION_PROP_NAMES);

							return (
								<CSSMotion
									{...motionProps}
									visible={visible}
									eventProps={eventProps}
									onVisibleChanged={(changedVisible) => {
										mergedProps.onVisibleChanged?.(changedVisible, {
											key: eventProps.key,
										});

										if (!changedVisible) {
											removeKey(eventProps.key);
										}
									}}
								>
									{(props) =>
										mergedProps.children?.({ ...props, index: index() })
									}
								</CSSMotion>
							);
						}}
					</For>
				}
			>
				<Dynamic<any>
					component={mergedProps.component}
					{...splitProps(mergedProps, [
						...MOTION_PROP_NAMES,
						"keys",
						"component",
						"children",
						"onVisibleChanged",
						"onAllRemoved",
					])[1]}
				>
					<For each={state.keyEntities}>
						{(item, index) => {
							const { status, ...eventProps } = item;
							const visible = status === STATUS_ADD || status === STATUS_KEEP;

							const [motionProps] = splitProps(mergedProps, MOTION_PROP_NAMES);

							return (
								<CSSMotion
									{...motionProps}
									visible={visible}
									eventProps={eventProps}
									onVisibleChanged={(changedVisible) => {
										mergedProps.onVisibleChanged?.(changedVisible, {
											key: eventProps.key,
										});

										if (!changedVisible) {
											removeKey(eventProps.key);
										}
									}}
								>
									{(props) =>
										mergedProps.children?.({ ...props, index: index() })
									}
								</CSSMotion>
							);
						}}
					</For>
				</Dynamic>
			</Show>
		);
	};

	return CSSMotionList;
}

export default genCSSMotionList(supportTransition);
