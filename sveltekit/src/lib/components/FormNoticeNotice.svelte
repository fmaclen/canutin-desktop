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
		background-color: var(--color-white);
		box-shadow: vare(--box-shadow);
		border-radius: 3px;
		font-size: 13px;
		border-left: 3px solid var(--color-neutral-200);

		&--active {
			border-left-color: var(--color-bluePrimary);
		}
		&--positive {
			border-left-color: var(--color-greenPrimary);
		}
		&--negative {
			border-left-color: var(--color-redPrimary);
		}
		&--warning {
			border-left-color: var(--color-yellowPrimary);
		}
	}
</style>
