import { createContext, useContext, type JSX, type Component } from 'solid-js'

/**
 * Note: `middle` is deprecated and will be removed in v7, please use `medium` instead.
 */
export type SizeType = 'small' | 'medium' | 'middle' | 'large' | undefined;

const SizeContext = createContext<SizeType>(undefined);

export interface SizeContextProps {
  size?: SizeType;
  children?: JSX.Element;
}

export const SizeContextProvider: Component<SizeContextProps> = ({ children, size }) => {
  const originSize = useContext<SizeType>(SizeContext);
  return <SizeContext.Provider value={size || originSize}>{children}</SizeContext.Provider>;
};

export default SizeContext;
