<script lang="ts">
	import type { Appearance } from '$lib/helpers/constants';

	export let href: string = '#';
	export let appearance: Appearance | undefined = undefined;
	export let target: string | undefined = undefined;
</script>

<a
	{href}
	{target}
	class="a {appearance && `a--${appearance}`}"
	rel={target === '_blank' ? 'noopener' : ''}
>
	<slot />
</a>

<style lang="scss">
	a.a {
		color: var(--color-neutral-700);
		border-bottom: 1px solid var(--color-alpha-dark-100);
		text-decoration: none;
		cursor: pointer;

		&--active,
		&:hover {
			color: var(--color-bluePrimary);
		}
	}
</style>
