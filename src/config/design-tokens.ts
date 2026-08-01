export const designTokens = {
  breakpoints: { xs: 360, sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536, "3xl": 1920 },
  motion: { instant: 0.1, fast: 0.16, base: 0.24, slow: 0.42, financial: 0.7 },
  zIndex: { base: 0, raised: 10, navigation: 40, overlay: 60, modal: 70, toast: 80 },
} as const;
