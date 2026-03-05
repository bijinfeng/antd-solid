import type { JSX, Component } from 'solid-js'
import { createContext, useContext } from 'solid-js'

const DisabledContext = createContext<boolean>(false);

export interface DisabledContextProps {
  disabled?: boolean;
  children?: JSX.Element;
}

export const DisabledContextProvider: Component<DisabledContextProps> = ({ children, disabled }) => {
  const originDisabled = useContext(DisabledContext);
  return (
    <DisabledContext.Provider value={disabled ?? originDisabled}>
      {children}
    </DisabledContext.Provider>
  );
};

export default DisabledContext;
