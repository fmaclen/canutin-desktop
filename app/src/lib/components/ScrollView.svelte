<script lang="ts">
	export let title: string;
</script>

<main class="scrollView">
	<header class="scrollView__header">
		<h1 class="scrollView__h1">{title}</h1>
	</header>

	<div class="scrollView__container">
		<slot />
	</div>
</main>

<style lang="scss">
	header.scrollView__header {
		display: flex;
		flex-direction: column;
		background-color: var(--color-grey3);
		border-bottom: 1px solid var(--color-border);
	}

	h1.scrollView__h1 {
		margin-top: auto;
		margin-bottom: 0;
		padding: 24px 64px;
		font-size: 24px;
		letter-spacing: -0.03em;
	}

	div.scrollView__container {
		padding: 64px;
	}
</style>
