/* ============================================================================
 * RECURSOS DA LOJA: vistos recentemente, comparador e lista de favoritos
 * compartilhável. Ficam no navegador do visitante (localStorage).
 * ========================================================================== */
import { useSyncExternalStore } from "react";

/** Mini "store" com assinatura, para vários componentes lerem o mesmo valor */
const criarStore = (key, inicial, max) => {
  let valor = inicial;
  try { const v = JSON.parse(localStorage.getItem(key) || "null"); if (Array.isArray(v)) valor = v.filter((x) => typeof x === "string").slice(0, max); } catch { /* sem armazenamento */ }
  const ouvintes = new Set();
  const set = (next) => {
    valor = next.slice(0, max);
    try { localStorage.setItem(key, JSON.stringify(valor)); } catch { /* ignora */ }
    ouvintes.forEach((f) => f());
  };
  return {
    get: () => valor,
    set,
    subscribe: (f) => { ouvintes.add(f); return () => ouvintes.delete(f); },
  };
};

/* ---------- Vistos recentemente ---------- */
const vistos = criarStore("farmaura_vistos_v1", [], 8);
export const registrarVisto = (id) => { if (id) vistos.set([id, ...vistos.get().filter((x) => x !== id)]); };
export const useVistos = () => useSyncExternalStore(vistos.subscribe, vistos.get);

/* ---------- Comparador (até 3 produtos) ---------- */
export const MAX_COMPARAR = 3;
const comparar = criarStore("farmaura_comparar_v1", [], MAX_COMPARAR);
export const useComparar = () => useSyncExternalStore(comparar.subscribe, comparar.get);
/** Liga/desliga um produto no comparador. Devolve false quando já tem 3. */
export const alternarComparar = (id) => {
  const cur = comparar.get();
  if (cur.includes(id)) { comparar.set(cur.filter((x) => x !== id)); return true; }
  if (cur.length >= MAX_COMPARAR) return false;
  comparar.set([...cur, id]);
  return true;
};
export const limparComparar = () => comparar.set([]);

/* ---------- Favoritos compartilháveis ---------- */
/** Link do tipo .../#favoritos=id1,id2 */
export const linkFavoritos = (ids) => `${window.location.origin}${window.location.pathname}#favoritos=${ids.map(encodeURIComponent).join(",")}`;
/** Lê a lista do endereço (só ids que existem no catálogo) */
export const lerFavoritosDoLink = (validIds) => {
  const m = window.location.hash.match(/^#favoritos=([^&]*)$/);
  if (!m) return null;
  const ids = [...new Set(decodeURIComponent(m[1]).split(",").map((s) => s.trim()))].filter((id) => validIds.includes(id));
  return ids.length ? ids : null;
};

/** Compartilha pelo menu do celular; no computador copia o link */
export const compartilhar = async ({ title, text, url }, notify) => {
  try {
    if (navigator.share) { await navigator.share({ title, text, url }); return; }
  } catch (e) {
    if (e && e.name === "AbortError") return; // a pessoa fechou o menu
  }
  try {
    await navigator.clipboard.writeText(url);
    notify && notify("Link copiado! É só colar para enviar.");
  } catch {
    window.prompt("Copie o link:", url);
  }
};
