<script lang="ts">
	export let title: string;
	export let isFullscreen: boolean = false;
</script>

<main class="scrollView">
	<header class="scrollView__header">
		<h1 class="scrollView__h1">{title}</h1>
	</header>

	<div class="scrollView__container {isFullscreen && 'scrollView__container--fullscreen'}">
		<slot />
	</div>
</main>

<style lang="scss">
	main.scrollView {
		display: grid;
		grid-template-rows: max-content auto;
		overflow-y: auto;

		grid-area: body;
	}

	header.scrollView__header {
		display: flex;
		flex-direction: column;
		background-color: var(--color-grey3);
		border-bottom: 1px solid var(--color-border);
	}

	h1.scrollView__h1 {
		margin-top: auto;
		margin-bottom: 0;
		padding: 90px 64px 24px 64px;
		font-size: 24px;
		letter-spacing: -0.03em;
	}

	div.scrollView__container {
		position: relative;
		width: 100%;
		height: max-content;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		padding: 64px;
		display: grid;
		grid-gap: 64px;
		place-items: center;

		&--fullscreen {
			height: 100%;
		}
	}
</style>
