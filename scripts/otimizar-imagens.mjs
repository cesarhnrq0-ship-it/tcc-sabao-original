// Converte as fotos de imagens/*.jpg (originais) para WebP leve em public/imagens/.
// Rode depois de trocar ou adicionar uma foto:  npm run imagens
import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const ORIGEM = "imagens";
const DESTINO = "public/imagens";
await mkdir(DESTINO, { recursive: true });

let antes = 0, depois = 0;
for (const nome of await readdir(ORIGEM)) {
  if (!/\.(jpe?g|png)$/i.test(nome)) continue;
  const base = nome.replace(/\.\w+$/, "");
  const entrada = path.join(ORIGEM, nome);
  const saida = path.join(DESTINO, `${base}.webp`);
  await sharp(entrada).resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toFile(saida);
  antes += (await stat(entrada)).size;
  depois += (await stat(saida)).size;
}
// Imagem de compartilhamento (WhatsApp, Instagram, Facebook usam JPG 1200x630)
await sharp(path.join(ORIGEM, "refil.jpg")).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 80 }).toFile("public/compartilhar.jpg");
console.log(`Fotos: ${(antes / 1024).toFixed(0)} KB -> ${(depois / 1024).toFixed(0)} KB em WebP`);
