import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1e7a46',
          secondary: '#f4a259',
          accent: '#4caf50'
        }
      }
    }
  },
  plugins: []
};

export default config;



