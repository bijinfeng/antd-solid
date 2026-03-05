import type { Component } from 'solid-js'
import { devUseWarning } from '../_util/warning';

export interface PropWarningProps {
  dropdownMatchSelectWidth?: boolean;
}

/**
 * Warning for ConfigProviderProps.
 * This will be empty function in production.
 */
const PropWarning: Component<PropWarningProps> = ({ dropdownMatchSelectWidth }) => {
  const warning = devUseWarning('ConfigProvider');

  warning.deprecated(
    dropdownMatchSelectWidth === undefined,
    'dropdownMatchSelectWidth',
    'popupMatchSelectWidth',
  );

  return null;
};

export default process.env.NODE_ENV !== 'production' ? PropWarning : () => null;
