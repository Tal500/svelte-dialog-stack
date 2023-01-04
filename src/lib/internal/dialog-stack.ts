import type { ComponentType, ComponentProps } from 'svelte';
import { type Writable, type Readable, writable, derived, get } from 'svelte/store';

import { remove_one_from_array } from './utils/array-utils.js';
import { flattenStyle } from './utils/styling.js';

import type { Dialog, DialogOut, DialogComponentBase } from './dialog.js';

export type DialogFrame<Comp extends DialogComponentBase = DialogComponentBase> = {
	dialog: Dialog<Comp>;
	previouslyFocused: HTMLElement | null;
};

export class DialogStack {
	frameStack: Writable<DialogFrame[]>;

	topDialog: Readable<Dialog | null>;

	constructor() {
		this.frameStack = writable([]);
		this.topDialog = derived(this.frameStack, ($frameStack) =>
			$frameStack.length === 0 ? null : $frameStack[$frameStack.length - 1].dialog
		);
	}

	exitTopDialog(shouldReturnFocus = true) {
		const $frameStack = get(this.frameStack);
		if ($frameStack.length === 0) {
			throw Error("Can't exit top dialog since no dialog is up!");
		}
		// otherwise

		const topFrame = $frameStack[$frameStack.length - 1];
		topFrame.dialog.close(shouldReturnFocus);
	}

	openDialog<Comp extends DialogComponentBase = DialogComponentBase>(
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

		let frame: DialogFrame;

		const frameStack = this.frameStack;

		function close(shouldReturnFocus = true) {
			const previouslyFocused =
				shouldReturnFocus && document.body.contains(frame.previouslyFocused)
					? frame.previouslyFocused
					: null;

			if (dialog.onCloseInternal) {
				dialog.onCloseInternal(previouslyFocused);
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

		const dialogOut: DialogOut = {
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
		const dialog: Dialog<Comp> = {
			componentConstructor,
			component: null as unknown as Comp,
			propsStore,
			dialogOut,
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

		frame = { dialog, previouslyFocused };

		this.frameStack.update(($frameStack) => {
			$frameStack.push(frame);
			return $frameStack;
		});

		return dialog;
	}

	pushUpdate() {
		this.frameStack.update((x) => x);
	}
}
