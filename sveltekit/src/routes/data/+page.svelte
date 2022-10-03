<script>
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import iconImport from '$lib/assets/icon-import.svg';
	import iconAccount from '$lib/assets/icon-account.svg';
	import iconAsset from '$lib/assets/icon-asset.svg';
	import iconTransaction from '$lib/assets/icon-transaction.svg';

	const title = 'Add or update data';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title} isFullscreen={true}>
	<nav class="wizard">
		<Section title="Import CanutinFile">
			<div slot="CONTENT" class="wizard__container">
				<a href="/settings" class="wizard__a">
					<span class="wizard__icon">
						<img src={iconImport} class="wizard__icon" alt="Import icon" />
					</span>
					<div class="wizard__text">
						<p class="wizard__title">Sync</p>
						<p class="wizard__help">Fetch a CanutinFile-formatted JSON from a remote server</p>
					</div>
				</a>
				<a href="/import" class="wizard__a">
					<span class="wizard__icon">
						<img src={iconImport} class="wizard__icon" alt="Import icon" />
					</span>
					<div class="wizard__text">
						<p class="wizard__title">Import file</p>
						<p class="wizard__help">Import a CanutinFile-formatted JSON from a local file</p>
					</div>
				</a>
			</div>
		</Section>
		<Section title="Add new">
			<div slot="CONTENT" class="wizard__container">
				<a href="/account/add" class="wizard__a">
					<span class="wizard__icon">
						<img src={iconAccount} class="wizard__icon" alt="Add account icon" />
					</span>
					<div class="wizard__text">
						<p class="wizard__title">Add account</p>
						<p class="wizard__help">Add a new account by entering data manually</p>
					</div>
				</a>
				<a href="/asset/add" class="wizard__a">
					<span class="wizard__icon">
						<img src={iconAsset} class="wizard__icon" alt="Add asset icon" />
					</span>
					<div class="wizard__text">
						<p class="wizard__title">Add asset</p>
						<p class="wizard__help">Add a new asset by entering data manually</p>
					</div>
				</a>
				<a href="/transaction/add" class="wizard__a">
					<span class="wizard__icon">
						<img src={iconTransaction} class="wizard__icon" alt="Add transaction icon" />
					</span>
					<div class="wizard__text">
						<p class="wizard__title">Add transaction</p>
						<p class="wizard__help">Add a new transaction by entering data manually</p>
					</div>
				</a>
			</div>
		</Section>
	</nav>
</ScrollView>

<style lang="scss">
	nav.wizard {
		display: grid;
		grid-template-columns: 2fr 3fr;
		column-gap: 32px;
		width: 100%;
	}

	div.wizard__container {
		display: flex;
		width: 100%;
		height: 100%;
		gap: 8px;
	}

	a.wizard__a {
		display: block;
		background-color: white;
		width: 100%;
		border-radius: 4px;
		box-shadow: var(--box-shadow);
		text-decoration: none;
		color: unset;
		transition: transform 50ms, box-shadow 50ms;

		&:hover {
			transform: scale(1.02);

			p.wizard__help {
				color: var(--color-grey70);
			}
		}

		&:active {
			transform: scale(1);
		}
	}

	span.wizard__icon {
		display: flex;
		justify-content: flex-start;
		padding: 20px;
		background-color: #eff7ff;
		border-radius: 4px;
	}

	div.wizard__text {
		display: flex;
		flex-direction: column;
		row-gap: 4px;
		padding: 20px;
	}

	p.wizard__title,
	p.wizard__help {
		margin: 0;
	}

	p.wizard__title {
		font-size: 16px;
		letter-spacing: -0.03em;
		font-weight: 600;
	}

	p.wizard__help {
		font-size: 12px;
		color: var(--color-grey40);
		transition: color 75ms;
	}
</style>
