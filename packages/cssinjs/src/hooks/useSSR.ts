import { type Accessor, createSignal, onMount } from "solid-js";

export interface UseSSROptions {
	/**
	 * Whether to enable SSR mode
	 */
	enabled?: boolean;
}

export interface UseSSRResult {
	isSSR: () => boolean;
	isHydrated: Accessor<boolean>;
	isBrowser: () => boolean;
}

/**
 * Hook to detect SSR environment and provide utilities
 */
export default function useSSR(options: UseSSROptions = {}): UseSSRResult {
	const { enabled = true } = options;

	const [isSSR, setIsSSR] = createSignal(typeof window === "undefined");
	const [isHydrated, setIsHydrated] = createSignal(false);

	onMount(() => {
		setIsSSR(false);
		setIsHydrated(true);
	});

	return {
		isSSR: (): boolean => enabled && isSSR(),
		isHydrated,
		isBrowser: (): boolean => !isSSR(),
	};
}
