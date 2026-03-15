import { clsx } from "clsx";
import type { Component, JSX } from "solid-js";
import { createSignal } from "solid-js";

import CSSMotion from "../src/motion";
import "./basic.less";

interface DemoState {
	show: boolean;
	forceRender: boolean;
	motionLeaveImmediately: boolean;
	removeOnLeave: boolean;
	hasMotionClassName: boolean;
	prepare: boolean;
}

async function forceDelay(): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, 2000);
	});
}

const App: Component = () => {
	const [state, setState] = createSignal<DemoState>({
		show: true,
		forceRender: false,
		motionLeaveImmediately: false,
		removeOnLeave: true,
		hasMotionClassName: true,
		prepare: false,
	});

	const onTrigger = () => {
		setTimeout(() => {
			setState((prev) => ({ ...prev, show: !prev.show }));
		}, 100);
	};

	const onTriggerDelay = () => {
		setState((prev) => ({ ...prev, prepare: !prev.prepare }));
	};

	const onForceRender = () => {
		setState((prev) => ({ ...prev, forceRender: !prev.forceRender }));
	};

	const onRemoveOnLeave = () => {
		setState((prev) => ({ ...prev, removeOnLeave: !prev.removeOnLeave }));
	};

	const onTriggerClassName = () => {
		setState((prev) => ({
			...prev,
			hasMotionClassName: !prev.hasMotionClassName,
		}));
	};

	const onCollapse = (): JSX.CSSProperties => {
		return { height: 0 };
	};

	const onMotionLeaveImmediately = () => {
		setState((prev) => ({
			...prev,
			motionLeaveImmediately: !prev.motionLeaveImmediately,
		}));
	};

	const skipColorTransition = (_, event) => {
		// CSSMotion support multiple transition.
		// You can return false to prevent motion end when fast transition finished.
		if (event.propertyName === "background-color") {
			return false;
		}
		return true;
	};

	const styleGreen = () => ({
		background: "green",
	});

	return (
		<div>
			<label>
				<input type="checkbox" onChange={onTrigger} checked={state().show} />{" "}
				Show Component
			</label>

			<label>
				<input
					type="checkbox"
					onChange={onTriggerClassName}
					checked={state().hasMotionClassName}
				/>{" "}
				hasMotionClassName
			</label>

			<label>
				<input
					type="checkbox"
					onChange={onForceRender}
					checked={state().forceRender}
				/>{" "}
				forceRender
			</label>

			<label>
				<input
					type="checkbox"
					onChange={onRemoveOnLeave}
					checked={state().removeOnLeave}
				/>{" "}
				removeOnLeave
				{state().removeOnLeave ? "" : " (use leavedClassName)"}
			</label>

			<label>
				<input
					type="checkbox"
					onChange={onTriggerDelay}
					checked={state().prepare}
				/>{" "}
				prepare before motion
			</label>

			<div class="grid">
				<div>
					<h2>With Transition Class</h2>
					<CSSMotion
						visible={state().show}
						forceRender={state().forceRender}
						motionName={state().hasMotionClassName ? "transition" : null}
						removeOnLeave={state().removeOnLeave}
						leavedClassName="hidden"
						onAppearPrepare={state().prepare && forceDelay}
						onEnterPrepare={state().prepare && forceDelay}
						onAppearStart={onCollapse}
						onEnterStart={onCollapse}
						onLeaveActive={onCollapse}
						onEnterEnd={skipColorTransition}
						onLeaveEnd={skipColorTransition}
						onVisibleChanged={(visible) => {
							console.log("Visible Changed:", visible);
						}}
					>
						{({ style, className, ref }) => (
							<div
								ref={ref}
								class={clsx("demo-block", className)}
								style={style}
							/>
						)}
					</CSSMotion>
				</div>

				<div>
					<h2>With Animation Class</h2>
					<CSSMotion
						visible={state().show}
						forceRender={state().forceRender}
						motionName={state().hasMotionClassName ? "animation" : null}
						removeOnLeave={state().removeOnLeave}
						leavedClassName="hidden"
						onLeaveActive={styleGreen}
					>
						{({ style, className }) => (
							<div class={clsx("demo-block", className)} style={style} />
						)}
					</CSSMotion>
				</div>
			</div>

			<div>
				<button type="button" onClick={onMotionLeaveImmediately}>
					motionLeaveImmediately
				</button>

				<div>
					{state().motionLeaveImmediately && (
						<CSSMotion
							visible={false}
							motionName={state().hasMotionClassName ? "transition" : null}
							removeOnLeave={state().removeOnLeave}
							leavedClassName="hidden"
							onLeaveActive={onCollapse}
							motionLeaveImmediately
							onLeaveEnd={skipColorTransition}
						>
							{({ style, className }) => (
								<div class={clsx("demo-block", className)} style={style} />
							)}
						</CSSMotion>
					)}
				</div>
			</div>
		</div>
	);
};

export default App;
