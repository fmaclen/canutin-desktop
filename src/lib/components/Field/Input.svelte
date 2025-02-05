<script lang="ts">
	interface Props {
		id: string;
		value?: string | File | null | number;
		disabled?: boolean;
		placeholder?: string;
		type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'url' | 'file';
		required?: boolean;
		accept?: string;
		onchange?: (e: Event) => void;
	}

	let {
		value = $bindable(''),
		disabled = false,
		placeholder = '',
		type = 'text',
		required = false,
		id = '',
		accept = '',
		onchange
	}: Props = $props();
</script>

<div class={[
	'flex w-full items-center rounded bg-chromeo-200 outline-1 outline-chromeo-500',
	'focus-within:bg-transparent focus-within:outline-chromeo-900 focus-within:outline-2'
]}>
	<input
		bind:value
		class="block w-full bg-transparent p-2 font-mono text-xs text-chromeo-900 outline-none placeholder:text-chromeo-950/30"
		{type}
		{disabled}
		{placeholder}
		{required}
		{id}
		{accept}
		{onchange}
		step={type === 'number' ? 'any' : undefined}
	/>
</div>
