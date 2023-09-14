<script lang="ts">
	export let hasCheckbox: boolean = false;
	export let hasTag: boolean = false;
	export let isNotice: boolean = false;
	export let isAlignedRight: boolean = false;
	export let isLoading: boolean = false;
</script>

<td
	class="table__td
		{hasCheckbox && 'table__td--checkbox'}
		{hasTag && 'table__td--with-tag'}
		{isNotice && 'table__td--notice'}
		{isAlignedRight && 'table__td--align-right'}
		{isLoading && 'table__td--loading'}
	"
	colspan={isNotice ? 999 : undefined}
>
	{#if !isLoading}
		<slot />
	{/if}
</td>

<style lang="scss">
	td.table__td {
		font-size: 12px;
		padding: 12px 16px 12px 0;
		color: var(--color-neutral-800);

		&:first-child:not(.table__td--notice) {
			padding-left: 16px;
		}

		&--checkbox,
		&--checkbox:first-child:not(.table__td--notice) {
			padding: unset;
			width: max-content;
		}

		&--notice {
			text-align: center;
			padding: 32px;
			background-color: var(--color-neutral-50);
			color: var(--color-neutral-500);
		}

		&--with-tag {
			padding-top: 8px;
			padding-bottom: 8px;
		}

		&--align-right {
			text-align: right;
		}

		&--loading {
			@keyframes loading-animation {
				0% {
					background-position: -250px 0;
				}
				100% {
					background-position: 250px 0;
				}
			}

			&::after {
				content: '';
				border-radius: 2px;
				width: 100%;
				height: 14.5px; // Computed height of <TableValue>'s numeric values
				display: inline-block;
				background: linear-gradient(
					to right,
					var(--color-neutral-50) 20%,
					var(--color-neutral-100) 50%,
					var(--color-neutral-50) 80%
				);
				background-size: 512px 80px;
				animation-duration: 0.5s;
				animation-iteration-count: infinite;
				animation-timing-function: linear;
				animation-fill-mode: forwards;
				animation: loading-animation 2s linear infinite;
			}
		}
	}
</style>
