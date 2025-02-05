<script lang="ts">
	interface Props {
		key: string;
		value: string;
	}

	let { key, value }: Props = $props();
</script>

<div class="flex flex-row justify-between h-full items-center w-full">
	<p class="key text-sm font-bold tracking-tight">{key}</p>
	<p class="value text-sm font-mono">{value}</p>
</div>
