<script lang="ts">
	export let isHighlighted: boolean = false;
</script>

<tr
	class="table__tr
		{isHighlighted && 'table__tr--highlight'}
	"
>
	<slot />
</tr>

<style lang="scss">
	tr.table__tr {
		border-bottom: 1px dashed var(--color-border);
		vertical-align: top;

		&:nth-child(odd) {
			:global(td.table__td) {
				background-color: var(--color-neutral-30);
			}
		}

		&:last-child {
			border-bottom: none;

			:global(td.table__td:first-child) {
				border-bottom-left-radius: 4px;
			}

			:global(td.table__td:last-child) {
				border-bottom-right-radius: 4px;
			}
		}

		&:hover,
		&--highlight {
			&:nth-child(even),
			&:nth-child(odd) {
				:global(td.table__td:not(.table__td--notice)) {
					background-color: var(--color-blueSecondary);
				}
			}
		}
	}
</style>
