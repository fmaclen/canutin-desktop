<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/env';

	import logo from '$lib/assets/canutin-iso-logo.svg';
	import '../app.scss';

	import isVaultReadyStore from '$lib/stores/isVaultReadyStore';
	import StatusBar from '$lib/components/StatusBar.svelte';

	$: pathname = $page.url.pathname;
</script>

<div class="layout">
	<aside class="layout__aside">
		<a class="layout__logo" href="/">
			<img class="layout__img" src={logo} alt="Canutin logo" />
		</a>
		<nav class="layout__nav">
			<a
				class="layout__a {pathname === '/' && 'layout__a--active'} {!$isVaultReadyStore &&
					'layout__a--disabled'}"
				href="/"
				>The big picture
			</a>
			<a
				class="layout__a {pathname === '/balanceSheet' &&
					'layout__a--active'} {!$isVaultReadyStore && 'layout__a--disabled'}"
				href="/balanceSheet"
				>Balance sheet
			</a>
			<a
				class="layout__a {pathname === '/transactions' &&
					'layout__a--active'} {!$isVaultReadyStore && 'layout__a--disabled'}"
				href="/transactions"
				>Transactions
			</a>
		</nav>

		<nav class="layout__nav layout__nav--bottom">
			{#if dev}
				<nav class="layout__nav">
					<!-- <a class="layout__a {pathname === '/settings' && 'layout__a--active'}" href="/settings"
						>Settings
					</a> -->
					<a
						class="layout__a {!$isVaultReadyStore && 'layout__a--disabled'} {pathname ===
							'/devTools' && 'layout__a--active'}"
						href="/devTools"
						>Developer tools
					</a>
				</nav>
			{/if}
			<a
				class="layout__a layout__a--primary {pathname === '/import' &&
					'layout__a--active'} {!$isVaultReadyStore && 'layout__a--disabled'}"
				href="/import"
				>Import data
			</a>
		</nav>
	</aside>

	<slot />

	<footer class="layout__footer">
		<StatusBar />
		<div class="layout__settings">
			<p class="layout__tag">USD $</p>
			<p class="layout__tag">English</p>
			<p class="layout__tag">0.0.1</p>
		</div>
	</footer>
</div>

<style lang="scss">
	div.layout {
		display: grid;
		grid-template-rows: auto 48px;
		grid-template-columns: 240px auto;
		grid-template-areas:
			'side-bar body'
			'side-bar status-bar';
		height: 100vh;
		overflow-y: hidden;
	}

	aside.layout__aside {
		display: flex;
		flex-direction: column;
		row-gap: 16px;
		background-color: var(--color-white);
		border-right: 1px solid var(--color-border);
		height: 100%;

		grid-area: side-bar;
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
			row-gap: 16px;
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
			color: var(--color-grey20);
		}

		&--primary {
			height: 48px;
			box-sizing: border-box;
			border-top: 1px solid var(--color-border);
		}
	}

	footer.layout__footer {
		position: sticky;
		bottom: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--color-white);
		border-top: 1px solid var(--color-border);
		width: 100%;

		grid-area: status-bar;
	}

	div.layout__settings {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 16px;
		column-gap: 4px;
	}

	p.layout__tag {
		font-family: var(--font-monospace);
		font-weight: 400;
		text-transform: uppercase;
		font-size: 11px;
		letter-spacing: -0.025em;
		color: var(--color-grey50);
		background-color: var(--color-grey7);
		padding: 6px 8px;
		border-radius: 4px;
		width: max-content;
	}
</style>
