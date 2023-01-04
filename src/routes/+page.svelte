<script lang="ts">
	import { DialogSection, DialogArea, DialogStack } from '$lib';
	import DeleteDialog from './DeleteDialog.svelte';

    const dialogStack = new DialogStack();
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<DialogSection {dialogStack} componentConstructor={DeleteDialog} props={{}} let:open>
    <button on:click={() => open()}>Delete</button>
</DialogSection>

<DialogArea {dialogStack} />