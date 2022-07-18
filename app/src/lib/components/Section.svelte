<script lang="ts">
	import SectionTitle from './SectionTitle.svelte';

	export let title: string;
</script>

<section class="section">
	<header class="section__header">
		<SectionTitle {title} />
		<slot name="HEADER" />
	</header>

	<slot name="CONTENT" />
</section>

<style lang="scss">
	section.section {
		display: flex;
		flex-direction: column;
		row-gap: 12px;
	}

	header.section__header {
		display: grid;
		grid-auto-flow: column;
		grid-gap: 32px;
		align-items: center;
		justify-content: space-between;
	}
</style>
