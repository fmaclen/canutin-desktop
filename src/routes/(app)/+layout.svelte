<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import type { AuthModel } from 'pocketbase';

	import { goto, onNavigate } from '$app/navigation';
	import { setAccountsContext } from '$lib/accounts.svelte';
	import { setAssetsContext } from '$lib/assets.svelte';
	import { getPbClientContext } from '$lib/pocketbase.svelte';

	const { children } = $props();

	const pbClient = getPbClientContext();
	let currentUser = $state<AuthModel | null>(pbClient.pb.authStore.model || null);

	$effect.pre(() => {
		if (currentUser && currentUser.verified) {
			setAccountsContext();
			setAssetsContext();
		} else {
			goto('/auth');
		}
	});

	onNavigate(async () => {
		try {
			const authData = await pbClient.pb.collection('users').authRefresh();
			if (!authData.record.verified) handleSignOut();
		} catch {
			handleSignOut();
		}
	});

	function handleSignOut() {
		pbClient.signOut();
		goto('/auth');
	}
</script>

<div class="layout">
	{#if currentUser}
		<aside class="sidebar">
			<nav class="sidebar__nav">
				<a class="sidebar__a" href="/">{$LL.THE_BIG_PICTURE()}</a>
				<a class="sidebar__a" href="/balance-sheet">{$LL.BALANCE_SHEET()}</a>
				<a class="sidebar__a" href="/trends">{$LL.TRENDS()}</a>
			</nav>
			<nav class="sidebar__nav">
				<a class="sidebar__a" href="/transactions">{$LL.TRANSACTIONS()}</a>
				<a class="sidebar__a" href="/accounts">{$LL.ACCOUNTS()}</a>
				<a class="sidebar__a" href="/assets">{$LL.ASSETS()}</a>
			</nav>
			<nav class="sidebar__nav">
				<!-- <a class="sidebar__a" href="/settings">{$LL.SETTINGS()}</a> -->
				<a class="sidebar__a" href="/data">{$LL.ADD_OR_UPDATE_DATA()}</a>
				<div class="sidebar__user">
					<button class="sidebar__button" onclick={handleSignOut} title={$LL.SIGN_OUT()}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="1.25rem"
							height="1.25rem"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M11 12V4q0-.425.288-.712T12 3t.713.288T13 4v8q0 .425-.288.713T12 13t-.712-.288T11 12m1 9q-1.85 0-3.488-.712T5.65 18.35t-1.937-2.863T3 12q0-1.725.638-3.312T5.425 5.85q.275-.3.7-.3t.725.3q.275.275.25.688t-.3.737q-.85.95-1.325 2.163T5 12q0 2.9 2.05 4.95T12 19q2.925 0 4.963-2.05T19 12q0-1.35-.475-2.588t-1.35-2.187q-.275-.3-.288-.7t.263-.675q.3-.3.725-.3t.7.3q1.175 1.25 1.8 2.838T21 12q0 1.85-.712 3.488t-1.925 2.862t-2.85 1.938T12 21"
							/>
						</svg>
					</button>
					<span class="sidebar__email">{currentUser.email}</span>
				</div>
			</nav>
		</aside>

		{@render children()}
	{/if}
</div>

<style lang="postcss">
	.layout {
		@apply flex h-screen;
	}

	.sidebar {
		@apply flex h-full max-w-64 flex-col bg-chromeo-100 py-4;
	}

	.sidebar__a {
		@apply text-sm font-semibold;
	}

	.sidebar__nav {
		@apply flex flex-col gap-4 px-8 py-4;

		&:last-child {
			@apply mt-auto;
		}
	}

	.sidebar__user {
		@apply flex flex-row gap-2;
	}

	.sidebar__email {
		@apply w-full overflow-hidden truncate text-ellipsis text-sm;
	}
</style>
