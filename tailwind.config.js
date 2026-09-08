import tailwindAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./login.html",
    "./gerenciar.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--panel-line)",
        input: "var(--panel-line)",
        ring: "var(--blue)",
        background: "var(--bg)",
        foreground: "var(--text)",
        primary: {
          DEFAULT: "var(--blue)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--panel-elevated)",
          foreground: "var(--text)",
        },
        destructive: {
          DEFAULT: "var(--red)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--panel-elevated)",
          foreground: "var(--muted)",
        },
        accent: {
          DEFAULT: "var(--panel-hover)",
          foreground: "var(--text)",
        },
        popover: {
          DEFAULT: "var(--panel)",
          foreground: "var(--text)",
        },
        card: {
          DEFAULT: "var(--panel)",
          foreground: "var(--text)",
        },
        /* Tokens próprios do Design System da Igreja */
        panel: {
          DEFAULT: "var(--panel)",
          line: "var(--panel-line)",
          hover: "var(--panel-hover)",
          elevated: "var(--panel-elevated)",
        },
        blue: {
          DEFAULT: "var(--blue)",
          glow: "var(--blue-glow)",
          bg: "var(--blue-bg)",
          border: "var(--blue-border)",
        },
        red: {
          DEFAULT: "var(--red)",
          glow: "var(--red-glow)",
          bg: "var(--red-bg)",
          border: "var(--red-border)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindAnimate],
};
