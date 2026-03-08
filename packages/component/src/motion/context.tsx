import type { ParentComponent } from "solid-js";
import { createContext, createMemo } from "solid-js";

interface MotionContextProps {
	motion?: boolean;
}

export const Context = createContext<MotionContextProps>({});

const MotionProvider: ParentComponent<MotionContextProps> = (props) => {
	const { children, ...rest } = props;

	const memoizedValue = createMemo<MotionContextProps>(() => {
		return { motion: rest.motion };
	});

	return (
		<Context.Provider value={memoizedValue()}>{children}</Context.Provider>
	);
};

export default MotionProvider;
