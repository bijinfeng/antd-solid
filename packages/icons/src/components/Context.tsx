import { type Context, type ContextProviderComponent, createContext } from "solid-js";

export interface IconContextProps {
  prefixCls?: string;
  rootClassName?: string;
  csp?: { nonce?: string };
  layer?: string;
}

const IconContext: Context<IconContextProps> = createContext<IconContextProps>({});

export const IconProvider: ContextProviderComponent<IconContextProps> = IconContext.Provider;

export default IconContext;
