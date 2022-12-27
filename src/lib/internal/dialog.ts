import type { ComponentType, SvelteComponentTyped, ComponentProps } from 'svelte';

import type { Writable, Readable } from 'svelte/store';

export type DialogOut = {
	modal: Writable<boolean>;
	closable: Writable<boolean>;
	close: (shouldReturnFocus?: boolean) => void;
	setMinWidth: (value: string | undefined) => void;
	setWidth: (value: string | undefined) => void;
	setMaxWidth: (value: string | undefined) => void;
};

export type DialogComponentBase = SvelteComponentTyped<{ dialogOut?: DialogOut }>;

export interface Dialog<Comp extends DialogComponentBase = DialogComponentBase> {
	componentConstructor: ComponentType<Comp>;
	component: Comp;
	propsStore: Readable<Partial<ComponentProps<Comp>>>;
	dialogOut: DialogOut;
	closable: Readable<boolean>;
	styleStore: Readable<string | undefined>;
	close: (shouldReturnFocus?: boolean) => void;
	onCloseInternal: ((previouslyFocused: HTMLElement | null) => void) | null;
}