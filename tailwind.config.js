import aspectRatio from '@tailwindcss/aspect-ratio'
import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Savile Row design system. `poppins` kept only so any
        // not-yet-restyled screen doesn't fall back to the browser
        // default serif while it's migrated.
        poppins: ['Spectral', 'Georgia', 'serif'],
        caslon: ['"Libre Caslon Display"', 'Georgia', 'serif'],
        spectral: ['Spectral', 'Georgia', 'serif'],
        archivo: ['"Archivo Narrow"', 'sans-serif'],
      },
      colors: {
        'navy-blue': {
          DEFAULT: '#1a237e',
          dark: '#121858',
          light: '#534bae',
        },
        // Savile Row palette (design system doc: "Savile Row.dc.html")
        navy: { DEFAULT: '#1B2440', dark: '#14161F' },
        claret: { DEFAULT: '#6B2233', dark: '#521A27' },
        brass: '#A9884C',
        paper: '#EFECE4',
        shirting: '#F7F5EF',
        chalk: '#D8D3C6',
        flannel: '#3A3D45',
        ink: '#14161F',
        hairline: '#CBC5B6',
        // shadcn/ui theme (ported from Steth_admin_Panel), scoped in
        // practice to the /admin/* section - nothing in the storefront
        // references these class names today.
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
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
  plugins: [
    aspectRatio,
    tailwindcssAnimate,
  ],
}
