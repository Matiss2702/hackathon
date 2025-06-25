import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        backgroundImage: {
          'custom-gradient': 'linear-gradient(90deg, rgba(5, 59, 132, 1) 0%, rgba(154, 7, 198, 1) 100%)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
