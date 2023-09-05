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
		color: var(--color-grey80);

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
			background-color: var(--color-grey5);
			color: var(--color-grey50);
		}

		&--with-tag {
			padding-top: 8px;
			padding-bottom: 8px;
		}

		&--align-right {
			text-align: right;
		}

		&--loading {
			position: relative;
			overflow: hidden;
			background-color: var(--color-neutral-200);
			color: var(--color-neutral-400);

			@keyframes loading-animation {
				0% {
					left: -100%; // Initial position
				}

				100% {
					left: 100%; // Final position
				}
			}

			&::after {
				content: '';
				position: absolute;
				top: 0;
				width: 100%;
				height: 100%;
				background-image: linear-gradient(
					to right,
					rgba(243, 243, 243, 0),
					rgba(243, 243, 243, 0.75),
					rgba(243, 243, 243, 1),
					rgba(243, 243, 243, 0.75),
					rgba(243, 243, 243, 0)
				);
				animation: loading-animation 2s linear infinite;
			}
		}
	}
</style>
