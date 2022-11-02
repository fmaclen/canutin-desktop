<table class="table">
	<slot />
</table>

<style lang="scss">
	table.table {
		position: relative;
		z-index: 1;
		width: 100%;
		table-layout: auto;
		border-collapse: collapse;
		font-size: 12px;

		&:first-child {
			:global(.table__th) {
				&:first-child {
					border-top-left-radius: 4px;
				}
				&:last-child {
					border-top-right-radius: 4px;
				}
			}
		}
	}
</style>
