import { SortOrder } from './constants';

export const sortNumerically = <T>(a: T, b: T, sortOrder: SortOrder): number => {
	// If the property is null or undefined, set it to 0
	const valueA: number = (a as unknown as number) ?? 0;
	const valueB: number = (b as unknown as number) ?? 0;
	return sortOrder === SortOrder.ASC ? valueA - valueB : valueB - valueA;
};

export const sortAlphabetically = <T>(a: T, b: T, sortOrder: SortOrder): number => {
	const valueA: string | undefined | null = (a as unknown as string) ?? '';
	const valueB: string | undefined | null = (b as unknown as string) ?? '';
	if (sortOrder === SortOrder.ASC) {
		return valueA.localeCompare(valueB); // For alphabetical sorting
	} else {
		return valueB.localeCompare(valueA);
	}
};

export const sortBooleans = <T>(a: T, b: T, sortOrder: SortOrder): number => {
	return sortOrder === SortOrder.ASC ? +a - +b : +b - +a;
};
