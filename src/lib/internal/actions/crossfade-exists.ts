// Based on Svelte original src, in
//	https://github.com/sveltejs/svelte/blob/d5370f23d3d34f15078ccc8d72b80eea0617f173/src/runtime/transition/index.ts

import { cubicOut } from 'svelte/easing';
import { assign, is_function } from 'svelte/internal';
import type { Action } from 'svelte/action';

import type { CrossfadeParams, TransitionConfig } from 'svelte/transition';

type ClientRectMap = Map<unknown, DOMRect>;
type ElementsMap = Map<unknown, HTMLElement>;

export function crossfade({
	fallback,
	...defaults
}:
	| (CrossfadeParams & {
			fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
	  })
	| { [key: string]: unknown }): [
	(
		node: Element,
		params: CrossfadeParams & {
			key: unknown;
		}
	) => () => TransitionConfig,
	(
		node: Element,
		params: CrossfadeParams & {
			key: unknown;
		}
	) => () => TransitionConfig,
	Action<HTMLElement | null | undefined>
] {
	const to_receive: ClientRectMap = new Map();
	const to_send: ClientRectMap = new Map();
	const staticElements: ElementsMap = new Map();

	function crossfadeSetNode(node: HTMLElement | null | undefined, key: unknown) {
		if (node == null) {
			return;
		}
		// otherwise

		staticElements.set(key, node);

		return {
			update(key: unknown) {
				staticElements.set(key, node);
			},
			destroy() {
				staticElements.delete(key);
			}
		};
	}

	function crossfade(from: DOMRect, node: Element, params: CrossfadeParams): TransitionConfig {
		const {
			delay = 0,
			duration = (d: number) => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);

		const to = node.getBoundingClientRect();
		const dx = from.left - to.left;
		const dy = from.top - to.top;
		const dw = from.width / to.width;
		const dh = from.height / to.height;
		const d = Math.sqrt(dx * dx + dy * dy);

		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;
		const opacity = +style.opacity;

		return {
			delay,
			duration: is_function(duration) ? duration(d) : duration,
			easing,
			css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${
				t + (1 - t) * dh
			});
			`
		};
	}

	function transition(items: ClientRectMap, counterparts: ClientRectMap, intro: boolean) {
		return (node: Element, params: CrossfadeParams & { key: unknown }) => {
			items.set(params.key, node.getBoundingClientRect());

			return () => {
				let rect = null;

				if (staticElements.has(params.key)) {
					const otherNode = staticElements.get(params.key);
					if (otherNode != null && document.body.contains(otherNode)) {
						rect = otherNode.getBoundingClientRect();
					}
				}

				if (rect === null && counterparts.has(params.key)) {
					rect = counterparts.get(params.key);
				}

				if (rect != null) {
					counterparts.delete(params.key);

					return crossfade(rect, node, params);
				}
				// otherwise

				// if the node is disappearing altogether
				// (i.e. wasn't claimed by the other list)
				// then we need to supply an outro
				items.delete(params.key);
				return typeof fallback === 'function' && fallback(node, params, intro);
			};
		};
	}

	return [
		transition(to_send, to_receive, false),
		transition(to_receive, to_send, true),
		crossfadeSetNode
	];
}
