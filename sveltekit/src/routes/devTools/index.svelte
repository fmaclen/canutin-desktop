<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import Notice from '$lib/components/Notice.svelte';

	export let title = 'Developer tools';
	export let isSuccesful: boolean = false;

	const submitForm = async (event: any) => {
		event.preventDefault();

		await fetch('/devTools.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			isSuccesful = response.ok;
		});
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Database">
		<div slot="CONTENT" class="database">
			<form class="form" on:submit={submitForm}>
				<Button isNegative={true}>Delete all data</Button>
			</form>

			{#if isSuccesful}
				<Notice>Database wiped succesfully</Notice>
			{/if}
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.database {
		display: flex;
		flex-direction: column;
		row-gap: 16px;
	}

	form.form {
		border: 1px solid var(--color-border);
		border-radius: 4px;
		display: flex;
		padding: 12px;
	}
</style>
