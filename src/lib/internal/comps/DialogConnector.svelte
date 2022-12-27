<script lang="ts" strictEvents>
	import {
		createEventDispatcher,
		onDestroy,
		tick,
		type ComponentType,
		type ComponentProps,
		type ComponentEvents
	} from 'svelte';
	import { readable, writable, type Readable, type Subscriber } from 'svelte/store';

	import type { Dialog, DialogComponentBase } from '../dialog.js';
	import type { DialogStack } from '../dialog-stack.js';

	type Comp = $$Generic<DialogComponentBase>;
	type Props = ComponentProps<Comp>;
	type PropsKeysStored = $$Generic<keyof Props>;

	type PropsRestKeys = Exclude<keyof Props, PropsKeysStored>;
	type PropsStored = { [key in PropsKeysStored]: key extends keyof Props ? Props[key] : never };
	type PropsStaticRequired = { [key in PropsRestKeys]: Props[key] };

	type Events = ComponentEvents<Comp>;
	type Handlers = { [signal in keyof Events]?: (event: Events[signal]) => void };

	const dispatch = createEventDispatcher<{ open: { params: Props }; close: void }>();

	export let dialogStack: DialogStack;
	const frameStack = dialogStack.frameStack;

	export let componentConstructor: ComponentType<Comp>;

	export let props: PropsStored;
	let _staticProps: PropsStaticRequired = undefined!;
	let updatePropsStore: Subscriber<Props> | null;
	const computeProps = () => ({ ...props, ..._staticProps } as Props);
	const propsStore = readable(props as Props, (set) => {
		set(computeProps());
		updatePropsStore = set;

		return function stop() {
			updatePropsStore = null;
		};
	});
	function updatePropsHelper() {
		if (updatePropsStore && $frameStack.findIndex((frame) => frame.modal === modal) >= 0) {
			//console.log("Updating props");
			updatePropsStore(computeProps());
		}
	}
	$: {
		props;
		updatePropsHelper();
	}

	export let callbacks: Handlers = {};

	let modal: Dialog<Comp> | null = null;
	const _isActiveStore = writable<boolean>(false);

	// TODO: Change it to "isOpen"
	// TODO: Change it from store/function to value
	export const isActive = () => modal !== null;
	export const isActiveStore: () => Readable<boolean> = () => _isActiveStore;

	// TODO: Add the ability to be started openned in SSR
	//  (notice that for this we'll need to have the modal area at the button of the body tag)

	export const open: {
		<T extends PropsStaticRequired>(
			staticProps: T,
			previouslyFocused?: HTMLElement | EventTarget | null | undefined
		): void;
		(
			staticProps?: PropsStored extends Props ? object : never,
			previouslyFocused?: HTMLElement | EventTarget | null | undefined
		): void;
	} = <T extends PropsStaticRequired = PropsStaticRequired>(
		staticProps: T,
		previouslyFocused?: HTMLElement | EventTarget | null | undefined
	) => {
		if (staticProps == undefined) {
			staticProps = {} as T;
		}

		if (!componentConstructor) {
			throw 'componentConstructor is empty!';
		}
		// otherwise

		if (modal !== null) {
			throw "Can't open a modal, since it's already open!";
		}
		// otherwise

		_staticProps = staticProps;
		const computedProps = computeProps();
		modal = dialogStack.openModal(
			componentConstructor,
			propsStore,
			previouslyFocused as HTMLElement | null | undefined
		);
		_isActiveStore.set(true);
		dispatch('open', { params: computedProps });

		tick()
			.then(() => {
				// On client side after mounting the modal, attach to all events.
				if (isActive()) {
					Object.entries(callbacks).forEach(([signal, callback]) => {
						if (callback) {
							modal!.component.$on(signal, callback);
						}
					});
				}
			})
			.catch((reason) => {
				console.error(`Error while attaching events to the modal: ${reason}`);
			});
	};

	export function close(shouldReturnFocus = true) {
		if (modal === null) {
			throw "Can't close a modal, since it's not open!";
		}
		// otherwise

		modal.close(shouldReturnFocus);
	}

	$: if (modal != null && $frameStack.findIndex((frame) => frame.modal === modal) < 0) {
		modal = null;
		_isActiveStore.set(false);
		dispatch('close');
	}

	onDestroy(() => {
		if (modal) {
			modal.close();
		}
	});
</script>
