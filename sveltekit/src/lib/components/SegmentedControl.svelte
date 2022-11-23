<script lang="ts">
	import ButtonTag from './ButtonTag.svelte';

	export let segments: string[];
	export let currentSegment: string;
	export let callback: Function;
</script>

<nav class="segmentedControl">
	{#each segments as segment}
		<ButtonTag isActive={currentSegment === segment} on:click={() => callback(segment)}>
			{segment}
		</ButtonTag>
	{/each}
</nav>

<style lang="scss">
	nav.segmentedControl {
		display: grid;
		grid-gap: 4px;
		grid-auto-flow: column;
	}
</style>
