/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // add this line
  ],
  theme: {
    extend: {
      colors: {
        'blackish': '#212121',
        'whiteish': '#FCF6F5FF',
        'reddish':'#990011FF',
      }
    },
  },
  plugins: [],
};
