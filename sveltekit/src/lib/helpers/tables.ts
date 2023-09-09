import { SortOrder } from './constants';

export const safeNumericSort = <T>(a: T, b: T, sortOrder: SortOrder, property: keyof T): number => {
	// If the property is null or undefined, set it to 0
	const valueA: number = (a[property] as unknown as number) ?? 0;
	const valueB: number = (b[property] as unknown as number) ?? 0;
	return sortOrder === SortOrder.ASC ? valueA - valueB : valueB - valueA;
};

export const safeAlphabeticalSort = <T>(
	a: T,
	b: T,
	sortOrder: SortOrder,
	property: keyof T
): number => {
	const valueA: string = (a[property] as unknown as string) || '';
	const valueB: string = (b[property] as unknown as string) || '';
	if (sortOrder === SortOrder.ASC) {
		return valueA.localeCompare(valueB); // For alphabetical sorting
	} else {
		return valueB.localeCompare(valueA);
	}
};

// export const safeBooleanSort = <T>(a: T, b: T, property: keyof T, sortOrder: SortOrder): number => {
// 	const valueA: boolean = !!(a[property] as unknown as boolean);
// 	const valueB: boolean = !!(b[property] as unknown as boolean);
// 	return sortOrder === SortOrder.ASC ? +valueA - +valueB : +valueB - +valueA;
// };
