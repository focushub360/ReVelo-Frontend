import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [join(root, 'index.html'), join(root, 'src/**/*.{js,jsx}')],
  theme: {
    extend: {
      colors: { navy: '#101C2C', 'navy-soft': '#18283C', canvas: '#F4F6F8', surface: '#FFFFFF', ink: '#172333', muted: '#64748B', line: '#E2E8F0', champagne: '#C69A52', success: '#16865B', warning: '#D69A35', danger: '#D94B4B', sky: '#2878C8' },
      fontFamily: { sans: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { panel: '0 1px 2px rgba(16, 28, 44, .04), 0 12px 32px rgba(16, 28, 44, .06)', float: '0 18px 45px rgba(16, 28, 44, .14)' },
    },
  },
  plugins: [],
};
