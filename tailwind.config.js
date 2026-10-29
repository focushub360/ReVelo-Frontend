import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [join(root, 'index.html'), join(root, 'src/**/*.{js,jsx}')],
  theme: { extend: { colors: { navy: '#071D36', sky: '#38A8F5', surface: '#F5F8FC' } } },
  plugins: [],
};
