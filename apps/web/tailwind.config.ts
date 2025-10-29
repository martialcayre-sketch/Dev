import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        neuro: {
          '50': '#f3f8f9',
          '100': '#daf1f3',
          '200': '#b5e4e9',
          '300': '#83d0d9',
          '400': '#4db5c3',
          '500': '#2f97a7',
          '600': '#2a7b8c',
          '700': '#286474',
          '800': '#275361',
          '900': '#244653',
          '950': '#142c37',
        },
        calm: {
          '50': '#f4f7f7',
          '100': '#e2eced',
          '200': '#c7dada',
          '300': '#a0c1c2',
          '400': '#73a1a3',
          '500': '#578588',
          '600': '#4a6f72',
          '700': '#425c5f',
          '800': '#3b4d50',
          '900': '#354245',
          '950': '#1d2527',
        },
        focus: {
          '50': '#fff9ed',
          '100': '#fff1d3',
          '200': '#ffdfa5',
          '300': '#ffc66d',
          '400': '#ffa133',
          '500': '#ff810a',
          '600': '#ff6600',
          '700': '#cc4902',
          '800': '#a1380b',
          '900': '#82310c',
          '950': '#461604',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
