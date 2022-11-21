<script lang="ts">
	export let hasCheckbox: boolean = false;
	export let hasDate: boolean = false;
	export let hasTotal: boolean = false;
	export let hasTag: boolean = false;
	export let isPositive: boolean = false;
	export let isNotice: boolean = false;
	export let isAlignedRight: boolean = false;
</script>

<td
	class="table__td
		{hasCheckbox && 'table__td--checkbox'}
		{hasDate && 'table__td--date'}
		{hasTotal && 'table__td--total'}
		{hasTag && 'table__td--with-tag'}
		{isPositive && 'table__td--positive'}
		{isNotice && 'table__td--notice'}
		{isAlignedRight && 'table__td--align-right'}
	"
	colspan={isNotice ? 999 : undefined}
>
	<slot />
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

		&--date {
			font-family: var(--font-monospace);
			text-transform: uppercase;
			font-size: 11px;
			line-height: 16px;
		}

		&--total {
			font-family: var(--font-monospace);
			line-height: 16px;
		}

		&--positive {
			color: var(--color-greenPrimary);
		}

		&--notice {
			text-align: center;
			padding: 32px;
			background-color: var(--color-grey5);
			color: var(--color-grey50);
		}

		&--with-tag {
			vertical-align: middle;
			padding-top: 6px;
			padding-bottom: 6px;
		}

		&--align-right {
			text-align: right;
		}
	}
</style>
