import { createSignal } from "solid-js";

interface MyButtonProps {
	type?: "primary";
}

export function MyButton({ type }: MyButtonProps) {
	const [count, setCount] = createSignal(0);
	return (
		<button
			type="button"
			class="my-button"
			onClick={() => setCount(count() + 1)}
		>
			my button
			<br /> type: {type}
			<br /> count: {count()}
		</button>
	);
}
