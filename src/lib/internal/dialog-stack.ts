import type { ComponentType, ComponentProps } from 'svelte';
import { type Writable, type Readable, writable, derived, get } from 'svelte/store';

import { remove_one_from_array } from './utils/array-utils.js';
import { flattenStyle } from './utils/styling.js';

import type { Dialog, DialogOut, DialogComponentBase } from './dialog.js';

export type DialogFrame = {
	modal: Dialog;
	previouslyFocused: HTMLElement | null;
};

export class DialogStack {
	frameStack: Writable<DialogFrame[]>;

	topDialog: Readable<Dialog | null>;

	constructor() {
		this.frameStack = writable([]);
		this.topDialog = derived(this.frameStack, ($frameStack) =>
			$frameStack.length === 0 ? null : $frameStack[$frameStack.length - 1].modal
		);
	}

	exitTopModal(shouldReturnFocus = true) {
		const $frameStack = get(this.frameStack);
		if ($frameStack.length === 0) {
			throw Error("Can't exit top modal since no modal is up!");
		}
		// otherwise

		const topFrame = $frameStack[$frameStack.length - 1];
		topFrame.modal.close(shouldReturnFocus);
	}

	openModal<Comp extends DialogComponentBase = DialogComponentBase>(
		componentConstructor: ComponentType<Comp>,
		propsStore: Readable<Partial<ComponentProps<Comp>>>,
		previouslyFocused: HTMLElement | null | undefined = undefined
	) {
		if (previouslyFocused === undefined) {
			previouslyFocused =
				typeof window !== 'undefined' ? (document.activeElement as HTMLElement) : null;
		}

		const activeElement =
			typeof window !== 'undefined' ? (document.activeElement as HTMLElement) : null;
		if (activeElement) {
			activeElement.blur();
		}

		const closable = writable(true);
		const minWidth = writable<string | undefined>(undefined);
		const width = writable<string | undefined>(undefined);
		const maxWidth = writable<string | undefined>(undefined);

		let frame = undefined as unknown as {
			modal: Dialog<Comp>;
			previouslyFocused: HTMLElement | null;
		};

		const frameStack = this.frameStack;

		function close(shouldReturnFocus = true) {
			const previouslyFocused =
				shouldReturnFocus && document.body.contains(frame.previouslyFocused)
					? frame.previouslyFocused
					: null;

			if (modal.onCloseInternal) {
				modal.onCloseInternal(previouslyFocused);
			}

			frameStack.update(($frameStack) => {
				remove_one_from_array($frameStack, frame);

				return $frameStack;
			});

			if (previouslyFocused) {
				//console.log('Returning to previously focused node: ' + previouslyFocused);
				previouslyFocused.focus();
			}
		}

		const modalOut: DialogOut = {
			modal: writable(false),
			closable,
			close,
			setMinWidth(value: string | undefined) {
				minWidth.set(value);
			},
			setWidth(value: string | undefined) {
				width.set(value);
			},
			setMaxWidth(value: string | undefined) {
				maxWidth.set(value);
			}
		};
		const modal: Dialog<Comp> = {
			componentConstructor,
			component: null as unknown as Comp,
			propsStore,
			dialogOut: modalOut,
			closable,
			styleStore: derived([minWidth, width, maxWidth], ([$minWidth, $width, $maxWidth]) =>
				flattenStyle({
					'min-width': $minWidth,
					width: $width,
					'max-width': $maxWidth
				})
			),
			close,
			onCloseInternal: null
		};

		frame = { modal, previouslyFocused };

		this.frameStack.update(($frameStack) => {
			$frameStack.push(frame);
			return $frameStack;
		});

		return modal;
	}

	pushUpdate() {
		this.frameStack.update((x) => x);
	}
}
