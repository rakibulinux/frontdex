module.exports = {
  mode: 'jit',
  purge: {
    content: [
      './components/**/*.{ts,tsx}',
      './pages/**/*.{ts,tsx}',
      './pages/*.{ts,tsx}',
      '../node_modules/@openware/react-opendax/**/*.js'
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'primary-cta-color-main': 'var(--primary-cta-color-main)',
        'primary-cta-color-hover': 'var(--primary-cta-color-hover)',
        'dropdown-background-color': 'var(--dropdown-background-color)',
        'main-background-color': 'var(--main-background-color)',
      },
      textColor: {
        'primary-cta-color-main': 'var(--primary-cta-color-main)',
        'primary-cta-color-hover': 'var(--primary-cta-color-hover)',
        'color-contrast': 'var(--color-contrast)',
        'cta-contrast': 'var(--cta-contrast)',
        'secondary-color': 'var(--secondary-color)',
      },
      boxShadow: {
        'lg-updated':
          '0px 0px 2px rgba(0, 0, 0, 0.12), 0px 10px 15px -3px rgba(0, 0, 0, 0.12), 0px 4px 6px -2px rgba(0, 0, 0, 0.04);',
      },
      borderColor: {
        'divider-color-20': '1px solid var(--divider-color)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}
