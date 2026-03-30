import { createSignal } from "solid-js";

import { Space, type SpaceProps } from "../../src";

export function App() {
	const [orientation, setOrientation] =
		createSignal<SpaceProps["orientation"]>();

	return (
		<main>
			<div>orientation: {orientation()}</div>

			<Space orientation={orientation()}>
				Space
				<div>xxx</div>
			</Space>

			<button onClick={() => setOrientation("vertical")} type="button">
				vertical
			</button>
		</main>
	);
}
