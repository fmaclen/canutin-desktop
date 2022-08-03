<script lang="ts">
	export let isError: boolean = false;
</script>

<p class="notice {isError && 'notice--error'}"><slot /></p>

<style lang="scss">
	p.notice {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		padding: 32px;
		margin: 0;
		border-radius: 4px;
		color: var(--color-grey50);
		background-color: var(--color-border);

		&--error {
			color: var(--color-redPrimary);
			background-color: var(--color-redSecondary);
		}
	}
</style>
