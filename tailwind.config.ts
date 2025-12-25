import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      fontSize: {
        // Hero/Display - "SUBMIT A NEW TOOL", "Browse by Intent"
        'display': ['3.375rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '300' }], // 54px Light
        'display-bold': ['3.375rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }], // 54px Semibold

        // Tool Names - "Hubspot"
        'tool-name': ['2.625rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }], // 42px Bold

        // Section Headings - "The Bedwinning Standard", Card titles
        'heading': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }], // 24px Semibold

        // Eyebrows - "THE HONEST VERDICT", "OUR MISSION", "QUALITY INDEX"
        'eyebrow': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.1em', fontWeight: '600' }], // 12px Semibold, uppercase

        // Body - paragraphs, descriptions
        'body': ['1rem', { lineHeight: '1.7', letterSpacing: '0', fontWeight: '400' }], // 16px Regular

        // Small body - card descriptions, helper text
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }], // 14px Regular

        // Tagline - "AI-powered CRM and customer platform..."
        'tagline': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }], // 18px Regular

        // Quote/Testimonial
        'quote': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0', fontWeight: '300' }], // 18px Light, use serif

        // Labels/Tags - "BUSINESS", "FREEMIUM", "CHATBOT"
        'label': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em', fontWeight: '600' }], // 12px Semibold

        // Form labels - "TOOL NAME", "WEBSITE URL"
        'form-label': ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.1em', fontWeight: '600' }], // 11px Semibold, uppercase

        // Tiny - legal, footnotes
        'tiny': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }], // 12px Regular
      },

      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',

        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },

        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },

        // Granular neutral grays (50-900 scale)
        neutral: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },

        brand: {
          DEFAULT: 'var(--color-brand)',
          hover: 'var(--color-brand-hover)',
          subtle: 'var(--color-brand-subtle)',
        },

        interactive: {
          DEFAULT: 'var(--color-interactive)',
          hover: 'var(--color-interactive-hover)',
        },

        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },

        success: {
          DEFAULT: 'var(--color-success)',
          subtle: 'var(--color-success-subtle)',
        },

        warning: {
          DEFAULT: 'var(--color-warning)',
          subtle: 'var(--color-warning-subtle)',
        },

        destructive: {
          DEFAULT: 'var(--color-destructive)',
          subtle: 'var(--color-destructive-subtle)',
        },

        chart: {
          1: 'var(--color-chart-1)',
          2: 'var(--color-chart-2)',
          3: 'var(--color-chart-3)',
          4: 'var(--color-chart-4)',
          5: 'var(--color-chart-5)',
        },

        sidebar: {
          DEFAULT: 'var(--color-sidebar)',
          foreground: 'var(--color-sidebar-foreground)',
          primary: 'var(--color-sidebar-primary)',
          'primary-foreground': 'var(--color-sidebar-primary-foreground)',
          accent: 'var(--color-sidebar-accent)',
          'accent-foreground': 'var(--color-sidebar-accent-foreground)',
          border: 'var(--color-sidebar-border)',
        },

        // Kill Tailwind's default colors to prevent leakage
        blue: undefined,
        indigo: undefined,
        violet: undefined,
        purple: undefined,
        fuchsia: undefined,
        pink: undefined,
        rose: undefined,
      },
    },
  },
  plugins: [],
} satisfies Config