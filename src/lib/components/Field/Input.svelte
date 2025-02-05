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

<div
	class={[
		'bg-chromeo-200 outline-chromeo-500 flex w-full items-center rounded outline-1',
		'focus-within:outline-chromeo-900 focus-within:bg-transparent focus-within:outline-2'
	]}
>
	<input
		bind:value
		class="text-chromeo-900 placeholder:text-chromeo-950/30 block w-full bg-transparent p-2 font-mono text-xs outline-none"
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
