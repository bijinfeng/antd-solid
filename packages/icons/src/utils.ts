import { generate as generateColor } from '@ant-design/colors';
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/lib/types';
import { useContext, onMount, ComponentProps, ValidComponent, Accessor } from "solid-js";
import { createDynamic } from "solid-js/web"
import { updateCSS } from '@antd-solidjs/util/dom/dynamicCSS';
import { getShadowRoot } from '@antd-solidjs/util/dom/shadow';
import { warning as warningOnce } from '@antd-solidjs/util'

import IconContext from './components/Context';

function camelCase(input: string) {
  return input.replace(/-(.)/g, (match, g) => g.toUpperCase());
}

export function warning(valid: boolean, message: string) {
  warningOnce(valid, `[@antd-solidjs/icons] ${message}`);
}

export function isIconDefinition(target: any): target is IconDefinition {
  return (
    typeof target === 'object' &&
    typeof target.name === 'string' &&
    typeof target.theme === 'string' &&
    (typeof target.icon === 'object' || typeof target.icon === 'function')
  );
}

export type Attrs = Record<string, string>;

export function getSecondaryColor(primaryColor: string): string {
  // choose the second color
  return generateColor(primaryColor)[0];
}

export function normalizeTwoToneColors(
  twoToneColor: string | [string, string] | undefined,
): string[] {
  if (!twoToneColor) {
    return [];
  }

  return Array.isArray(twoToneColor) ? twoToneColor : [twoToneColor];
}

// These props make sure that the SVG behaviours like general text.
// Reference: https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4
export const svgBaseProps = {
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  'aria-hidden': 'true',
  focusable: 'false',
};

export const iconStyles = `
.anticon {
  display: inline-flex;
  align-items: center;
  color: inherit;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-transform: none;
  vertical-align: -0.125em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.anticon > * {
  line-height: 1;
}

.anticon svg {
  display: inline-block;
  vertical-align: inherit;
}

.anticon::before {
  display: none;
}

.anticon .anticon-icon {
  display: block;
}

.anticon[tabindex] {
  cursor: pointer;
}

.anticon-spin::before,
.anticon-spin {
  display: inline-block;
  -webkit-animation: loadingCircle 1s infinite linear;
  animation: loadingCircle 1s infinite linear;
}

@-webkit-keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
`;

export const useInsertStyles = (eleRef: Accessor<HTMLElement | undefined>) => {
  const { csp, prefixCls, layer } = useContext(IconContext);
  let mergedStyleStr = iconStyles;

  if (prefixCls) {
    mergedStyleStr = mergedStyleStr.replace(/anticon/g, prefixCls);
  }

  if (layer) {
    mergedStyleStr = `@layer ${layer} {\n${mergedStyleStr}\n}`;
  }

  onMount(() => {
    const ele = eleRef();
    if (!ele) return;
    
    const shadowRoot = getShadowRoot(ele);
    updateCSS(mergedStyleStr, '@ant-design-icons', {
      prepend: !layer,
      csp,
      attachTo: shadowRoot as ShadowRoot,
    });
  })
}

export function generate<T extends ValidComponent>(node: AbstractNode, key: string, rootProps?: ComponentProps<T> | false): any {
  return createDynamic(() => node.tag, {
    key,
    ...node.attrs,
    ...rootProps,
    children: (node.children || []).map((child, index) => generate(child, `${key}-${node.tag}-${index}`))
  })
}
