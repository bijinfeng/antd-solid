import { type Context, createContext, type JSX, useContext } from "solid-js";
import Entity from "./Cache";

export interface StyleContextProps {
	cache: Entity;
	defaultCache: boolean;
	hashPriority?: "low" | "high";
	container?: Element | ShadowRoot;
}

export const StyleContext: Context<StyleContextProps> =
	createContext<StyleContextProps>({
		cache: new Entity("cssinjs-default"),
		defaultCache: true,
		hashPriority: "low",
	});

export const StyleProvider = (props: {
	children: JSX.Element;
	cache?: Entity;
	hashPriority?: "low" | "high";
	container?: Element | ShadowRoot;
}): JSX.Element => {
	const parentContext = useContext(StyleContext);

	const contextValue: StyleContextProps = {
		cache: props.cache || parentContext.cache,
		defaultCache: !props.cache && parentContext.defaultCache,
		hashPriority: props.hashPriority || parentContext.hashPriority,
		container: props.container || parentContext.container,
	};

	return (
		<StyleContext.Provider value={contextValue}>
			{props.children}
		</StyleContext.Provider>
	);
};

export const useStyleContext = (): StyleContextProps =>
	useContext(StyleContext);
