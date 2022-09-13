<script lang="ts">
	import type { Appearance } from '$lib/helpers/constants';

	export let href: string = '#';
	export let appearance: Appearance | undefined = undefined;
</script>

<a class="a {appearance && `a--${appearance}`}" {href}><slot /></a>

<style lang="scss">
	a.a {
		color: var(--color-grey70);
		border-bottom: 1px solid var(--color-border);
		text-decoration: none;
		cursor: pointer;

		&--active,
		&:hover {
			color: var(--color-bluePrimary);
		}
	}
</style>
