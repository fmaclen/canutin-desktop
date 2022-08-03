<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/env';

	import logo from '$lib/assets/canutin-iso-logo.svg';
	import '../app.scss';
</script>

<div class="layout">
	<aside class="layout__aside">
		<a class="layout__logo" href="/">
			<img class="layout__img" src={logo} alt="Canutin logo" />
		</a>
		<nav class="layout__nav">
			<a class="layout__a {$page.url.pathname === '/' && 'layout__a--active'}" href="/"
				>The big picture</a
			>
			<a
				class="layout__a {$page.url.pathname === '/balanceSheet' && 'layout__a--active'}"
				href="/balanceSheet">Balance sheet</a
			>
		</nav>

		<nav class="layout__nav layout__nav--bottom">
			{#if dev}
				<a
					class="layout__a {$page.url.pathname === '/devTools' && 'layout__a--active'}"
					href="/devTools">Developer tools</a
				>
			{/if}
			<a class="layout__a {$page.url.pathname === '/import' && 'layout__a--active'}" href="/import"
				>Import data</a
			>
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
		row-gap: 16px;
		background-color: var(--color-white);
		border-right: 1px solid var(--color-border);
	}

	a.layout__logo {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 48px;
		border-bottom: 1px solid var(--color-border);

		&:hover {
			background-color: var(--color-grey3);
		}
	}

	img.layout__img {
		width: 48px;
	}

	nav.layout__nav {
		display: flex;
		flex-direction: column;

		&--bottom {
			margin-top: auto;
		}
	}

	a.layout__a {
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
		color: var(--color-grey80);
		padding: 16px 32px;

		&:hover {
			background-color: var(--color-grey3);
		}

		&--active {
			color: var(--color-bluePrimary);
		}
	}
</style>
