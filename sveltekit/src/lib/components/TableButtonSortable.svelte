<script lang="ts">
	import type { SortOrder } from '$lib/helpers/constants';

	export let label: string;
	export let sortOrder: SortOrder;
	export let sortBy: boolean = false;
</script>

<button
	class="table__sortable
	{sortBy && 'table__sortable--active'}
	{sortBy && `table__sortable--${sortOrder}`}"
	on:click
>
	{label}
</button>

<style lang="scss">
	button.table__sortable {
		border: none;
		padding: 0;
		background-color: transparent;
		color: var(--color-grey40);
		text-decoration: none;
		cursor: pointer;

		&:hover,
		&:hover::after {
			color: var(--color-bluePrimary);
		}

		&--active {
			color: var(--color-grey80);
			font-weight: 600;
		}

		&--asc,
		&--desc {
			&::after {
				position: relative;
				display: inline-block;
				padding-left: 4px;
				font-size: 8px;
				color: var(--color-grey70);
				line-height: 1em;
			}
		}

		&--asc::after {
			content: '▲';
		}

		&--desc::after {
			content: '▼';
		}
	}
</style>
