// Roda depois do "vite build".
//   node scripts/pos-build.mjs          -> confere a pasta publicar/ e mostra os tamanhos
//   node scripts/pos-build.mjs claude   -> junta tudo de publicar-claude/ num único index.html
import { readFile, writeFile, readdir, stat, rm } from "node:fs/promises";
import path from "node:path";

const claude = process.argv[2] === "claude";
const dir = claude ? "publicar-claude" : "publicar";
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

const listar = async (d) => {
  const out = [];
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) out.push(...(await listar(p)));
    else out.push({ p, size: (await stat(p)).size });
  }
  return out;
};

if (!claude) {
  const files = await listar(dir);
  const total = files.reduce((a, f) => a + f.size, 0);
  const img = files.filter((f) => f.p.includes("imagens"));
  if (!img.length) throw new Error("A pasta publicar/imagens não foi criada. Rode: npm run imagens");
  console.log(`\nPronto! Pasta "${dir}" com ${files.length} arquivos (${kb(total)}).`);
  console.log(`Envie TODO o conteúdo de "${dir}" para o GitHub (index.html, assets/, imagens/, favicon.svg...).\n`);
} else {
  let html = await readFile(path.join(dir, "index.html"), "utf8");
  // CSS e JS para dentro do HTML
  for (const m of [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/g)]) {
    const css = await readFile(path.join(dir, m[1]), "utf8");
    html = html.replace(m[0], () => `<style>${css}</style>`);
  }
  html = html.replace(/<link rel="modulepreload"[^>]*>\s*/g, "");
  const sm = html.match(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/);
  if (!sm) throw new Error("Não achei o script principal no index.html");
  let js = await readFile(path.join(dir, sm[1]), "utf8");
  // Fotos viram data URI (o Claude publica um arquivo só)
  const fotos = {};
  for (const f of await readdir(path.join(dir, "imagens"))) {
    fotos[`imagens/${f}`] = `data:image/webp;base64,${(await readFile(path.join(dir, "imagens", f))).toString("base64")}`;
  }
  const trocaFotos = (txt) => txt.replace(/imagens\/[\w-]+\.webp/g, (k) => fotos[k] || k);
  js = trocaFotos(js).replace(/<\/script/gi, "<\/script");
  html = html.replace(sm[0], "");
  html = html.replace(/<link rel="preload" as="image"[^>]*>\s*/g, "");
  const favicon = (await readFile(path.join(dir, "favicon.svg"))).toString("base64");
  html = html.replace('href="favicon.svg"', `href="data:image/svg+xml;base64,${favicon}"`);
  html = html.replace("</body>", () => `<script type="module">${js}</script>\n</body>`);
  await writeFile(path.join(dir, "index.html"), html);
  // Remove o que já foi para dentro do HTML
  for (const e of await readdir(dir)) if (e !== "index.html") await rm(path.join(dir, e), { recursive: true, force: true });
  console.log(`\nPronto! "${dir}/index.html" com tudo dentro (${kb(Buffer.byteLength(html))}). Publique esse arquivo no Claude.\n`);
}
