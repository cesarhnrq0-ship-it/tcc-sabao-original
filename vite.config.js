import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// npm run build         -> publicar/        (GitHub Pages: index.html + assets/ + imagens/)
// npm run build:claude  -> publicar-claude/ (um único index.html com tudo dentro, para publicar no Claude)
export default defineConfig(({ mode }) => {
  const claude = mode === "claude";
  return {
    // "./" deixa o site funcionar em qualquer pasta (o GitHub Pages usa /tcc-sabao-original/)
    base: "./",
    plugins: [react()],
    build: {
      outDir: claude ? "publicar-claude" : "publicar",
      emptyOutDir: true,
      target: "es2019",
      cssCodeSplit: !claude,
      assetsInlineLimit: claude ? 100_000_000 : 4096,
      rollupOptions: {
        output: claude
          ? { inlineDynamicImports: true }
          : // React fica num arquivo separado: o navegador guarda em cache entre versões do site
            { manualChunks: { react: ["react", "react-dom"] } },
      },
    },
  };
});
