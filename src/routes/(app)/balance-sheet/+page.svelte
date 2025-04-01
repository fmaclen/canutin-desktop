<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import { getAssetsContext } from '$lib/assets.svelte';
	import { BalanceGroup, calculateTotalBalance } from '$lib/balanceGroups';
	import H1 from '$lib/components/H1.svelte';
	import H3 from '$lib/components/H3.svelte';
	import Head from '$lib/components/Head.svelte';
	import KeyValue from '$lib/components/KeyValue.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
	import Number from '$lib/components/Number.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import Section from '$lib/components/Section.svelte';
	import { formatCurrency } from '$lib/utils';

	const accountsStore = getAccountsContext();
	const assetsStore = getAssetsContext();

	let balanceGroups = $derived.by(() => {
		const accountsOrAssets = [...accountsStore.accounts, ...assetsStore.assets];
		return [
			BalanceGroup.CASH,
			BalanceGroup.DEBT,
			BalanceGroup.INVESTMENTS,
			BalanceGroup.OTHER_ASSETS
		].map((balanceGroup) => {
			const accountsOrAssetsInBalanceGroup = accountsOrAssets.filter(
				(accountOrAsset) => accountOrAsset.balanceGroup === balanceGroup
			);
			return {
				balance: calculateTotalBalance(accountsOrAssetsInBalanceGroup),
				groups: Object.groupBy(
					accountsOrAssetsInBalanceGroup,
					(accountOrAsset) => accountOrAsset.expand?.tag?.name
				)
			};
		});
	});
</script>

<Head title={$LL.BALANCE_SHEET()} />

<MainHeader>
	<H1>{$LL.BALANCE_SHEET()}</H1>
</MainHeader>

<Section>
	<H3>{$LL.BALANCES()}</H3>

	<ul class="balance-sheet grid grid-cols-4 gap-4">
		{#each balanceGroups as balanceGroup, index}
			<li class="balance-sheet__item flex flex-col gap-3">
				{#if index === BalanceGroup.CASH}
					<Plate variant="cash">
						<KeyValue key={$LL.CASH()} value={formatCurrency(balanceGroup.balance)} />
					</Plate>
				{:else if index === BalanceGroup.DEBT}
					<Plate variant="debt">
						<KeyValue key={$LL.DEBT()} value={formatCurrency(balanceGroup.balance)} />
					</Plate>
				{:else if index === BalanceGroup.INVESTMENTS}
					<Plate variant="investments">
						<KeyValue key={$LL.INVESTMENTS()} value={formatCurrency(balanceGroup.balance)} />
					</Plate>
				{:else if index === BalanceGroup.OTHER_ASSETS}
					<Plate variant="otherAssets">
						<KeyValue key={$LL.OTHER_ASSETS()} value={formatCurrency(balanceGroup.balance)} />
					</Plate>
				{/if}

				<ul class="card-group flex flex-col gap-3">
					{#each Object.entries(balanceGroup.groups) as [name, accountsOrAssets]}
						{#if accountsOrAssets}
							<li class="">
								<Plate>
									<KeyValue
										key={name}
										value={formatCurrency(calculateTotalBalance(accountsOrAssets))}
									/>
									<ul class="py-1.5 border-t border-chromeo-300">
										{#each accountsOrAssets as accountOrAsset}
											<li class="flex flex-row items-center justify-between text-xs px-4 my-3 ">
												{accountOrAsset.name}
												<Number>
													{formatCurrency(accountOrAsset.balance ?? 0)}
												</Number>
											</li>
										{/each}
									</ul>
								</Plate>
							</li>
						{/if}
					{/each}
				</ul>
			</li>
		{/each}
	</ul>
</Section>
