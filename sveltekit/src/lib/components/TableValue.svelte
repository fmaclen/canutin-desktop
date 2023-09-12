<script lang="ts">
	export let title: string | undefined = '';
	export let isExcluded: boolean = false;
	export let isPositive: boolean = false;
	export let isNegative: boolean = false;
	export let isNumeric: boolean = false;
	export let isDate: boolean = false;
</script>

<span
	class="tableValue
		{title && `tableValue--title`}
		{isExcluded && `tableValue--excluded`}
		{isPositive && `tableValue--positive`}
		{isNegative && `tableValue--negative`}
		{isNumeric && `tableValue--numeric`}
		{isDate && `tableValue--date`}
	"
	{title}
>
	<slot />
</span>

<style lang="scss">
	span.tableValue {
		&--excluded {
			color: var(--color-grey40);
		}

		&--title {
			border-bottom: 1px dashed var(--color-grey10);
			cursor: help;

			&:hover {
				border-bottom: 1px dashed var(--color-grey30);
			}
		}

		&--positive {
			color: var(--color-greenPrimary);
		}

		&--negative {
			color: var(--color-redPrimary);
		}

		&--numeric {
			font-family: var(--font-monospace);
			line-height: 16px;
		}

		&--date {
			font-family: var(--font-monospace);
			text-transform: uppercase;
			font-size: 11px;
			line-height: 16px;
		}
	}
</style>
