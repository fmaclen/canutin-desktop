export function toZonedTime(date: Date, timeZone: string): Date {
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	});

	const parts = formatter.formatToParts(date);
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

	return new Date(
		parseInt(values.year),
		parseInt(values.month) - 1,
		parseInt(values.day),
		parseInt(values.hour),
		parseInt(values.minute),
		parseInt(values.second)
	);
}

// Strip timezone from date and set to UTC
export const dateInUTC = (date: Date) => {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
};

export const formatInUTC = (date: Date, format: string) => {
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	});

	const parts = formatter.formatToParts(date);
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

	// Replace format tokens with actual values
	return format
		.replace('yyyy', values.year)
		.replace('MMM', values.month)
		.replace('dd', values.day)
		.replace('HH', values.hour)
		.replace('mm', values.minute)
		.replace('ss', values.second);
};
