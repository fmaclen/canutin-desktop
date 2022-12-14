import { Appearance } from '$lib/helpers/constants';

export const setColorTheme = (appearance: Appearance | null) => {
	switch (appearance) {
		case Appearance.ACTIVE:
			return {
				classes: ['toastLi', 'toastLi--active'],
				theme: { '--toastBackground': 'var(--color-bluePrimary)' }
			};
		case Appearance.POSITIVE:
			return {
				classes: ['toastLi', 'toastLi--positive'],
				theme: { '--toastBackground': 'var(--color-greenPrimary)' }
			};
		case Appearance.NEGATIVE:
			return {
				classes: ['toastLi', 'toastLi--negative'],
				theme: { '--toastBackground': 'var(--color-redPrimary)' }
			};
		default:
			return {
				classes: ['toastLi'],
				theme: { '--toastBackground': 'var(--color-black-alpha65)' }
			};
	}
};
