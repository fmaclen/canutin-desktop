<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/env';

	import logo from '$lib/assets/canutin-iso-logo.svg';
	import '../app.scss';
	import isVaultReadyStore from '$lib/stores/isVaultReadyStore';

	$: isVaultReady = $isVaultReadyStore;
	$: pathname = $page.url.pathname;
</script>

<div class="layout">
	<aside class="layout__aside">
		<a class="layout__logo" href="/">
			<img class="layout__img" src={logo} alt="Canutin logo" />
		</a>
		<nav class="layout__nav">
			<a
				class="layout__a {pathname === '/' && 'layout__a--active'} {!isVaultReady &&
					'layout__a--disabled'}"
				href="/">The big picture</a
			>
			<a
				class="layout__a {pathname === '/balanceSheet' && 'layout__a--active'} {!isVaultReady &&
					'layout__a--disabled'}"
				href="/balanceSheet">Balance sheet</a
			>
			<a
				class="layout__a {pathname === '/transactions' && 'layout__a--active'} {!isVaultReady &&
					'layout__a--disabled'}"
				href="/transactions">Transactions</a
			>
		</nav>

		<nav class="layout__nav layout__nav--bottom">
			{#if dev}
				<a class="layout__a {pathname === '/devTools' && 'layout__a--active'}" href="/devTools"
					>Developer tools</a
				>
			{/if}
			<a
				class="layout__a {pathname === '/import' && 'layout__a--active'} {!isVaultReady &&
					'layout__a--disabled'}"
				href="/import">Import data</a
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
		min-height: 100vh;
		background-color: var(--color-white);
		border-right: 1px solid var(--color-border);

		> *:nth-child(1),
		> *:nth-child(2),
		> *:last-child {
			position: sticky;
		}

		> *:nth-child(1) {
			top: 0;
		}

		> *:nth-child(2) {
			top: 161px;
		}

		> *:last-child {
			bottom: 0;
		}
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

		&--active:not(.layout__a--disabled) {
			color: var(--color-bluePrimary);
		}

		&--disabled {
			pointer-events: none;
			opacity: 0.5;
		}
	}
</style>
