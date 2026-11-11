import { PRODUCTS, fixOrder } from "../data/catalogo";
import { DEFAULT_SETTINGS, MOCK_ORDERS } from "../data/loja";
import { freteParaUF } from "./frete";

/* ============================================================================
 * 2. FUNÇÕES UTILITÁRIAS
 * ========================================================================== */

/** Formata número como moeda brasileira (R$) */
export const formatBRL = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Formata data ISO para dd/mm/aaaa hh:mm */
export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

/** Arredonda para 2 casas decimais (evita erros de ponto flutuante) */
export const round2 = (n) => Math.round(n * 100) / 100;
/** 5 -> "5", 7.5 -> "7,5" */
export const numBR = (n) => String(n).replace(".", ",");

/** Máscaras de input */
export const onlyDigits = (v) => v.replace(/\D/g, "");
export const maskPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
export const maskCEP = (v) => {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
export const maskCard = (v) => onlyDigits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
export const maskExpiry = (v) => {
  const d = onlyDigits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

/** Gera o próximo ID sequencial de pedido (ex.: FA-10424) */
export const nextOrderId = (orders) => {
  const max = orders.reduce((acc, o) => Math.max(acc, parseInt(o.id.split("-")[1], 10) || 0), 10420);
  return `FA-${max + 1}`;
};

/** Calcula os totais do carrinho com base nas regras comerciais */
export const calcTotals = (cart, payment, couponCode, gift, store, uf = "") => {
  const { settings } = store;
  const subtotal = round2(cart.reduce((acc, i) => acc + i.price * i.qty, 0));
  // Frete por região (Painel > Configurações); sem UF usa o valor único
  const frete = freteParaUF(uf, settings, subtotal);
  const shipping = subtotal === 0 ? 0 : frete.fee;
  const c = couponCode ? store.coupons.find((x) => x.code === couponCode) : null;
  let couponDiscount = 0;
  let couponIssue = null;
  if (couponCode) {
    if (!c || !c.active) couponIssue = "inactive";
    else if (subtotal < (c.minOrder || 0)) couponIssue = "min";
    else couponDiscount = round2(c.type === "percent" ? (subtotal * c.value) / 100 : Math.min(c.value, subtotal));
  }
  const pixDiscount = payment === "PIX" ? round2(((subtotal - couponDiscount) * settings.pixDiscount) / 100) : 0;
  const discount = round2(couponDiscount + pixDiscount);
  const giftFee = gift && subtotal > 0 ? settings.giftFee : 0;
  const total = round2(Math.max(0, subtotal + shipping + giftFee - discount));
  return {
    subtotal, shipping, giftFee, couponDiscount, pixDiscount, discount, total,
    coupon: couponDiscount ? couponCode : null, couponIssue, couponInfo: c, frete,
  };
};

/* ----------------------------------------------------------------------------
 * PIX "copia e cola" (BR Code / padrão EMV do Banco Central)
 * Monta o código com chave, valor e identificador do pedido + CRC16 no final.
 * -------------------------------------------------------------------------- */
export const emv = (id, value) => id + String(value.length).padStart(2, "0") + value;
export const crc16 = (str) => {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};
export const pixText = (s, max) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").toUpperCase().trim().slice(0, max);
export const buildPixPayload = ({ key, name, city, amount, txid }) => {
  const account = emv("00", "br.gov.bcb.pix") + emv("01", String(key).trim());
  let p = emv("00", "01") + emv("26", account) + emv("52", "0000") + emv("53", "986");
  if (amount > 0) p += emv("54", amount.toFixed(2));
  p += emv("58", "BR") + emv("59", pixText(name, 25) || "FARMAURA") + emv("60", pixText(city, 15) || "SAO PAULO");
  p += emv("62", emv("05", String(txid || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***"));
  p += "6304";
  return p + crc16(p);
};

/** Carrinho salvo no navegador */
export const CART_KEY = "farmaura_cart_v1";
export const loadCart = () => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((i) => PRODUCTS.some((p) => p.id === i.id)).map((i) => ({ ...i, lineId: i.lineId || i.id })) : [];
  } catch {
    return [];
  }
};
export const saveCart = (cart) => {
  try { window.localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* sem armazenamento */ }
};

/** Favoritos salvos no navegador */
export const FAVS_KEY = "farmaura_favs_v1";
export const loadFavs = () => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(FAVS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

/** Tema claro/escuro escolhido pelo visitante */
export const THEME_KEY = "farmaura_theme_v1";
export const systemPrefersDark = () => {
  const forced = document.documentElement.getAttribute("data-theme");
  if (forced) return forced === "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
};
export const loadTheme = () => {
  try {
    const t = window.localStorage.getItem(THEME_KEY);
    if (t === "dark" || t === "light") return t;
  } catch { /* ignora */ }
  return systemPrefersDark() ? "dark" : "light";
};

/** Doações registradas (ficam no navegador, como os pedidos) */
export const DONATIONS_KEY = "farmaura_donations_v1";
export const DONATION_STATUS = {
  Aguardando: { color: "bg-amber-100 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  Recebida: { color: "bg-emerald-100 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
};
export const loadDonations = () => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(DONATIONS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};
export const saveDonations = (list) => {
  try { window.localStorage.setItem(DONATIONS_KEY, JSON.stringify(list)); } catch { /* sem armazenamento */ }
};
export const nextDonationId = (list) => `DO-${list.reduce((m, d) => Math.max(m, parseInt(d.id.split("-")[1], 10) || 0), 1000) + 1}`;

/** Leitura/escrita segura no localStorage (pode não estar disponível no ambiente) */
export const STORAGE_KEY = "farmaura_orders_v1";
export const loadOrders = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return (Array.isArray(parsed) && parsed.length ? parsed : MOCK_ORDERS).map(fixOrder);
  } catch {
    return MOCK_ORDERS;
  }
};
export const saveOrders = (orders) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    /* ambiente sem localStorage: segue apenas em memória */
  }
};
export const normalize = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Copia um texto; se o navegador bloquear, seleciona o campo para o cliente copiar */
export const copyText = async (text, notify, fieldId) => {
  try {
    await navigator.clipboard.writeText(text);
    notify("Copiado! Agora cole no app do seu banco.");
  } catch {
    const el = fieldId && document.getElementById(fieldId);
    if (el) { el.focus(); el.select(); }
    notify("Selecionamos o código. Copie com Ctrl+C ou segurando o dedo.", "error");
  }
};

/** Seção de doação: valor livre, pago direto no PIX, sem carrinho e sem frete */
export const DONATION_PRESETS = [10, 20, 50, 100];

/** Cadastro do cliente e área "Minha conta" */
export const EMPTY_PROFILE = {
  name: "", email: "", phone: "", zip: "", street: "", number: "", district: "", city: "", state: "", newsletter: true,
};
export const validateProfile = (p) => {
  const e = {};
  if (p.name.trim().split(/\s+/).length < 2) e.name = "Digite nome e sobrenome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) e.email = "Digite um e-mail válido.";
  if (onlyDigits(p.phone).length < 10) e.phone = "Digite o telefone com DDD.";
  if (p.zip && onlyDigits(p.zip).length !== 8) e.zip = "O CEP tem 8 números.";
  return e;
};

/* ============================================================================
 * CHAT AO VIVO
 * Cada cliente tem uma conversa em chats/<pessoa>:
 *   { name, email, mensagens: [{ id, from: "cliente" | "equipe", text, at }],
 *     ultimaEm, lidoPeloClienteEm, lidoPelaEquipeEm }
 * O cliente conversa pelo balão no canto da loja; a equipe responde na aba
 * "Chat" do Painel Admin. As mensagens chegam na hora pelos dois lados.
 * ========================================================================== */
export const CHAT_QUICK_REPLIES = [
  "Olá! Em que posso ajudar?",
  "Seu pedido já está em separação e logo sai para entrega.",
  "Obrigado pelo contato! Qualquer dúvida, é só chamar.",
];
export const chatTime = (iso) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};
/** Mensagens do outro lado que ainda não foram lidas */
export const chatUnread = (chat, from) => {
  if (!chat || !Array.isArray(chat.mensagens)) return 0;
  const seen = from === "equipe" ? chat.lidoPeloClienteEm : chat.lidoPelaEquipeEm;
  return chat.mensagens.filter((m) => m.from === from && (!seen || m.at > seen)).length;
};

/* ============================================================================
 * EVOLUÇÃO: página do produto, QR Code, avaliações, quiz, sustentabilidade,
 * assistente de atendimento e ferramentas novas do painel.
 * ========================================================================== */

/** Endereço público do site (os QR Codes sempre apontam para o site publicado) */
export const PUBLIC_SITE_URL = "https://cesarhnrq0-ship-it.github.io/tcc-sabao-original/";
export const productUrl = (id) => {
  const here = window.location.hostname.endsWith("github.io") ? window.location.origin + window.location.pathname : PUBLIC_SITE_URL;
  return `${here}#produto-${id}`;
};
/** Média, total e distribuição por produto, só com avaliações aprovadas */
export const reviewStats = (approved) => {
  const out = {};
  approved.forEach((r) => {
    const s = out[r.productId] || (out[r.productId] = { sum: 0, count: 0, dist: [0, 0, 0, 0, 0] });
    s.sum += r.stars;
    s.count += 1;
    s.dist[r.stars - 1] += 1;
  });
  Object.values(out).forEach((s) => { s.avg = s.sum / s.count; });
  return out;
};
export const fmtAvg = (n) => n.toFixed(1).replace(".", ",");

/* ---------------------------------------------------------------------------
 * QR CODE
 * ------------------------------------------------------------------------- */
export const qrMatrix = (text) => {
  if (typeof window.qrcode !== "function") return null;
  try {
    const q = window.qrcode(0, "M");
    q.addData(text);
    q.make();
    const n = q.getModuleCount();
    const cells = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) cells.push([c, r]);
    return { n, cells };
  } catch {
    return null;
  }
};

/** Gera um PNG do QR Code e baixa (funciona no site publicado) */
export const downloadQR = (text, filename, notify) => {
  const qr = qrMatrix(text);
  if (!qr) return notify("Não foi possível gerar o QR Code agora.", "error");
  const scale = 12, pad = 4, size = (qr.n + pad * 2) * scale;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#000";
  qr.cells.forEach(([c, r]) => ctx.fillRect((c + pad) * scale, (r + pad) * scale, scale, scale));
  // Dentro do Claude o download passa pelo próprio app; no GitHub Pages é um link normal
  if (window.claude && window.claude.use) {
    cv.toBlob(async (blob) => {
      try {
        const dl = await window.claude.use("downloads");
        if (!dl) return notify("Download indisponível aqui. Abra o site publicado para baixar.", "error");
        await dl.save({ filename, data: blob });
        notify("QR Code baixado");
      } catch (e) {
        if (e && e.code !== "declined") notify("Não foi possível baixar o QR Code.", "error");
      }
    }, "image/png");
    return;
  }
  const a = document.createElement("a");
  a.href = cv.toDataURL("image/png");
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  notify("QR Code baixado");
};

/* ---------------------------------------------------------------------------
 * ASSISTENTE DE ATENDIMENTO (respostas cadastradas)
 * ------------------------------------------------------------------------- */
export const buildAssistant = (st, coupons) => {
  const welcome = coupons.find((c) => c.active && c.code === "BEMVINDO10");
  return [
    { id: "frete", q: "Prazo e frete", keys: ["frete", "prazo", "entrega", "chega", "demora", "envio"],
      a: `O frete é grátis acima de ${formatBRL(st.freeShipping)}. Abaixo disso custa ${formatBRL(st.shippingFee)}. O prazo é de 3 a 8 dias úteis depois da confirmação do pagamento.` },
    { id: "status", q: "Onde está meu pedido?", keys: ["pedido", "status", "rastre", "acompanh", "onde est"],
      a: "Você acompanha o pedido em “Minha conta” ou em “Rastrear”, com o número e o e-mail da compra. As etapas são: Recebido, Em preparação, Pronto para entrega e Entregue." },
    { id: "pagamento", q: "Formas de pagamento", keys: ["pagar", "pagamento", "pix", "cartão", "cartao", "boleto", "parcel"],
      a: `Aceitamos PIX${st.pixDiscount ? ` (com ${numBR(st.pixDiscount)}% de desconto)` : ""}, cartão de crédito em até 3x sem juros e boleto. No PIX, o QR Code aparece logo depois de confirmar o pedido.` },
    { id: "uso", q: "Como usar o sabonete em pó", keys: ["usar", "uso", "como usa", "pó", "po ", "espuma", "sabonete"],
      a: "Com as mãos molhadas, coloque cerca de meia colher de chá do pó e esfregue até virar espuma. Aplique no corpo e enxágue. Mantenha a embalagem fechada e seca." },
    { id: "diferenca", q: "Refil, Kit ou Combo?", keys: ["refil", "kit", "combo", "diferen", "qual escolher"],
      a: "O Refil tem 100 g para usar em casa. O Kit Viagem tem 5 sachês de 10 g para levar. O Combo junta os dois com preço menor do que separado. Se ainda tiver dúvida, faça o quiz na página." },
    { id: "protetor", q: "Protetor no rosto?", keys: ["protetor", "aura", "rosto", "fps", "solar"],
      a: "Sim, o Aura Vital FPS 67 é facial e corporal, com toque seco. Reaplique a cada 2 horas e depois de entrar na água." },
    { id: "troca", q: "Trocas e devoluções", keys: ["troca", "devol", "arrepend", "defeito"],
      a: "Você pode trocar ou devolver em até 7 dias depois do recebimento, com o produto lacrado. Itens personalizados não podem ser trocados." },
    { id: "cupom", q: "Tem cupom?", keys: ["cupom", "desconto", "promo"],
      a: welcome ? `Na primeira compra, use o cupom ${welcome.code} no carrinho.` : "Os cupons ativos são divulgados na newsletter. Inscreva-se no rodapé da página." },
  ];
};
export const assistantAnswer = (text, kb) => {
  const t = normalize(text);
  let best = null, bestHits = 0;
  kb.forEach((k) => {
    const hits = k.keys.filter((key) => t.includes(normalize(key))).length;
    if (hits > bestHits) { best = k; bestHits = hits; }
  });
  return best;
};

/* ---------------------------------------------------------------------------
 * PAINEL: avaliações, estoque, mais vendidos, QR Codes
 * ------------------------------------------------------------------------- */
export const REVIEW_STATUS = {
  pendente: { label: "Aguardando", color: "bg-amber-100 text-amber-800 ring-amber-200" },
  aprovada: { label: "Publicada", color: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  rejeitada: { label: "Rejeitada", color: "bg-stone-100 text-stone-600 ring-stone-200" },
};

export const buildFaq = (st) => [
  {
    q: "Quais são as etapas do meu pedido?",
    a: "Recebido (aguardando a confirmação do pagamento), Em preparação (separando e embalando), Pronto para entrega e Entregue. Você acompanha cada etapa em “Minha conta” ou em “Rastrear”.",
  },
  {
    q: "Como pago com PIX?",
    a: `Escolha PIX no checkout e confirme o pedido. Aparecem o QR Code e o código copia e cola com o valor exato${st.pixDiscount ? `, já com ${numBR(st.pixDiscount)}% de desconto` : ""}.`,
  },
  {
    q: "Como avalio um produto?",
    a: "Abra a página do produto e use o formulário de avaliações: escolha de 1 a 5 estrelas e escreva um comentário. Cada pessoa avalia um produto uma vez, e a avaliação aparece depois de aprovada pela equipe.",
  },
  {
    q: "Não sei qual produto escolher. Podem me ajudar?",
    a: "Sim! Faça o quiz de 3 perguntas na página ou chame o assistente no balão de chat, no canto da tela.",
  },
  {
    q: "Como uso o sabonete em pó?",
    a: "Com as mãos molhadas, coloque cerca de meia colher de chá do pó e esfregue até virar espuma. Depois é só aplicar no corpo e enxaguar. Mantenha a embalagem fechada e longe da água.",
  },
  {
    q: "Qual a diferença entre o Refil, o Kit Viagem e o Combo?",
    a: "O Refil tem 100g para usar em casa. O Kit Viagem tem 5 sachês de 10g, um por banho, para levar na mochila. O Combo junta os dois com preço menor do que comprando separado.",
  },
  {
    q: "Posso usar o Aura Vital no rosto?",
    a: "Sim. O Aura Vital FPS 67 é facial e corporal, tem toque seco e não é comedogênico. Reaplique a cada 2 horas e depois de entrar na água.",
  },
  {
    q: "Como funciona a personalização com nome?",
    a: "Eco Bag, Chaveiro Wayfarer, Boné e Toalha Aura Vital aceitam um nome. Abra o produto, digite o nome e escolha o estilo da letra e a cor da linha. A prévia mostra como vai ficar. Itens personalizados levam 2 dias úteis a mais para envio e não podem ser trocados.",
  },
  {
    q: "Qual o prazo e o valor do frete?",
    a: `O frete é grátis acima de ${formatBRL(st.freeShipping)}. Abaixo disso custa ${formatBRL(st.shippingFee)} para todo o Brasil. O prazo é de 3 a 8 dias úteis depois da confirmação do pagamento.`,
  },
  {
    q: "Posso trocar ou devolver um produto?",
    a: "Sim, em até 7 dias depois do recebimento, com o produto lacrado. Fale com a gente pelo formulário de contato informando o número do pedido.",
  },
];

/* ----------------------------------------------------------------------------
 * CARRINHO LATERAL (DRAWER) + CHECKOUT
 *  Etapas: "cart" → "checkout" → "success"
 * -------------------------------------------------------------------------- */

export const EMPTY_FORM = {
  name: "", email: "", phone: "",
  street: "", number: "", district: "", city: "", state: "", zip: "",
  payment: "PIX",
  cardNumber: "", cardName: "", cardExpiry: "", cardCvv: "",
  gift: false, giftMessage: "",
};

/** Validação do formulário de checkout. Retorna objeto { campo: mensagem } */
export const validateCheckout = (f) => {
  const e = {};
  if (f.name.trim().split(/\s+/).length < 2) e.name = "Informe nome e sobrenome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "E-mail inválido.";
  if (onlyDigits(f.phone).length < 10) e.phone = "Telefone inválido.";
  if (!f.street.trim()) e.street = "Obrigatório.";
  if (!f.number.trim()) e.number = "Obrigatório.";
  if (!f.district.trim()) e.district = "Obrigatório.";
  if (!f.city.trim()) e.city = "Obrigatório.";
  if (!f.state) e.state = "Selecione.";
  if (onlyDigits(f.zip).length !== 8) e.zip = "CEP inválido.";
  if (f.payment === "Cartão de Crédito") {
    if (onlyDigits(f.cardNumber).length !== 16) e.cardNumber = "Número inválido.";
    if (!f.cardName.trim()) e.cardName = "Obrigatório.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(f.cardExpiry)) e.cardExpiry = "MM/AA";
    if (onlyDigits(f.cardCvv).length < 3) e.cardCvv = "CVV inválido.";
  }
  return e;
};

/** Sessão do Painel Admin (dura até fechar a aba) */
export const ADMIN_SESSION_KEY = "farmaura_admin_session";
export const loadAdminSession = () => {
  try { return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok"; } catch { return false; }
};
export const PAYMENT_GROUP = (p) => (p.startsWith("Cartão") ? "Cartão de Crédito" : p);
export const orderGiftFee = (o) => (o.gift ? (o.giftFee ?? DEFAULT_SETTINGS.giftFee) : 0);

/** Converte "12,90" ou "12.90" em número (NaN se inválido) */
export const parseNum = (v) => {
  const n = parseFloat(String(v).trim().replace(/\./g, (m, i, s) => (s.includes(",") ? "" : m)).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};
export const numText = (n) => (n === null || n === undefined || n === "" ? "" : String(n).replace(".", ","));

/** Aba de cupons: criar, editar, ativar/desativar e excluir */
export const EMPTY_COUPON = { code: "", type: "percent", value: "", minOrder: "", label: "", active: true };

/** Gera o CSV dos pedidos (separado por ponto e vírgula, como o Excel em português espera) */
export const ordersToCSV = (orders) => {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Pedido", "Data", "Cliente", "E-mail", "Telefone", "Cidade", "Itens", "Pagamento", "Cupom", "Presente", "Total", "Status"];
  const rows = orders.map((o) => [
    o.id,
    formatDateTime(o.createdAt),
    o.customer.name,
    o.customer.email,
    o.customer.phone,
    `${o.address.city}/${o.address.state}`,
    o.items.map((i) => `${i.qty}x ${i.name}${i.custom ? ` (${i.custom})` : ""}`).join(" | "),
    o.payment,
    o.coupon || "",
    o.gift ? (o.gift.message || "sim") : "",
    String(o.total.toFixed(2)).replace(".", ","),
    o.status,
  ]);
  return [head, ...rows].map((r) => r.map(esc).join(";")).join("\n");
};
