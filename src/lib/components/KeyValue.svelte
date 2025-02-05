<script lang="ts">
	interface Props {
		key: string;
		value: string;
	}

	let { key, value }: Props = $props();
</script>

<div class="flex h-full w-full flex-row items-center justify-between">
	<p class="key text-sm font-bold tracking-tight p-4">{key}</p>
	<p class="value font-mono text-sm p-4">{value}</p>
</div>
