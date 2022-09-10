<script lang="ts">
	export let href: string = '#';
</script>

<a class="a" {href}><slot /></a>

<style lang="scss">
	a.a {
		color: var(--color-grey80);
		text-decoration: none;
		cursor: pointer;

		&:hover {
			color: var(--color-bluePrimary);
			text-decoration: underline;
		}
	}
</style>
