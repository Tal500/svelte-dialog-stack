export function remove_one_from_array<T>(arr: T[], element: T): number {
	for (let i = 0; i < arr.length; ++i) {
		if (arr[i] === element) {
			arr.splice(i, 1);
			return i;
		}
	}
	// otherwise

	return -1;
}