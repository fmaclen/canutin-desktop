<script lang="ts">
	import type { Appearance } from '$lib/helpers/constants';

	export let appearance: Appearance | null = null;
</script>

<div class="formNotice__notice {appearance && `formNotice__notice--${appearance}`}">
	<slot />
</div>

<style lang="scss">
	div.formNotice__notice {
		display: grid;
		grid-row-gap: 8px;
		padding: 16px 19px 16px 16px;
		background-color: #ffffff;
		box-shadow: 0px 4px 15px rgb(0 0 0 / 10%), 0px 1px 1px rgb(0 0 0 / 5%);
		border-radius: 3px;
		font-size: 13px;
		border-left: 3px solid var(--color-grey20);

		&.formNotice--active {
			border-left-color: var(--color-bluePrimary);
		}
		&.formNotice--positive {
			border-left-color: var(--color-greenPrimary);
		}
		&.formNotice--negative {
			border-left-color: var(--color-redPrimary);
		}
		&.formNotice--warning {
			border-left-color: var(--color-yellowPrimary);
		}
	}
</style>
