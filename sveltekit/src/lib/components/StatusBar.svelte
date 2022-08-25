<script lang="ts">
	import type { StatusBarAppearance } from './StatusBar';

	export let statusMessage: string;
	export let appearance: StatusBarAppearance | null = null;
</script>

<div class="statusBar {appearance && `statusBar--${appearance}`}">
	<p class="statusBar__p">
		{statusMessage}
	</p>
</div>

<style lang="scss">
	div.statusBar {
		display: flex;
		align-items: center;
		padding: 0 16px;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		color: var(--color-grey50);

		&--active,
		&--positive,
		&--negative {
			border-right: 1px solid var(--color-border);
		}

		&--active {
			color: var(--color-bluePrimary);
			background-color: var(--color-blueSecondary);
		}

		&--positive {
			color: var(--color-greenPrimary);
			background-color: var(--color-greenSecondary);
		}

		&--negative {
			color: var(--color-redPrimary);
			background-color: var(--color-redSecondary);
		}
	}

	p.statusBar__p {
		font-size: 12px;
		margin: 0;
	}
</style>
