<script lang="ts">
	import '../app.scss';

	export let importStatus: number;
	const triggerImport = async () => {
		const res = await fetch('/import');
		importStatus = res.status;
	};
</script>

<div class="layout">
	<aside class="layout__aside">
		<nav class="layout__nav">
			<a href="/">The big picture</a>
			<a href="/balanceSheet">Balance sheet</a>
		</nav>

		<nav class="layout__nav layout__nav--bottom">
			<button type="button" on:click={triggerImport}>Import from CanutinFile (v2)</button>
			{#if importStatus}
				<p>{importStatus}</p>
			{/if}
		</nav>
	</aside>
	<slot />
</div>

<style lang="scss">
	div.layout {
		display: grid;
		grid-template-columns: 240px auto;
		height: 100%;
	}

	aside.layout__aside {
		display: flex;
		flex-direction: column;
		row-gap: 32px;
		background-color: var(--color-white);
		border-right: 1px solid var(--color-border);
	}

	nav.layout__nav {
		display: flex;
		flex-direction: column;
		row-gap: 8px;
		padding: 16px;

		&--bottom {
			margin-top: auto;
		}
	}
</style>
