<script lang="ts">
	interface Props {
		key: string;
		value: string;
	}

	let { key, value }: Props = $props();
</script>

<div class="flex h-full w-full flex-row items-center justify-between">
	<p class="key p-4 text-sm font-bold tracking-tight">{key}</p>
	<p class="value p-4 font-mono text-sm">{value}</p>
</div>
