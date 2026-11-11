/** Tailwind compilado no build (antes era o CDN no navegador).
 * As cores apontam para variáveis CSS: assim o tema claro/escuro e o painel
 * "Aparência" trocam as cores do site inteiro sem recompilar. */
const scale = (name) => Object.fromEntries(
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [n, `rgb(var(--${name}-${n}) / <alpha-value>)`])
);
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-titulo)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-texto)", "\"DM Sans\"", "system-ui", "sans-serif"],
      },
      colors: {
        stone: scale("stone"),
        emerald: scale("emerald"),
        amber: scale("amber"),
        sky: scale("sky"),
        rose: scale("rose"),
        violet: scale("violet"),
        lime: scale("lime"),
        page: v("page"),
        surface: v("surface"),
        ink: v("ink"),
        "ink-fg": v("ink-fg"),
        // cores da marca editáveis no painel (Aparência)
        destaque: v("destaque"),
        "destaque-fg": v("destaque-fg"),
        banner: v("banner"),
      },
    },
  },
  plugins: [],
};
