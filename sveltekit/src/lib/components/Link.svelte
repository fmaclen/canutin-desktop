<script lang="ts">
	export let href: string = '#';
</script>

<a class="a" {href}><slot /></a>

<style lang="scss">
	a.a {
		color: var(--color-grey70);
		/* color: var(--color-bluePrimary); */
		border-bottom: 1px solid var(--color-border);
		text-decoration: none;
		cursor: pointer;

		&:hover {
			color: var(--color-bluePrimary);
		}
	}
</style>
