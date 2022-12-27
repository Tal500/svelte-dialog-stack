<script lang="ts" strictEvents>
	import { onMount, type ComponentEvents, type ComponentProps, type ComponentType } from 'svelte';

	import type { DialogComponentBase } from '../dialog.js';
	import type { DialogStack } from '../dialog-stack.js';

	import DialogConnector from './DialogConnector.svelte';

	type Comp = $$Generic<DialogComponentBase>;
	type Props = ComponentProps<Comp>;
	type PropsKeysStored = $$Generic<keyof Props>;

	type PropsStored = { [key in (PropsKeysStored & keyof Props)]: Props[key] };

	type Events = ComponentEvents<Comp>;
	type Handlers = { [signal in keyof Events]?: (event: Events[signal]) => void };

	let connector: DialogConnector<Comp, PropsKeysStored>;

	export let dialogStack: DialogStack;
	export let componentConstructor: ComponentType<Comp>;
	export let props: PropsStored;
	export let callbacks: Handlers = {};
	export let isActive: boolean = false;

	export let open: typeof connector.open = () => {
		throw "Can't call dialog open in SSR!";
	};
	export let close: typeof connector.close = () => {
		throw "Can't call dialog close in SSR!";
	};

	onMount(() => {
		open = connector.open;
		close = connector.close;

		return connector.isActiveStore().subscribe(($isActive) => (isActive = $isActive));
	});
</script>

<DialogConnector bind:this={connector} {dialogStack} {componentConstructor} {props} {callbacks} />

<slot {isActive} {open} {close} />
