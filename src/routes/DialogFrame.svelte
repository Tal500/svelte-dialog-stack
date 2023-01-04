<script lang="ts">
	import { ActionType } from './action-type.js';
	import type { DialogOut } from '$lib';

	export let dialogOut: DialogOut;
	export let showCloseButton = false;
	export let actionType: ActionType = ActionType.Default;

	const { closable } = dialogOut;

	function close() {
		if ($closable) {
			dialogOut.close();
		}
	}
</script>

{#if $$slots.header}
	<header class="dialog-header" data-action={actionType}>
		{#if showCloseButton}
			<button
				type="button"
				class="close"
				aria-label="Close"
				on:click={() => close()}
				disabled={!$closable}
			/>
		{/if}
		<slot name="header" />
	</header>
{/if}

<div class="dialog-main">
	<slot />
</div>

{#if $$slots.footer}
	<footer class="dialog-footer" data-action={actionType}>
		<slot name="footer" />
	</footer>
{/if}

<style lang="postcss" rtlfix>
	.dialog-header {
		padding: 17px 18px;
		background-color: rgb(92, 184, 92);
		color: white;

		display: block;
		font-family: 'Segoe UI', Arial, sans-serif;
		font-weight: 400;
		font-size: 36px;
	}

	.dialog-header[data-action='add'] {
		background-color: rgb(61, 112, 207);
	}

	.dialog-header[data-action='delete'] {
		background-color: red;
	}

	.dialog-main {
		padding: 1em;
	}

	.dialog-footer {
		padding: 5px 16px;
		background-color: rgba(92, 184, 92, 0.3);
		color: white;
	}

	.dialog-footer[data-action='add'] {
		background-color: rgba(61, 112, 207, 0.3);
	}

	.dialog-footer[data-action='delete'] {
		background-color: rgba(255, 0, 0, 0.3);
	}

	/* The Close Button, based on https://www.w3schools.com/howto/howto_css_modals.asp */
	.close {
		border: none;
		background: none;
		color: white;
		float: right;
		font-size: 32px;
		font-weight: bold;
		text-decoration: none;
		transition: all 0.25s ease-out;
	}

	.close:hover, .close:focus {
		color: black;
		cursor: pointer;
		transform: scale(1.2);
	}

	.close:disabled {
		color: grey;
		cursor: not-allowed;
		transform: none;
	}

	.close:after {
		content: '\00D7';
	}
</style>
