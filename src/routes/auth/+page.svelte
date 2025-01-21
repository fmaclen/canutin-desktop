<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field';
	import Head from '$lib/components/Head.svelte';
	import { getPbClientContext } from '$lib/pocketbase.svelte';

	let auth = $state({
		email: '',
		password: '123qweasdzxc' // TODO: Remove this
	});

	const pbClient = getPbClientContext();

	async function handleLogin() {
		await pbClient.signIn(auth.email, auth.password);
	}
</script>

<Head title={$LL.SIGN_IN()} />

<div class="layout">
	<form>
		<h1>{$LL.SIGN_IN()}</h1>

		{#if pbClient.authMessage}
			<p class="auth-message">{pbClient.authMessage}</p>
		{/if}

		<Field>
			<Field.Label id="serverUrl">{$LL.CANUTIN_SERVER_URL()}</Field.Label>
			<Field.Input type="url" id="serverUrl" bind:value={pbClient.serverUrl.value} required />
		</Field>

		<Field>
			<Field.Label id="email">{$LL.EMAIL()}</Field.Label>
			<Field.Input type="email" id="email" bind:value={auth.email} required />
		</Field>

		<Field>
			<Field.Label id="password">{$LL.PASSWORD()}</Field.Label>
			<Field.Input type="password" id="password" bind:value={auth.password} required />
		</Field>

		<Button onclick={handleLogin} variant="primary" title={$LL.SIGN_IN_BUTTON()}>
			{$LL.SIGN_IN_BUTTON()}
		</Button>
	</form>
</div>

<style lang="postcss">
	.layout {
		@apply flex h-screen flex-col justify-center;
	}

	h1 {
		@apply mb-8 mr-auto text-center text-2xl font-bold tracking-tight;
	}

	form {
		@apply mx-auto flex w-96 flex-col items-start gap-4 rounded-md bg-chromeo-50 px-8 py-12 shadow;
	}

	.auth-message {
		color: tomato;
	}
</style>
