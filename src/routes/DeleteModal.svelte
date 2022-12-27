<script lang="ts">
	import type { DialogOut } from '$lib';

	import { ActionType } from './action-type.js';
	import DialogFrame from './DialogFrame.svelte';

	export let dialogOut: DialogOut;

	let process = false;

	dialogOut.setWidth('550px');

	$: dialogOut.closable.set(!process);
</script>

<DialogFrame {dialogOut} actionType={ActionType.Delete}>
	<svelte:fragment slot="header">Delete Modal</svelte:fragment>

	<p>
		Are you sure you want to remove?
	</p>

	<div slot="footer" class="form-button-area">
		<button>Remove</button>
		<button>Cancel</button>
	</div>
</DialogFrame>
