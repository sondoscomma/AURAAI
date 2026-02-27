export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        onyx: "#161616",
        platinum: "#EDEDED",
        mauve: "#C6A6F7",
        brand: {
          velvet: "#532C86",
          amethyst: "#2B144C",
        },
      },
    fontFamily: {
            display: ["Bricolage Grotesque", "ui-sans-serif", "system-ui"],
            body: ["General Sans", "ui-sans-serif", "system-ui"],
            bricolage: ['"Bricolage Grotesque"', 'sans-serif'],
            headers: ['"Bricolage Grotesque"', 'sans-serif'],
            },
    },
  },
  plugins: [],
};
