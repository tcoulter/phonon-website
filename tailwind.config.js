const { spacing } = require('tailwindcss/defaultTheme');
module.exports = {
  // Uncomment the line below to enable the experimental Just-in-Time ("JIT") mode.
  // https://tailwindcss.com/docs/just-in-time-mode
  mode: "jit",
  theme: {
    extend: {
      fontFamily: {
          sans: ['BandeinsSans'],
      },
      typography: (theme) => ({
          DEFAULT: {
              css: {
                  color: theme('colors.gray.300'),
                  a: {
                      color: theme('colors.blue.400'),
                      '&:hover': {
                          color: theme('colors.blue.600'),
                      },
                      code: { color: theme('colors.blue.400') },
                  },
                  blockquote: {
                      borderLeftColor: theme('colors.gray.700'),
                      color: theme('colors.gray.300'),
                  },
                  'h2,h3,h4': {
                      color: theme('colors.gray.100'),
                      'scroll-margin-top': spacing[32],
                  },
                  hr: { borderColor: theme('colors.gray.700') },
                  ol: {
                      li: {
                          '&:before': { color: theme('colors.gray.500') },
                      },
                  },
                  ul: {
                      li: {
                          '&:before': {
                              backgroundColor: theme('colors.gray.500'),
                          },
                      },
                  },
                  strong: { color: theme('colors.gray.300') },
                  thead: {
                      color: theme('colors.gray.100'),
                  },
                  tbody: {
                      tr: {
                          borderBottomColor: theme('colors.gray.700'),
                      },
                  },
              },
          },
      }),
  },
  },
  variants: {
    typography: ['dark'],
  },
  plugins: [require('@tailwindcss/typography')],
  purge: {
    // Filenames to scan for classes
    content: [
      "./src/**/*.html",
      "./src/**/*.js",
      "./src/**/*.jsx",
      "./src/**/*.ts",
      "./src/**/*.tsx",
      "./public/index.html",
    ],
    // Options passed to PurgeCSS
    options: {
      // Whitelist specific selectors by name
      // safelist: [],
    },
  },
};
