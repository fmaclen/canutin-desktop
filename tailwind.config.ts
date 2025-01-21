import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				chromeo: {
					50: 'hsl(var(--chromeo-50) / <alpha-value>)',
					100: 'hsl(var(--chromeo-100) / <alpha-value>)',
					200: 'hsl(var(--chromeo-200) / <alpha-value>)',
					300: 'hsl(var(--chromeo-300) / <alpha-value>)',
					400: 'hsl(var(--chromeo-400) / <alpha-value>)',
					500: 'hsl(var(--chromeo-500) / <alpha-value>)',
					600: 'hsl(var(--chromeo-600) / <alpha-value>)',
					700: 'hsl(var(--chromeo-700) / <alpha-value>)',
					800: 'hsl(var(--chromeo-800) / <alpha-value>)',
					900: 'hsl(var(--chromeo-900) / <alpha-value>)',
					950: 'hsl(var(--chromeo-950) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)'
				}
			}
		},
		textColor: ({ theme }) => ({
			...theme('colors'),
			DEFAULT: theme('colors.chromeo.800')
		}),
		borderColor: ({ theme }) => ({
			...theme('colors'),
			DEFAULT: 'hsl(var(--border) / <alpha-value>)'
		})
	},
	plugins: []
} satisfies Config;
