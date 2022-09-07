<form class="form" on:submit|preventDefault>
	<slot />
</form>

<style lang="scss">
	form.form {
		border: 1px solid var(--color-border);
		border-radius: 4px;
		display: grid;
	}
</style>
