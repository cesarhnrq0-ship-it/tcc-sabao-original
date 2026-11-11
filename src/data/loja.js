import { CUSTOMIZATION, PRODUCTS } from "./catalogo";
import { formatBRL, numBR } from "../lib/util";
import { DEFAULT_APPEARANCE, normalizeAppearance } from "../lib/aparencia";

/* ----------------------------------------------------------------------------
 * LOJA EDITÁVEL
 * Valores padrão. O Painel Admin altera preços, estoque, cupons e regras,
 * e as alterações ficam salvas no navegador (localStorage).
 * -------------------------------------------------------------------------- */
export const DEFAULT_SETTINGS = {
  freeShipping: 150,   // frete grátis a partir de (R$)
  shippingFee: 15.9,   // valor do frete (R$)
  pixDiscount: 5,      // desconto no PIX (%)
  giftFee: 7.9,        // embalagem para presente (R$)
  lowStock: 5,         // alerta de estoque baixo (unidades)
  announcement: "",    // aviso do topo (vazio = texto automático)
  // Resumo SHA-256 da senha padrão "farmaura2026" (troque em Painel > Configurações)
  adminPasswordHash: "661fd63a512cff514ddc9d5edc5fb7fd01fc63dafa3ab26c5ac49f1a890a62d9",
  pixKey: "f7b4fedc-54ca-4672-a6b2-f5aab823fce4", // chave PIX que recebe os pagamentos
  pixName: "FARMAURA",                            // nome do recebedor (até 25 letras)
  pixCity: "SAO PAULO",                           // cidade do recebedor (até 15 letras)
  donationsEnabled: true,                         // mostra a seção de doação na loja
};

/** Estoque inicial de cada produto */
export const DEFAULT_STOCK = {
  "sabonete-cha-verde": 48, "wayfarer-kit": 35, "wayfarer-combo": 22, "aura-vital": 60,
  "acc-ecobag": 25, "acc-chaveiro": 4, "acc-adesivos": 120, "acc-bone-av": 18,
  "acc-toalha-av": 12, "acc-chaveiro-av": 30,
};

/** Cupons iniciais (type: "percent" = %, "fixed" = R$) */
export const DEFAULT_COUPONS = [
  { code: "BEMVINDO10", type: "percent", value: 10, minOrder: 0, label: "10% na primeira compra", active: true, uses: 0 },
  { code: "WAYFARER15", type: "percent", value: 15, minOrder: 0, label: "15% para aventureiros", active: true, uses: 0 },
  { code: "VERAO20", type: "fixed", value: 20, minOrder: 150, label: "R$ 20 de desconto no verão", active: true, uses: 0 },
];

export const DEFAULT_STORE = { settings: DEFAULT_SETTINGS, coupons: DEFAULT_COUPONS, products: {}, customization: {}, movimentos: [], appearance: DEFAULT_APPEARANCE };
/** Registra uma movimentação de estoque (guarda as 300 mais recentes) */
export const addMoves = (data, moves) => ({ ...data, movimentos: [...moves, ...(data.movimentos || [])].slice(0, 300) });
export const STORE_KEY = "farmaura_store_v1";
export const loadStore = () => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORE_KEY) || "null");
    if (!raw) return DEFAULT_STORE;
    return {
      settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
      coupons: Array.isArray(raw.coupons) ? raw.coupons : DEFAULT_COUPONS,
      products: raw.products || {},
      customization: raw.customization || {},
      movimentos: Array.isArray(raw.movimentos) ? raw.movimentos : [],
      appearance: normalizeAppearance(raw.appearance),
    };
  } catch {
    return DEFAULT_STORE;
  }
};
export const saveStore = (data) => {
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* sem armazenamento */ }
};

/** Junta os dados fixos dos produtos com o que foi alterado no painel */
export const buildStore = (data) => {
  const allProducts = PRODUCTS.map((p) => ({
    ...p,
    stock: DEFAULT_STOCK[p.id] ?? 30,
    active: true,
    ...(data.products[p.id] || {}),
  }));
  const customizationAll = {};
  Object.keys(CUSTOMIZATION).forEach((id) => {
    customizationAll[id] = { ...CUSTOMIZATION[id], enabled: true, ...(data.customization[id] || {}) };
  });
  const customization = {};
  Object.keys(customizationAll).forEach((id) => {
    if (customizationAll[id].enabled) customization[id] = customizationAll[id];
  });
  return {
    data,
    settings: data.settings,
    coupons: data.coupons,
    allProducts,
    products: allProducts.filter((p) => p.active),
    customization,
    customizationAll,
    appearance: normalizeAppearance(data.appearance),
  };
};
/** Garante o formato da loja vinda do banco */
export const normalizeStore = (raw) => ({
  settings: { ...DEFAULT_SETTINGS, ...((raw && raw.settings) || {}) },
  coupons: raw && Array.isArray(raw.coupons) ? raw.coupons : DEFAULT_COUPONS,
  products: (raw && raw.products) || {},
  customization: (raw && raw.customization) || {},
  movimentos: raw && Array.isArray(raw.movimentos) ? raw.movimentos : [],
  appearance: normalizeAppearance(raw && raw.appearance),
});
/** Cadastro e mensagens no modo local */
export const PROFILE_KEY = "farmaura_profile_v1";
export const MESSAGES_KEY = "farmaura_messages_v1";
export const loadJSON = (key, fallback) => {
  try {
    const v = JSON.parse(window.localStorage.getItem(key) || "null");
    return v ?? fallback;
  } catch {
    return fallback;
  }
};
export const saveJSON = (key, value) => {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* sem armazenamento */ }
};

/** Textos de cupom */
export const couponValueText = (c) => (c.type === "percent" ? `${numBR(c.value)}%` : formatBRL(c.value));
export const couponLabel = (c) =>
  (c.label || `${couponValueText(c)} de desconto`) + (c.minOrder ? ` · acima de ${formatBRL(c.minOrder)}` : "");
/** Aviso do topo gerado a partir das regras */
export const autoAnnouncement = (st) =>
  `Frete grátis acima de ${formatBRL(st.freeShipping)}${st.pixDiscount ? ` · ${numBR(st.pixDiscount)}% OFF no PIX` : ""}`;

/** Pedidos simulados (mock) para o painel não iniciar vazio */
export const MOCK_ORDERS = [
  {
    id: "FA-10421",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    customer: { name: "Mariana Albuquerque", email: "mariana.alb@email.com", phone: "(11) 98765-4321" },
    address: {
      street: "Rua Oscar Freire", number: "1120", district: "Jardins",
      city: "São Paulo", state: "SP", zip: "01426-001",
    },
    items: [
      { id: "sabonete-cha-verde", name: "Wayfarer Refil", variant: "Chá Verde · 100g", price: 59.9, qty: 2 },
      { id: "aura-vital", name: "Aura Vital", variant: "Protetor Solar FPS 67", price: 89.9, qty: 1 },
    ],
    subtotal: 209.7, shipping: 0, discount: 10.49, total: 199.21,
    payment: "PIX", status: "Entregue",
  },
  {
    id: "FA-10422",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    customer: { name: "Rafael Costa Lima", email: "rafael.lima@email.com", phone: "(21) 99654-1122" },
    address: {
      street: "Av. Atlântica", number: "2450", district: "Copacabana",
      city: "Rio de Janeiro", state: "RJ", zip: "22041-001",
    },
    items: [{ id: "aura-vital", name: "Aura Vital", variant: "Protetor Solar FPS 67", price: 89.9, qty: 1 }],
    subtotal: 89.9, shipping: 15.9, discount: 0, total: 105.8,
    payment: "Cartão de Crédito", status: "Pronto para entrega",
  },
  {
    id: "FA-10423",
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    customer: { name: "Juliana Ferreira", email: "ju.ferreira@email.com", phone: "(31) 98111-3344" },
    address: {
      street: "Rua da Bahia", number: "905", district: "Centro",
      city: "Belo Horizonte", state: "MG", zip: "30160-011",
    },
    items: [
      { id: "sabonete-cha-verde", name: "Wayfarer Refil", variant: "Chá Verde · 100g", price: 59.9, qty: 2 },
      { lineId: "acc-chaveiro::pedro::manuscrita::creme", id: "acc-chaveiro", name: "Chaveiro Wayfarer", variant: "Emborrachado · 7 cm", price: 27.8, qty: 1, custom: "Pedro", customStyle: { font: "manuscrita", color: "creme" } },
    ],
    subtotal: 147.6, shipping: 15.9, discount: 0, total: 171.4,
    gift: { message: "Feliz aniversário, Pedro! Que venham muitas trilhas. Com carinho, Ju." },
    payment: "Boleto", status: "Recebido",
  },
];
