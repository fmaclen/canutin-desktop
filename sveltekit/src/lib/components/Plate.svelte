<script lang="ts">
	export let dataTestId: string | undefined = undefined;
</script>

<div class="plate" data-test-id={dataTestId}>
	<slot />
</div>

<style lang="scss">
	div.plate {
		background-color: var(--color-white);
		box-shadow: var(--box-shadow);
		border-radius: 4px;
	}
</style>
