import { generate as generateColor } from '@ant-design/colors';
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/lib/types';
import { useContext, onMount, createComponent, ComponentProps, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web"
import { updateCSS } from '@antd-solid/util/dom/dynamicCSS';
import { getShadowRoot } from '@antd-solid/util/dom/shadow';
import { warning as warningOnce } from '@antd-solid/util'

import IconContext from './components/Context';

function camelCase(input: string) {
  return input.replace(/-(.)/g, (match, g) => g.toUpperCase());
}

export function warning(valid: boolean, message: string) {
  warningOnce(valid, `[@antd-solid/icons] ${message}`);
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

export const useInsertStyles = (eleRef: HTMLElement | null) => {
  const { csp, prefixCls, layer } = useContext(IconContext);
  let mergedStyleStr = iconStyles;

  if (prefixCls) {
    mergedStyleStr = mergedStyleStr.replace(/anticon/g, prefixCls);
  }

  if (layer) {
    mergedStyleStr = `@layer ${layer} {\n${mergedStyleStr}\n}`;
  }

  onMount(() => {
    if (!eleRef) return;
    
    const shadowRoot = getShadowRoot(eleRef);
    updateCSS(mergedStyleStr, '@ant-design-icons', {
      prepend: !layer,
      csp,
      attachTo: shadowRoot as ShadowRoot,
    });
  })
}

export function generate<T extends ValidComponent>(node: AbstractNode, key: string, rootProps?: ComponentProps<T> | false): any {
  return createComponent(Dynamic, {
    component: node.tag,
    key,
    ...node.attrs,
    ...rootProps,
    children: (node.children || []).map((child, index) => generate(child, `${key}-${node.tag}-${index}`))
  })
}
