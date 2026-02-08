import type { Config } from 'tailwindcss'
// import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
      },
    },
  },
  // plugins: [tailwindcssAnimate],
}

export default config
