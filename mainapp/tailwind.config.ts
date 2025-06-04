/** @type {import('tailwindcss').Config} */
import tailwindScrollbar from 'tailwind-scrollbar'
import tailwindcssRtl from 'tailwindcss-rtl'

const config: import('tailwindcss').Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: 'hsla(52, 96%, 64%,1)',
          secondary: 'hsla(45, 92%, 70%, 1)',
          primaryActiveButton: 'hsla(52, 100%, 50%, 1 )',
          tertiary: 'hsla(46, 93%, 95%, 1)',
        },
        base: {
          primary: 'hsla(0, 0%, 9%, 1)',
          base800: 'hsla(228, 9%, 23%, 1)',
          primaryDisabledButton: 'hsl(0, 0%, 18%, 1)',
          secondary: 'hsla(228, 6%, 15%, 1)',
          secondaryDefaultButton: 'hsla(180, 2%, 20%, 1)',
          secondaryHoveredButton: 'hsla(220,15%,16%, 1)',
          secondaryActiveButton: 'hsl(219, 10%, 27%, 1)',
          secondaryDisabledButton: 'hsl(180, 2%, 20%, 1)',
          inputs: 'hsla(220, 10%, 27%, 1)',
          stroke: 'hsla(220, 10%, 27%, 1)',
          disabled: 'hsla(220, 10%, 27%, 1)',
          primaryIcon: 'hsla(0, 0%, 9%, 1)',
          disabledIcon: 'hsla(0, 0%, 52%, 1)',
          secondaryIcon: 'hsla(0,0%,100%, 1)',
          bellIcon: 'hsla(0,0%,78%, 1)',
          warning: 'hsla(228, 9%, 23%, 1)',
          scroll: 'hsla(219,10%,27%, 1)',
          white: 'hsla(0, 0%, 100%, 1)',
          warningBaseStrokeAlternative: 'hsla(180, 2%, 38%, 1)',
          base900: 'hsla(231, 8%, 18%, 1)',
          tertiaryDisabledButton: 'hsla(231, 9%, 28%, 1)',
        },
        textTheme: {
          primary: 'hsla(0, 0%, 100%, 1)',
          secondary: 'hsla(0,0%,82%, 1)',
          disabled: 'hsla(0, 0%, 52%, 1)',
          secondaryIcons: 'hsla(0, 0%, 78%, 1)',
          darkPrimary: 'hsla(0, 0%, 9%, 1)',
        },
        warning: {
          success100: 'hsla(169, 39%, 45%, 1)',
          success500: 'hsla(180, 18%, 21%, 1)',
          warning100: 'hsla(26, 68%, 52%, 1)',
          warning500: 'hsla(24, 26%, 22%, 1)',
          error100: 'hsla(0, 68%, 52%, 1)',
          error500: 'hsla(0, 26%, 22%, 1)',
          validation: 'hsla(11, 77%, 58%, 1)',
        },
      },
      screens: {
        xs: '390px',
        sm: '768px',
        md: '1024px',
        l: '1280px',
        xl: '1440px',
      },
      fontSize: {
        '3xs': '0.75rem',
        '2xs': '0.9rem',
        xs: '1rem',
        sm: '1.2rem',
        base: '0.75rem',
        xl: '1.6rem',
        '2xl': '1.8rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.1rem',
        '6xl': '4.8rem',
      },
      fontWeight: {
        hairline: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        'extra-bold': '800',
        black: '900',
      },
      fontFamily: {
        ru: ['Roboto', 'sans'],
        he: ['Arimo', 'sans'],
      },
    },
  },
  plugins: [tailwindcssRtl, tailwindScrollbar({ nocompatible: true })],
}

export default config
