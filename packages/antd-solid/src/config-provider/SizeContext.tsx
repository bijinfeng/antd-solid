import { type Component, createContext, type JSX, useContext } from "solid-js";

import type { SizeType } from "../_type";

const SizeContext = createContext<SizeType>(undefined);

export interface SizeContextProps {
	size?: SizeType;
	children?: JSX.Element;
}

export const SizeContextProvider: Component<SizeContextProps> = ({
	children,
	size,
}) => {
	const originSize = useContext<SizeType>(SizeContext);
	return (
		<SizeContext.Provider value={size || originSize}>
			{children}
		</SizeContext.Provider>
	);
};

export default SizeContext;
