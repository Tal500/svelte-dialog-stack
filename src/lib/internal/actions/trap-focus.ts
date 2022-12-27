// Based on https://svelte.dev/examples/modal

export function trapFocus(node: HTMLElement | SVGElement, onlinePredicate = () => true) {
	// Code has been moved to exitTopModal() func
	//const previouslyFocused: any = (typeof window !== 'undefined') ? document.activeElement : null;

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Tab' && onlinePredicate()) {
			console.log('Tab keydown captured!');

			// trap focus
			const nodes = node.querySelectorAll('*');
			const tabbable = Array.from(nodes).filter(
				(n) => n instanceof HTMLElement && n.tabIndex >= 0
			) as HTMLElement[];

			const { activeElement } = document;
			let index = activeElement ? tabbable.indexOf(activeElement as never) : -1;
			if (index === -1 && e.shiftKey) {
				index = 0;
			}

			index += tabbable.length + (e.shiftKey ? -1 : 1);
			index %= tabbable.length;

			tabbable[index].focus();
			e.preventDefault();
		}
	};

	//console.log('Starting Tab keydown capturing!');
	window.addEventListener('keydown', handleKeydown, true);

	return {
		destroy() {
			//console.log('Removing Tab keydown capturing!');
			window.removeEventListener('keydown', handleKeydown, true);

			// Code has been moved to exitTopModal() func
			//const previouslyFocused = returnFocusTo();
			// if (previouslyFocused) {
			// 	console.log('Returning to previously focused node: ' + previouslyFocused);
			// 	previouslyFocused.focus();
			// }
		}
	};
}
