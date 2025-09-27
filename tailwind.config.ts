import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Wedding-specific colors
        'romantic-pink': "hsl(var(--romantic-pink))",
        'blush': "hsl(var(--blush))",
        'cream': "hsl(var(--cream))",
        'gold': "hsl(var(--gold))",
        'soft-white': "hsl(var(--soft-white))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-romantic': 'var(--gradient-romantic)',
        'gradient-sunset': 'var(--gradient-sunset)',
        'gradient-elegant': 'var(--gradient-elegant)',
      },
      boxShadow: {
        'romantic': 'var(--shadow-romantic)',
        'elegant': 'var(--shadow-elegant)',
        'soft': 'var(--shadow-soft)',
      },
      transitionTimingFunction: {
        'romantic': 'var(--transition-romantic)',
        'elegant': 'var(--transition-elegant)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "heart-bounce": {
          "0%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.3)" },
          "30%": { transform: "scale(1.1)" },
          "50%": { transform: "scale(1.4)" },
          "80%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "float-up": {
          "0%": { 
            opacity: "1",
            transform: "translateY(0) scale(0.8)"
          },
          "100%": { 
            opacity: "0",
            transform: "translateY(-50px) scale(1.2)"
          },
        },
        "pulse-ring": {
          "0%": {
            transform: "scale(1)",
            boxShadow: "var(--heart-bounce)"
          },
          "100%": {
            transform: "scale(1.1)",
            boxShadow: "var(--heart-bounce-active)"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "heart-bounce": "heart-bounce 0.6s ease-out",
        "float-up": "float-up 1s ease-out forwards",
        "pulse-ring": "pulse-ring 0.6s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
