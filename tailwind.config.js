import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [join(root, 'index.html'), join(root, 'src/**/*.{js,jsx}')],
  theme: {
    extend: {
      colors: { navy: '#0B3B60', 'navy-soft': '#15567F', canvas: '#F6F9FC', surface: '#FFFFFF', ink: '#0B3B60', muted: '#6E8EA5', line: '#D9E8F2', champagne: '#2D9CDB', success: '#2D9CDB', warning: '#7CC4EC', danger: '#15567F', sky: '#2D9CDB', steel: '#15567F', teal: '#2D9CDB' },
      fontFamily: { sans: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { panel: '0 1px 2px rgba(23, 43, 77, .04), 0 12px 32px rgba(23, 43, 77, .06)', float: '0 18px 45px rgba(23, 43, 77, .14)' },
    },
  },
  plugins: [],
};
