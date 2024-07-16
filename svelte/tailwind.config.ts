import tailwindCss3d from "tailwindcss-3d";
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: [{ pattern: /grid-cols-.+/ }],
	theme: {
		extend: {}
	},
	plugins: [tailwindCss3d]
};
