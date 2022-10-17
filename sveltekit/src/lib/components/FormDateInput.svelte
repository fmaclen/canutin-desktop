<script lang="ts">
	import FormSelect from './FormSelect.svelte';
	import { LOCALE } from '$lib/helpers/misc';

	export let date: Date = new Date();
	export let name: string;
	export let disabled: boolean = false;

	$: inputDate = new Date(`${thisYear}-${thisMonth}-${thisDate}`).getTime() / 1000;

	let thisYear = date.getUTCFullYear();
	const years = [
		// Past 15 years
		...Array.from(Array(15).keys())
			.map((i) => thisYear - 1 - i)
			.reverse(),
		thisYear,
		// Next 15 years
		...Array.from(Array(15).keys()).map((i) => thisYear + 1 + i)
	];

	let thisMonth = date.getUTCMonth() + 1;
	let months = Array.from(Array(12).keys()).map((i) => i + 1); // 12 months in a year

	let thisDate = date ? date.getUTCDate() : new Date().getUTCDate();
	const days = Array.from(Array(31).keys()).map((i) => i + 1); // 31 days in a month

	const getDateSelects = (dates: number[]) => {
		const isMonth = dates.length === 12;

		return dates.map((date) => {
			return {
				label: isMonth
					? `${date} - ${new Date(thisYear, date - 1, 1).toLocaleString(LOCALE, {
							month: 'short'
					  })}` // e.g. "9 - Sep"
					: date.toString(),
				value: date
			};
		});
	};
</script>

<div class="form__date-field">
	<input type="hidden" {name} value={inputDate} />
	<FormSelect name="yearSelect" options={getDateSelects(years)} {disabled} bind:value={thisYear} />
	<FormSelect
		name="monthSelect"
		options={getDateSelects(months)}
		{disabled}
		bind:value={thisMonth}
	/>
	<FormSelect name="dateSelect" options={getDateSelects(days)} {disabled} bind:value={thisDate} />
</div>

<style lang="scss">
	div.form__date-field {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 4px;
	}
</style>
