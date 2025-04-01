<script lang="ts">
	interface Props {
		value: string;
		options: { value: string; label: string }[];
		disabled?: boolean;
	}

	let { value = $bindable(), options, disabled = false }: Props = $props();
</script>

<div class="bg-chromeo-300 inline-flex rounded-md">
	{#each options as option}
		{@const isActive = value === option.value}
		<button
			{disabled}
			onclick={() => (value = option.value)}
			class="rounded px-4 py-1 font-mono text-xs uppercase transition-colors duration-200 cursor-pointer {isActive
				? 'text-brand bg-white shadow-sm'
				: 'text-chromeo-700 hover:text-chromeo-900'} {disabled
				? 'cursor-not-allowed opacity-50'
				: ''}"
		>
			{option.label}
		</button>
	{/each}
</div>
