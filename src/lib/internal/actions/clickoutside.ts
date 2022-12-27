// Based on Svelte official tutorials

import type { Action } from 'svelte/action';

export const clickOutside: Action<Node, void> = (node: Node) => {
	function handleClick(event: MouseEvent) {
		if (!node.contains(event.target as Node)) {
			node.dispatchEvent(new CustomEvent('outclick', event));
		}
	}

	document.addEventListener('mousedown', handleClick, true);

	return {
		destroy() { document.removeEventListener('mousedown', handleClick, true) };
	};
};
