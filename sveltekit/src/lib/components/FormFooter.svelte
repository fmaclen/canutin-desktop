<footer class="form__footer">
	<slot />
</footer>

<style lang="scss">
	footer.form__footer {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		font-size: 12px;
		gap: 12px;
		padding: 8px 12px;
		background-color: var(--color-border);
	}
</style>
