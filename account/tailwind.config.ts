/** @type {import('tailwindcss').Config} */
import tailwindScrollbar from 'tailwind-scrollbar'
// @ts-ignore
import tailwindcssRtl from 'tailwindcss-rtl'

const config: import('tailwindcss').Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: 'hsla(52, 96%, 64%, 1)', //#FBE54D
          secondary: 'hsla(45, 92%, 70%, 1)', //#F9D66C
          tertiary: 'hsla(46, 93%, 95%, 1)', //#FEF8E4
          disabled: 'hsla(0, 0, 18%, 1)', //#2D2D2D
          accent500: 'hsla(52, 100%, 50%, 1 )', //#FFDF00
        },
        base: {
          primary: 'hsla(0, 0%, 9%, 1)', //#161616
          secondary: 'hsla(228, 6%, 15%, 1)', //#242529
          inputs: 'hsla(231, 8%, 18%, 1)', //#2A2B31
          stroke: 'hsla(180, 2%, 20%, 1)', //#333535
          disabled: 'hsla(225, 6%, 13%, 1)', //#1F2023
          base600: 'hsla(220, 15%, 16%, 1)', //#23272F
          base700: 'hsla(219, 10%, 27%, 1)', //#3F444D
          base800: 'hsla(228, 9%, 23%, 1)', //#35373F
          base900: 'hsla(231, 9%, 28%, 1)', //#41434E
          white: 'hsla(0, 0%, 100%, 1)', //#FFFFFF
          whiteAlternative: 'hsla(0, 0%, 96%, 1)', //#F5F5F5
          strokeAlternative: 'hsla(180, 2%, 38%, 1)', //#606363
          //дополнительные
          fog: 'hsla(0, 0%, 0%, 0.73)', // #000000
        },
        textTheme: {
          primary: 'hsla(0, 0%, 100%, 1)', //#FFFFFF
          secondary: 'hsla(0, 0%, 82%, 1)', //#D0D0D0
          disabled: 'hsla(0, 0%, 52%, 1)', //#848484
          secondaryIcons: 'hsla(0, 0%, 78%, 1)', //#C7C7C7
          darkPrimary: 'hsla(0, 0%, 9%, 1)', //#161616
          darkSecondary: 'hsla(180, 3%, 92%, 0.49)', //#EBECEC7D;
        },
        success: {
          success100: 'hsla(169, 39%, 45%, 1)', //#46A08F
          success200: 'hsla(169, 39%, 60%, 1)', //#71C1B2
          success300: 'hsla(171, 37%, 90%, 1)', //#DCEFEC
          success400: 'hsla(168, 38%, 95%, 1)', //#EDF7F5
          success500: 'hsla(180, 18%, 21%, 1)', //#2B3E3E
        },
        error: {
          error100: 'hsla(11, 77%, 58%, 1)', //#E76143
          error200: 'hsla(11, 78%, 70%, 1)', //#EE8D77
          error300: 'hsla(11, 76%, 90%, 1)', //#F9D9D2
          error400: 'hsla(12, 77%, 95%, 1)', //#FCECE8
          error500: 'hsla(11, 35%, 19%, 1)', //#40251F
        },
        warning: {
          warning100: 'hsla(26, 68%, 52%, 1)', //#D8782F
          warning200: 'hsla(26, 69%, 49%, 1)', //#E7AC7E
          warning300: 'hsla(26, 69%, 90%, 1)', //#F7E3D4
          warning400: 'hsla(25, 68%, 95%, 1)', //#FBF1EA
          warning500: 'hsla(24, 26%, 28%, 1)', //#48362A
        },
      },
      backgroundImage: {
        cardBack: 'linear-gradient(111deg, #483284 2%, #FFCD29 151.07%)',
      },
      screens: {
        xs: '390px',
        sm: '768px',
        md: '1024px',
        l: '1280px',
        xl: '1440px',
      },
      fontSize: {
        extraSm: '1rem',
        sm: '1.2rem',
        base: '1.4rem',
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
      borderRadius: {
        roundedLg: '8px',
      },
    },
  },
  plugins: [tailwindcssRtl, tailwindScrollbar({ nocompatible: true })],
}

export default config
