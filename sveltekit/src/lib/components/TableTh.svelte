<script lang="ts">
	export let hasCheckbox: boolean = false;
	export let isAlignedRight: boolean = false;
</script>

<th
	class="table__th
		{hasCheckbox && 'table__th--checkbox'}
		{isAlignedRight && 'table__th--align-right'}
	"
>
	<slot />
</th>

<style lang="scss">
	th.table__th {
		color: var(--color-neutral-400);
		font-weight: 400;
		padding: 16px 16px 16px 0;
		position: sticky;
		top: 0;
		z-index: 1;
		box-shadow: inset 0 -2px 0 var(--color-neutral-100);
		background-color: #fff;
		text-align: left;
		box-sizing: border-box;

		&:first-child {
			padding-left: 16px;
		}

		&:last-child {
			padding-right: 16px;
		}

		&--checkbox,
		&--checkbox:first-child {
			padding: unset;
			width: max-content;
		}

		&--align-right {
			text-align: right;
		}
	}
</style>
