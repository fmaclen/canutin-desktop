<script lang="ts">
	export let isError: boolean = false;
</script>

<p class="notice {isError && 'notice--error'}"><slot /></p>

<style lang="scss">
	p.notice {
		text-align: center;
		line-height: 1.25em;
		font-size: 12px;
		padding: 32px;
		margin: 0;
		border-radius: 4px;
		color: var(--color-neutral-500);
		background-color: var(--color-border);

		&--error {
			color: var(--color-redPrimary);
			background-color: var(--color-redSecondary);
		}
	}
</style>
