<script lang="ts">
	export let title: string;
</script>

<h2 class="sectionTitle">{title}</h2>

<style lang="scss">
	h2.sectionTitle {
		font-family: var(--font-monospace);
		color: var(--color-neutral-400);
		font-size: 12px;
		font-weight: unset;
		line-height: 1em;
		letter-spacing: 0.1em;
		margin-top: 0;
		margin-bottom: 0;
		text-transform: uppercase;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		cursor: default;
	}
</style>
