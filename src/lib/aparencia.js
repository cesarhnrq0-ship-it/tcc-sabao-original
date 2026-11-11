/* ============================================================================
 * APARÊNCIA EDITÁVEL (Painel Admin > Aparência)
 * Tudo o que a equipe pode mudar no visual sem mexer no código: cores, fontes,
 * cantos, textos do topo, seções da página inicial e dados de contato.
 * Fica salvo junto com a loja (localStorage ou Firebase "loja/config").
 * ========================================================================== */

/** Seções da página inicial, na ordem padrão */
export const SECOES = [
  { id: "hero", label: "Banner principal (topo)" },
  { id: "beneficios", label: "Faixa de benefícios" },
  { id: "linhas", label: "Compre por linha" },
  { id: "produtos", label: "Catálogo de produtos" },
  { id: "vistos", label: "Vistos recentemente" },
  { id: "quiz", label: "Quiz de recomendação" },
  { id: "doacao", label: "Doação" },
  { id: "sobre", label: "Sobre a marca" },
  { id: "sustentabilidade", label: "Sustentabilidade" },
  { id: "rastrear", label: "Rastrear pedido" },
  { id: "duvidas", label: "Dúvidas frequentes" },
  { id: "contato", label: "Contato" },
];

/** Fontes disponíveis (todas do Google Fonts) */
export const FONTES_TITULO = ["Fraunces", "Playfair Display", "DM Serif Display", "Cormorant Garamond", "Libre Baskerville", "Space Grotesk", "Poppins", "Montserrat", "Bricolage Grotesque"];
export const FONTES_TEXTO = ["DM Sans", "Inter", "Poppins", "Nunito", "Lato", "Manrope", "Work Sans", "Source Sans 3"];

/** Temas prontos: um clique troca as quatro cores da marca */
export const TEMAS_PRONTOS = [
  { id: "floresta", nome: "Floresta (original)", principal: "#059669", destaque: "#c8f169", banner: "#0b2a1f", fundo: "#faf8f3" },
  { id: "oceano", nome: "Oceano", principal: "#0284c7", destaque: "#fcd34d", banner: "#0b2638", fundo: "#f6f9fb" },
  { id: "terracota", nome: "Terracota", principal: "#c2410c", destaque: "#fde68a", banner: "#3a1a0d", fundo: "#fbf6f1" },
  { id: "lavanda", nome: "Lavanda", principal: "#7c3aed", destaque: "#f0abfc", banner: "#1d1235", fundo: "#faf8fd" },
  { id: "rose", nome: "Rosé", principal: "#db2777", destaque: "#fbcfe8", banner: "#3b0d24", fundo: "#fdf7f9" },
  { id: "grafite", nome: "Grafite", principal: "#3f3f46", destaque: "#a3e635", banner: "#111113", fundo: "#f7f7f6" },
];

export const DEFAULT_APPEARANCE = {
  cores: { principal: "#059669", destaque: "#c8f169", banner: "#0b2a1f", fundo: "#faf8f3" },
  fontes: { titulo: "Fraunces", texto: "DM Sans" },
  cantos: "arredondado",   // arredondado | medio | reto
  formatoFoto: "quadrado", // quadrado | retrato | paisagem
  animacoes: true,
  // Letreiros: ligar/desligar cada faixa e escolher se passam (movimento) ou ficam parados
  letreiros: { avisos: true, banner: true, movimento: true },
  temaPadrao: "sistema",   // sistema | claro | escuro (quando o visitante ainda não escolheu)
  avisos: [
    "",                    // vazio = texto automático (frete grátis e desconto no PIX)
    "100% vegano · cruelty free",
    "Cupom BEMVINDO10 na primeira compra",
    "Refil com 80% menos plástico",
    "Compra 100% segura",
  ],
  hero: {
    selo: "auto",          // "auto" mostra o lançamento; vazio esconde; outro texto vira o selo
    titulo: "A ciência da pele encontra a",
    destaque: "natureza",
    subtitulo: "Sabonete em pó Wayfarer que não vaza na mochila, protetor Aura Vital FPS 67 com toque seco e acessórios para levar o ritual para qualquer lugar. Vegano, concentrado e com menos plástico.",
    botao: "Comprar agora",
    letreiro: "Vegano · Concentrado · Menos plástico · Não vaza na mala · Toque seco FPS 67", // frases separadas por ·  (vazio esconde)
    produtoId: "",         // vazio = mais vendido em estoque
    mostrarDesconto: true,
    mostrarNumeros: true,
  },
  beneficios: ["Fórmulas veganas", "Eco-embalagens", "Ciência dermatológica", "Cruelty free", "Não vaza na mala", "FPS 67 toque seco"],
  sobre: {
    titulo: "Cuidar da pele é também",
    destaque: "cuidar do mundo",
    texto: "A Farmaura nasceu da união entre farmacêuticos e designers que acreditam que a beleza do futuro é consciente. Desenvolvemos dermocosméticos com ativos de eficácia comprovada, fórmulas concentradas e embalagens que reduzem drasticamente o impacto ambiental.",
  },
  newsletter: { titulo: "Ganhe", destaque: "10% OFF", fim: "na primeira compra", texto: "Receba lançamentos, dicas de cuidado e o cupom direto no seu e-mail." },
  contato: {
    email: "farmaurainc@gmail.com",
    telefone: "(11) 96160-4656",
    whatsapp: "5511961604656",
    endereco: "Rua Tambaú, 10 · São Paulo, SP",
    instagram: "",
  },
  secoes: SECOES.map((s) => ({ id: s.id, on: true })),
};

const isHex = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
const str = (v, d) => (typeof v === "string" ? v.slice(0, 600) : d);

/** Junta o que foi salvo com o padrão, descartando valores inválidos */
export const normalizeAppearance = (raw) => {
  const r = raw && typeof raw === "object" ? raw : {};
  const D = DEFAULT_APPEARANCE;
  const cores = Object.fromEntries(Object.keys(D.cores).map((k) => [k, isHex(r.cores?.[k]) ? r.cores[k] : D.cores[k]]));
  const known = new Set(SECOES.map((s) => s.id));
  const saved = Array.isArray(r.secoes) ? r.secoes.filter((s) => s && known.has(s.id)).map((s) => ({ id: s.id, on: s.on !== false })) : [];
  // seções novas (de versões futuras) entram no fim, ligadas
  const secoes = [...saved, ...D.secoes.filter((s) => !saved.some((x) => x.id === s.id))];
  const obj = (key) => Object.fromEntries(Object.keys(D[key]).map((k) => [k, typeof D[key][k] === "boolean" ? (typeof r[key]?.[k] === "boolean" ? r[key][k] : D[key][k]) : str(r[key]?.[k], D[key][k])]));
  const list = (key, max) => (Array.isArray(r[key]) ? r[key].map((x) => str(x, "")).slice(0, max) : D[key]);
  return {
    cores,
    fontes: {
      titulo: FONTES_TITULO.includes(r.fontes?.titulo) ? r.fontes.titulo : D.fontes.titulo,
      texto: FONTES_TEXTO.includes(r.fontes?.texto) ? r.fontes.texto : D.fontes.texto,
    },
    cantos: ["arredondado", "medio", "reto"].includes(r.cantos) ? r.cantos : D.cantos,
    formatoFoto: ["quadrado", "retrato", "paisagem"].includes(r.formatoFoto) ? r.formatoFoto : D.formatoFoto,
    animacoes: typeof r.animacoes === "boolean" ? r.animacoes : D.animacoes,
    temaPadrao: ["sistema", "claro", "escuro"].includes(r.temaPadrao) ? r.temaPadrao : D.temaPadrao,
    avisos: list("avisos", 8),
    hero: obj("hero"),
    letreiros: obj("letreiros"),
    beneficios: list("beneficios", 10),
    sobre: obj("sobre"),
    newsletter: obj("newsletter"),
    contato: obj("contato"),
    secoes,
  };
};

/** Classe de proporção da foto dos cards */
export const FOTO_CLASSE = { quadrado: "aspect-square", retrato: "aspect-[4/5]", paisagem: "aspect-[4/3]" };

/** Link seguro: só http(s); evita "javascript:" vindo do painel */
export const safeUrl = (u) => {
  const s = String(u || "").trim();
  if (!s) return "";
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s.replace(/^@/, "instagram.com/")}`;
  try { const url = new URL(withProto); return url.protocol === "https:" || url.protocol === "http:" ? url.href : ""; } catch { return ""; }
};
export const whatsappUrl = (numero, texto = "") => {
  const n = String(numero || "").replace(/\D/g, "");
  return n.length >= 10 ? `https://wa.me/${n}${texto ? `?text=${encodeURIComponent(texto)}` : ""}` : "";
};

/* ---------- Cores: gera a escala 50…950 a partir de uma cor ---------- */
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (rgb, alvo, t) => rgb.map((c, i) => Math.round(c + (alvo[i] - c) * t));
const W = [255, 255, 255], K = [0, 0, 0];
const txt = (rgb) => rgb.join(" ");
/** Escala clara: a cor escolhida vira o tom 600 */
const escalaClara = (hex) => {
  const b = hexToRgb(hex);
  return { 50: mix(b, W, 0.93), 100: mix(b, W, 0.85), 200: mix(b, W, 0.7), 300: mix(b, W, 0.5), 400: mix(b, W, 0.3), 500: mix(b, W, 0.12), 600: b,
    700: mix(b, K, 0.2), 800: mix(b, K, 0.37), 900: mix(b, K, 0.5), 950: mix(b, K, 0.72) };
};
/** Escala escura: fundos profundos e textos claros (mesma lógica do tema escuro original) */
const escalaEscura = (hex) => {
  const c = escalaClara(hex);
  const fundo = [17, 20, 18];
  return { 50: mix(c[600], fundo, 0.84), 100: mix(c[600], fundo, 0.77), 200: mix(c[600], fundo, 0.62), 300: c[300], 400: c[400], 500: c[500], 600: c[500],
    700: c[400], 800: c[300], 900: c[800], 950: c[950] };
};
const luminancia = (rgb) => {
  const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** Texto que aparece por cima da cor de destaque: escuro ou branco, o que tiver mais contraste */
const textoSobre = (hex, escuroHex) => (luminancia(hexToRgb(hex)) > 0.4 ? hexToRgb(escuroHex) : W);

const vars = (nome, escala) => Object.entries(escala).map(([k, v]) => `--${nome}-${k}:${txt(v)}`).join(";");

/** Monta o CSS que sobrescreve as cores padrão (só o que mudou) */
export const appearanceCss = (ap) => {
  const D = DEFAULT_APPEARANCE.cores;
  const c = ap.cores;
  const marca = `--destaque:${txt(hexToRgb(c.destaque))};--destaque-fg:${txt(textoSobre(c.destaque, c.banner))};--banner:${txt(hexToRgb(c.banner))};--font-titulo:"${ap.fontes.titulo}";--font-texto:"${ap.fontes.texto}"`;
  let css = `:root{${marca}}`;
  if (c.principal.toLowerCase() !== D.principal) {
    const claro = vars("emerald", escalaClara(c.principal));
    const escuro = vars("emerald", escalaEscura(c.principal));
    css += `:root{${claro}}`;
    css += `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]):not(.theme-light){${escuro}}}`;
    css += `:root[data-theme="dark"]:not(.theme-light),:root.theme-dark{${escuro}}`;
    css += `.palette-light{${claro}}`;
  }
  if (c.fundo.toLowerCase() !== D.fundo) {
    const f = txt(hexToRgb(c.fundo));
    css += `:root{--page:${f}}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]):not(.theme-light){--page:17 20 18}}:root.theme-dark{--page:17 20 18}.palette-light{--page:${f}}`;
  }
  return css;
};

/** Aplica no documento: CSS das cores, classes de cantos/animação e fontes */
export const applyAppearance = (ap) => {
  if (typeof document === "undefined") return;
  let el = document.getElementById("aparencia-css");
  if (!el) { el = document.createElement("style"); el.id = "aparencia-css"; document.head.appendChild(el); }
  el.textContent = appearanceCss(ap);
  const root = document.documentElement;
  root.classList.remove("cantos-medio", "cantos-reto");
  if (ap.cantos !== "arredondado") root.classList.add(`cantos-${ap.cantos}`);
  root.classList.toggle("sem-animacao", !ap.animacoes);
  // Letreiros parados: sem movimento, mostrando os textos fixos e centralizados
  root.classList.toggle("letreiros-parados", !ap.letreiros.movimento || !ap.animacoes);
  // Fontes: só baixa do Google Fonts quando não são as padrão (já carregadas no index.html)
  const extra = [...new Set([ap.fontes.titulo, ap.fontes.texto].filter((f) => !["Fraunces", "DM Sans"].includes(f)))];
  document.querySelectorAll("link[data-fonte-extra]").forEach((l) => { if (!extra.includes(l.dataset.fonteExtra)) l.remove(); });
  extra.forEach((f) => {
    if (document.querySelector(`link[data-fonte-extra="${f}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.dataset.fonteExtra = f;
    link.href = `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, "+")}:${EIXOS_FONTE[f] || "wght@400;700"}&display=swap`;
    document.head.appendChild(link);
  });
};

/** Pesos/itálicos que cada fonte realmente tem (pedir um que não existe faz o Google Fonts recusar) */
const IW = "ital,wght@0,400;0,500;0,600;0,700;1,400";
const EIXOS_FONTE = {
  "Playfair Display": IW, "Cormorant Garamond": IW, Poppins: IW, Montserrat: IW, "Work Sans": IW,
  "DM Serif Display": "ital@0;1", "Libre Baskerville": "ital,wght@0,400;0,700;1,400",
  "Space Grotesk": "wght@400;500;600;700", "Bricolage Grotesque": "wght@400;500;600;700",
  Inter: "wght@400;500;600;700", Manrope: "wght@400;500;600;700",
  Nunito: "ital,wght@0,400;0,600;0,700;1,400", Lato: "ital,wght@0,400;0,700;1,400", "Source Sans 3": "ital,wght@0,400;0,600;0,700;1,400",
};
