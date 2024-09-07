<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getPbClientContext } from '$lib/pocketbase.svelte';

	let email = $state('');
	let password = $state('');

	const pbClient = getPbClientContext();

	async function handleLogin(e: Event) {
		e.preventDefault();
		await pbClient.signIn(email, password);
	}
</script>

<h1>{$LL.SIGN_IN()}</h1>

{#if pbClient.authMessage}
	<p class="auth-message">{pbClient.authMessage}</p>
{/if}

<form onsubmit={(e) => handleLogin(e)}>
	<div>
		<label for="serverUrl">{$LL.CANUTIN_SERVER_URL()}</label>
		<input type="url" id="serverUrl" bind:value={pbClient.serverUrl.value} required />
	</div>
	<div>
		<label for="email">{$LL.EMAIL()}</label>
		<input type="email" id="email" name="email" bind:value={email} required />
	</div>
	<div>
		<label for="password">{$LL.PASSWORD()}</label>
		<input type="password" id="password" name="password" bind:value={password} required />
	</div>
	<button type="submit">{$LL.SIGN_IN_BUTTON()}</button>
</form>

<style>
	.auth-message {
		color: red;
		margin-bottom: 1em;
	}
</style>
