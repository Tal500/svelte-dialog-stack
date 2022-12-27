<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	import type { Dialog } from '../dialog.js';

	import { clickOutside } from '$lib/actions/clickoutside.js';
	import { trapFocus } from '$lib/actions/trap_focus.js';
	import { crossfade } from '$lib/actions/crossfadeExists.js';

	export let dialog: Dialog;
	export let cameFrom: HTMLElement | null = null;
	export let isTop: boolean;
	export let tryClose: () => void;

	const key = {};

	const [send, receive, crossfadeSetNode] = crossfade({
		duration: 250,
		fallback: (node) => fly(node, { duration: 250, y: -200 })
	});

	crossfadeSetNode(cameFrom, key);

	dialog.onCloseInternal = (previouslyFocused) => {
		crossfadeSetNode(previouslyFocused, key);
	};

	const { propsStore, styleStore } = dialog;
</script>

<div class="dialog" role="presentation" transition:fade={{ duration: 250 }}>
	<!-- TODO: Support label and label-by by using Svelte Context? -->
	<div
		class="modal-content"
		role="dialog"
		aria-modal="true"
		aria-hidden={isTop ? undefined : true}
		in:receive={{ key }}
		out:send={{ key }}
		use:clickOutside={{}}
		use:trapFocus={() => isTop}
		style={$styleStore}
		on:outclick|capture|stopPropagation={() => {
			if (isTop) {
				//console.log('Out click from modal!');
				tryClose();
			}
		}}
	>
		<svelte:component
			this={dialog.componentConstructor}
			bind:this={dialog.component}
			modalOut={dialog.modalOut}
			{...$propsStore}
		/>
	</div>
</div>

<style lang="postcss" rtlfix>
	/* Based on https://www.w3schools.com/howto/howto_css_modals.asp and https://svelte.dev/examples/modal */

	/* The Dialog (background) */
	.dialog {
		position: fixed; /* Stay in place */
		z-index: 100; /* Sit on top */
		left: 0;
		top: 0;
		width: 100%; /* Full width */
		height: 100%; /* Full height */
		background-color: rgb(0, 0, 0); /* Fallback color */
		background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
	}

	/* Dialog Content/Box */
	.dialog-content {
		position: absolute;
		left: 50%;
		top: 50%;
		background-color: #fefefe;
		/* border: 1px solid #888; */
		transform: translate(-50%, -50%);
		width: 60%; /* Could be more or less, depending on screen size */
		max-width: calc(100vw - 2em);
		max-height: calc(100vh - 2em);
		overflow: auto;
		/* border-radius: 0.2em; */
	}
</style>
