export const flattenStyle = (style: object | null | undefined) =>
	style == null
		? undefined
		: Object.entries(style)
				.filter(([, value]) => value != null)
				.map(([key, value]) => `${key}: ${value};`)
				.join(' ');

export function classJoin(
	...classes: ((string | null | undefined)[] | string | null | undefined)[]
) {
	const filtered = classes.flat().filter(Boolean);

	return filtered.length > 0 ? filtered.join(' ') : undefined;
}

export const appendPx = (pixels: number | null | undefined) =>
	pixels == null ? undefined : `${pixels}px`;
