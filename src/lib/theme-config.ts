/**
 * THEME CONFIGURATION
 * 
 * This is the central theme configuration file for your application.
 * Modify these values to customize the look and feel of your app.
 * 
 * Colors use HSL format for better control over variations.
 * Format: "hue saturation% lightness%"
 */

export const themeConfig = {
  // Brand Information
  brand: {
    name: "Your App Name",
    tagline: "Your tagline here",
    logo: "/logo.png", // Place your logo in the public folder
  },

  // Color Palette
  colors: {
    // Primary brand color - used for buttons, links, etc.
    primary: {
      light: "210 100% 50%", // Light mode primary
      dark: "210 100% 60%",  // Dark mode primary
      foreground: "0 0% 100%", // Text color on primary background
    },

    // Secondary color - used for accents
    secondary: {
      light: "240 4.8% 95.9%",
      dark: "240 3.7% 15.9%",
      foreground: {
        light: "240 5.9% 10%",
        dark: "0 0% 98%",
      },
    },

    // Destructive/Error color
    destructive: {
      light: "0 84.2% 60.2%",
      dark: "0 62.8% 30.6%",
      foreground: "0 0% 98%",
    },

    // Success color
    success: {
      light: "142 76% 36%",
      dark: "142 70% 45%",
      foreground: "0 0% 100%",
    },

    // Warning color
    warning: {
      light: "38 92% 50%",
      dark: "38 92% 60%",
      foreground: "0 0% 100%",
    },

    // Info color
    info: {
      light: "199 89% 48%",
      dark: "199 89% 58%",
      foreground: "0 0% 100%",
    },

    // Background colors
    background: {
      light: "0 0% 100%",
      dark: "20 14.3% 4.1%",
    },

    // Foreground (text) colors
    foreground: {
      light: "240 10% 3.9%",
      dark: "0 0% 95%",
    },

    // Muted colors for disabled states
    muted: {
      light: "240 4.8% 95.9%",
      dark: "0 0% 15%",
      foreground: {
        light: "240 3.8% 46.1%",
        dark: "240 5% 64.9%",
      },
    },

    // Border colors
    border: {
      light: "240 5.9% 90%",
      dark: "240 3.7% 15.9%",
    },
  },

  // Typography
  typography: {
    // Font families
    fonts: {
      sans: "var(--font-inter)",
      mono: "var(--font-roboto-mono)",
    },

    // Font sizes (in rem)
    sizes: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem",    // 48px
    },

    // Font weights
    weights: {
      thin: "100",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },

    // Line heights
    lineHeights: {
      tight: "1.2",
      normal: "1.5",
      relaxed: "1.75",
      loose: "2",
    },
  },

  // Spacing scale (in rem)
  spacing: {
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
    "3xl": "4rem",   // 64px
    "4xl": "6rem",   // 96px
  },

  // Border radius
  radius: {
    none: "0",
    sm: "0.125rem",  // 2px
    base: "0.25rem", // 4px
    md: "0.375rem",  // 6px
    lg: "0.5rem",    // 8px
    xl: "0.75rem",   // 12px
    "2xl": "1rem",   // 16px
    full: "9999px",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  },

  // Animations
  animations: {
    duration: {
      fast: "150ms",
      base: "300ms",
      slow: "500ms",
      slower: "700ms",
    },
    easing: {
      linear: "linear",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
};

// Export individual configs for convenience
export const { colors, typography, spacing, radius, shadows, animations, breakpoints, zIndex, brand } = themeConfig;
