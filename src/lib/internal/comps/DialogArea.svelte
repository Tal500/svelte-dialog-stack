<script lang="ts" strictEvents>
	import { get } from 'svelte/store';

	import type { DialogStack } from '../dialog-stack.js';

	import DialogDisplay from './DialogDisplay.svelte';

	export let dialogStack: DialogStack;
	const { frameStack, topDialog } = dialogStack;

	function tryClose() {
		const dialog = $topDialog;
		if (dialog && get(dialog.closable)) {
			dialogStack.exitTopDialog();
		}
	}

	// Based on https://svelte.dev/examples/modal
	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			tryClose();
			e.stopPropagation();
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

{#each $frameStack as frame, i (frame)}
	<DialogDisplay
		dialog={frame.dialog}
		cameFrom={frame.previouslyFocused}
		isTop={i === $frameStack.length - 1}
		{tryClose}
	/>
{/each}
