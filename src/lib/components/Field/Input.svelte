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

<div class="field-input">
	<input
		bind:value
		class="field-input__input"
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

<style lang="postcss">
	.field-input {
		@apply flex w-full items-center rounded bg-chromeo-200 outline-2 outline-chromeo-800;
		@apply focus-within:bg-transparent focus-within:outline;
	}

	.field-input__input {
		@apply block w-full bg-transparent p-2 font-mono text-xs text-chromeo-900 outline-none;
		@apply placeholder:text-chromeo-950/30;
	}
</style>
