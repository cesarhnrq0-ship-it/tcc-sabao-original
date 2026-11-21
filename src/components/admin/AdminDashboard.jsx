import React, { useMemo, useState } from "react";
import { AparenciaPanel } from "./AparenciaPanel";
import { TelaApresentacao, tocarAviso, useNovosPedidos } from "./Apresentacao";
import { ChatAdminPanel, CouponsPanel, DonationsPanel, MessagesPanel, OrderDetail, ProductEditor, QrSheetModal, RevenueChart, ReviewsAdminPanel, SettingsPanel, StockMovements } from "./Paineis";
import { ConfirmInline, KpiCard, SafeImage, StatusBadge, StatusSelect, StockBadge, Switch } from "../ui";
import { CATEGORY_LABELS, ORDER_STATUS, PAYMENT_METHODS } from "../../data/catalogo";
import { useCloud, useStore } from "../../lib/contextos";
import { Leaf, Play, Sparkles, AlertTriangle, BarChart, ChevronRight, Clock, Copy, Database, DollarSign, Gift, Heart, Inbox, LogOut, Mail, MessageCircle, Minus, Package, PenLine, Plus, QrCode, Search, Settings, ShoppingBag, Star, StickyNote, Store, Tag, Trash2, User, Users } from "../../lib/icones";
import { PAYMENT_GROUP, chatUnread, formatBRL, formatDateTime, normalize, ordersToCSV } from "../../lib/util";

/** "agora", "há 5 min", "há 3 h", "há 2 dias" ou a data */
const quando = (iso) => {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(min)) return "—";
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  if (min < 24 * 60) return `há ${Math.floor(min / 60)} h`;
  if (min < 7 * 24 * 60) { const d = Math.floor(min / 1440); return `há ${d} ${d === 1 ? "dia" : "dias"}`; }
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

/** Cartão de número com a variação contra o período anterior */
function KpiVidro({ icon: Icon, cor, label, value, atual, anterior, period }) {
  const pct = anterior > 0 ? ((atual - anterior) / anterior) * 100 : null;
  const sobe = pct !== null && pct >= 0;
  return (
    <div className="rounded-[1.5rem] bg-surface vidro-borda p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-stone-600">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${cor}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-stone-950 sm:text-[1.75rem]">{value}</p>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
        {pct === null ? (
          <span className="rounded-full bg-white/5 px-2 py-0.5 font-semibold text-stone-600 vidro-borda">{atual > 0 ? "novo" : "—"}</span>
        ) : (
          <span className={`rounded-full px-2 py-0.5 font-semibold tabular-nums ${sobe ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {sobe ? "↑" : "↓"} {Math.abs(pct).toFixed(pct !== 0 && Math.abs(pct) < 10 ? 1 : 0).replace(".", ",")}%
          </span>
        )}
        vs. {period} dias anteriores
      </p>
    </div>
  );
}

/** Gráfico de linha com área (SVG próprio, sem biblioteca) */
function GraficoLinha({ pontos, rotulos, formatar }) {
  const id = React.useId().replace(/:/g, "");
  const [ativo, setAtivo] = useState(null);
  const W = 600, H = 200, T = 14, B = 10;
  const max = Math.max(1, ...pontos);
  const x = (i) => (pontos.length > 1 ? (i / (pontos.length - 1)) * W : W / 2);
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const xy = pontos.map((v, i) => [x(i), y(v)]);
  // Curva suave (Catmull-Rom convertida em Bézier)
  const linha = xy.reduce((d, [px, py], i) => {
    if (i === 0) return `M${px},${py}`;
    const [x0, y0] = xy[i - 2] || xy[i - 1];
    const [x1, y1] = xy[i - 1];
    const [x3, y3] = xy[i + 1] || [px, py];
    const c1 = [x1 + (px - x0) / 6, y1 + (py - y0) / 6];
    const c2 = [px - (x3 - x1) / 6, py - (y3 - y1) / 6];
    return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${px},${py}`;
  }, "");
  const area = xy.length ? `${linha} L${xy[xy.length - 1][0]},${H} L${xy[0][0]},${H} Z` : "";
  return (
    <div className="mt-6">
      <div className="relative overflow-x-clip">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label={`Gráfico: ${pontos.map((v, i) => `${rotulos[i] || i + 1}: ${formatar(v)}`).join("; ")}`}>
          <defs>
            <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--destaque))" stopOpacity=".35" />
              <stop offset="100%" stopColor="rgb(var(--destaque))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((t) => (
            <line key={t} x1="0" x2={W} y1={T + t * (H - T - B)} y2={T + t * (H - T - B)} stroke="rgb(255 255 255 / .08)" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill={`url(#area-${id})`} />
          <path d={linha} fill="none" stroke="rgb(var(--destaque))" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Pontos e área de toque (HTML, para não deformar com o SVG esticado) */}
        <div className="absolute inset-0">
          {xy.map(([px, py], i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setAtivo(i)} onMouseLeave={() => setAtivo(null)} onFocus={() => setAtivo(i)} onBlur={() => setAtivo(null)}
              className="absolute top-0 h-full -translate-x-1/2 focus:outline-none"
              style={{ left: `${(px / W) * 100}%`, width: `${100 / Math.max(1, pontos.length)}%` }}
              aria-label={`${rotulos[i] || ""} ${formatar(pontos[i])}`}
            >
              <span className={`absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgb(var(--destaque))] bg-[#0a0c0b] transition ${ativo === i ? "scale-150" : pontos.length > 16 ? "opacity-0" : ""}`} style={{ top: `${(py / H) * 100}%` }} />
              {ativo === i && (
                <span className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-stone-950 backdrop-blur vidro-borda" style={{ top: `calc(${(py / H) * 100}% - 10px)` }}>
                  {formatar(pontos[i])}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex">
        {rotulos.map((r, i) => (
          <span key={i} className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center text-[10px] text-stone-500">{r}</span>
        ))}
      </div>
    </div>
  );
}

/** Gráfico de rosca (SVG próprio) com a fatia maior no centro */
function Rosca({ fatias, total }) {
  const R = 58, C = 2 * Math.PI * R;
  let acumulado = 0;
  const maior = [...fatias].sort((a, b) => b.n - a.n)[0];
  return (
    <div className="relative mx-auto mt-5 h-44 w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={fatias.map((f) => `${f.label}: ${f.n}`).join("; ")}>
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgb(255 255 255 / .07)" strokeWidth="16" />
        {total > 0 && fatias.filter((f) => f.n > 0).map((f) => {
          const len = (f.n / total) * C;
          const el = (
            <circle key={f.id} cx="80" cy="80" r={R} fill="none" stroke={f.cor} strokeWidth="16"
              strokeDasharray={`${Math.max(0, len - 3)} ${C}`} strokeDashoffset={-acumulado} strokeLinecap="round" />
          );
          acumulado += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tabular-nums text-stone-950">{total && maior ? Math.round((maior.n / total) * 100) : 0}%</span>
        <span className="text-[11px] text-stone-500">{total && maior ? maior.label : "sem pedidos"}</span>
      </div>
    </div>
  );
}

export function AdminDashboard({ orders, donations, clients, messages, newsletter, chats, reviews, onUpdateStatus, onUpdateOrder, onDelete, onLogout, onStore, notify, actions }) {
  const cloud = useCloud();
  const store = useStore();
  const { allProducts, settings, coupons } = store;
  const [tab, setTab] = useState("visao");
  // Cada aba começa do topo (o menu lateral fica parado)
  React.useEffect(() => { window.scrollTo({ top: 0 }); }, [tab]);

  /* ---------- Novo pedido: aviso e som; modo apresentação (TCC) ---------- */
  const [apresentando, setApresentando] = useState(false);
  const [som, setSomState] = useState(() => { try { return window.localStorage.getItem("farmaura_som_pedidos") !== "0"; } catch { return true; } });
  const setSom = (fn) => setSomState((v) => {
    const next = typeof fn === "function" ? fn(v) : fn;
    try { window.localStorage.setItem("farmaura_som_pedidos", next ? "1" : "0"); } catch { /* ignora */ }
    return next;
  });
  useNovosPedidos(orders, (o) => {
    if (apresentando) return; // a tela da apresentação tem o próprio aviso
    notify(`Novo pedido ${o.id} · ${o.customer.name.split(" ")[0]} · ${formatBRL(o.total)}`);
    if (som) tocarAviso();
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [onlyGifts, setOnlyGifts] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [productQuery, setProductQuery] = useState("");
  const openOrder = orders.find((o) => o.id === openId) || null;
  const editProduct = allProducts.find((p) => p.id === editId) || null;

  /** Indicadores gerais */
  const kpis = useMemo(() => {
    const revenue = orders.reduce((a, o) => a + o.total, 0);
    const pending = orders.filter((o) => o.status === "Recebido").length;
    const customers = new Set(orders.map((o) => o.customer.email.toLowerCase())).size;
    const units = orders.reduce((a, o) => a + o.items.reduce((s, i) => s + i.qty, 0), 0);
    const gifts = orders.filter((o) => o.gift).length;
    const customs = orders.reduce((a, o) => a + o.items.filter((i) => i.custom).reduce((s, i) => s + i.qty, 0), 0);
    const couponOrders = orders.filter((o) => o.coupon).length;
    return { sales: orders.length, revenue, pending, customers, units, gifts, customs, couponOrders, ticket: orders.length ? revenue / orders.length : 0 };
  }, [orders]);

  const lowStock = allProducts.filter((p) => p.active && p.stock <= settings.lowStock).sort((a, b) => a.stock - b.stock);

  /** Vendas por período: 7 e 30 dias (por dia) ou 90 dias (por semana) */
  const [period, setPeriod] = useState(7);
  const days = useMemo(() => {
    const out = [];
    const today = new Date();
    const start = (k) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - k);
    if (period === 90) {
      for (let w = 12; w >= 0; w--) {
        const from = start(w * 7 + 6), to = start(w * 7 - 1);
        const list = orders.filter((o) => { const t = new Date(o.createdAt); return t >= from && t < to; });
        out.push({
          key: from.toISOString(), isToday: w === 0,
          label: from.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), showLabel: w % 2 === 0,
          value: list.reduce((a, o) => a + o.total, 0), count: list.length,
        });
      }
      return out;
    }
    for (let k = period - 1; k >= 0; k--) {
      const d = start(k);
      const key = d.toDateString();
      const list = orders.filter((o) => new Date(o.createdAt).toDateString() === key);
      out.push({
        key,
        isToday: k === 0,
        label: k === 0 ? "Hoje" : period === 7 ? d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "") : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        showLabel: period === 7 || k % 5 === 0,
        value: list.reduce((a, o) => a + o.total, 0),
        count: list.length,
      });
    }
    return out;
  }, [orders, period]);

  /** Vendas por produto e por linha */
  const productStats = useMemo(() => {
    return allProducts.map((p) => {
      let units = 0, value = 0, customs = 0;
      orders.forEach((o) => o.items.filter((i) => i.id === p.id).forEach((i) => {
        units += i.qty;
        value += i.price * i.qty;
        if (i.custom) customs += i.qty;
      }));
      return { ...p, units, value, customs };
    });
  }, [orders, allProducts]);
  const byCategory = Object.keys(CATEGORY_LABELS).map((c) => ({
    id: c,
    label: CATEGORY_LABELS[c],
    value: productStats.filter((p) => p.category === c).reduce((a, p) => a + p.value, 0),
  }));
  const maxCategory = Math.max(1, ...byCategory.map((c) => c.value));
  const maxProduct = Math.max(1, ...productStats.map((p) => p.value));
  const topSellers = [...productStats].filter((p) => p.units > 0).sort((a, b) => b.units - a.units).slice(0, 5);
  const recent = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const [qrSheet, setQrSheet] = useState(false);
  const visibleProducts = productStats.filter((p) => {
    const q = normalize(productQuery.trim());
    return !q || normalize(`${p.name} ${p.variant} ${CATEGORY_LABELS[p.category]}`).includes(q);
  });

  /** Clientes: quem fez cadastro + quem comprou sem cadastro (agrupados por e-mail) */
  const customers = useMemo(() => {
    const map = {};
    clients.forEach((c) => {
      const k = (c.email || c.uid || "").toLowerCase();
      const a = c.address || {};
      map[k] = {
        name: c.name, email: c.email, phone: c.phone, uid: c.uid,
        city: a.city ? `${a.city}/${a.state || ""}` : "—",
        registered: true, createdAt: c.createdAt, newsletter: !!c.newsletter, demo: !!c.demo,
        orders: 0, spent: 0, last: null,
      };
    });
    orders.forEach((o) => {
      const k = o.customer.email.toLowerCase();
      if (!map[k]) map[k] = { ...o.customer, city: `${o.address.city}/${o.address.state}`, registered: false, orders: 0, spent: 0, last: null };
      map[k].orders += 1;
      map[k].spent += o.total;
      if (!map[k].last || new Date(o.createdAt) > new Date(map[k].last)) map[k].last = o.createdAt;
    });
    return Object.values(map).sort((a, b) => b.spent - a.spent || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, clients]);
  const [confirmClient, setConfirmClient] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter((o) => statusFilter === "Todos" || o.status === statusFilter)
      .filter((o) => paymentFilter === "Todos" || PAYMENT_GROUP(o.payment) === paymentFilter)
      .filter((o) => !onlyGifts || o.gift)
      .filter((o) => !q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q));
  }, [orders, query, statusFilter, paymentFilter, onlyGifts]);

  const attention = orders
    .filter((o) => o.status === "Recebido" || o.status === "Em preparação")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 5);

  const activeCoupons = coupons.filter((c) => c.active).length;
  const TABS = [
    { id: "visao", label: "Visão Geral", icon: BarChart },
    { id: "pedidos", label: "Pedidos", icon: Package, count: kpis.pending },
    { id: "chat", label: "Chat", icon: MessageCircle, count: chats.filter((c) => chatUnread(c, "cliente") > 0).length },
    { id: "produtos", label: "Produtos", icon: Store, count: lowStock.length, warn: true },
    { id: "cupons", label: "Cupons", icon: Tag },
    { id: "avaliacoes", label: "Avaliações", icon: Star, count: reviews.filter((r) => r.status === "pendente").length, warn: true },
    { id: "doacoes", label: "Doações", icon: Heart, count: donations.filter((d) => d.status === "Aguardando").length, warn: true },
    { id: "clientes", label: "Clientes", icon: Users, count: clients.length },
    { id: "mensagens", label: "Mensagens", icon: Inbox, count: messages.filter((m) => !m.read).length },
    { id: "aparencia", label: "Aparência", icon: Sparkles },
    { id: "config", label: "Configurações", icon: Settings },
  ];

  const goOrders = (status) => { setStatusFilter(status); setOnlyGifts(false); setTab("pedidos"); };

  const copyCSV = async () => {
    try {
      await navigator.clipboard.writeText(ordersToCSV(filtered));
      notify(`${filtered.length} pedidos copiados. Cole numa planilha.`);
    } catch {
      notify("O navegador bloqueou a cópia. Tente de novo pelo navegador comum.", "error");
    }
  };

  /* ---------- Visão geral no estilo vidro: período atual x período anterior ---------- */
  const noPeriodo = (o, desde, ate) => { const t = new Date(o.createdAt); return t >= desde && t < ate; };
  const janela = useMemo(() => {
    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
    const ini = new Date(fim); ini.setDate(ini.getDate() - period);
    const iniAnt = new Date(ini); iniAnt.setDate(iniAnt.getDate() - period);
    const atual = orders.filter((o) => noPeriodo(o, ini, fim));
    const anterior = orders.filter((o) => noPeriodo(o, iniAnt, ini));
    const soma = (l) => l.reduce((a, o) => a + o.total, 0);
    const clientesDe = (l) => new Set(l.map((o) => o.customer.email.toLowerCase())).size;
    const fat = soma(atual), fatAnt = soma(anterior);
    return {
      atual,
      fat, fatAnt,
      pedidos: atual.length, pedidosAnt: anterior.length,
      ticket: atual.length ? fat / atual.length : 0, ticketAnt: anterior.length ? fatAnt / anterior.length : 0,
      clientes: clientesDe(atual), clientesAnt: clientesDe(anterior),
    };
  }, [orders, period]);

  const [serie, setSerie] = useState("valor"); // "valor" | "pedidos"
  const [filtroRecentes, setFiltroRecentes] = useState("Todos");
  const recentesTabela = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((o) => filtroRecentes === "Todos" || o.status === filtroRecentes)
    .slice(0, 7);

  /** Pedidos do período por forma de pagamento (todos os pedidos, se o período estiver vazio) */
  const pagamentos = useMemo(() => {
    const base = janela.atual.length ? janela.atual : orders;
    const cores = { PIX: "rgb(var(--destaque))", "Cartão de Crédito": "rgb(56 189 248)", Boleto: "rgb(251 191 36)" };
    const lista = PAYMENT_METHODS.map((m) => ({ id: m.id, label: m.label, cor: cores[m.id] || "rgb(167 139 250)", n: base.filter((o) => PAYMENT_GROUP(o.payment) === m.id).length }));
    const total = lista.reduce((a, p) => a + p.n, 0);
    return { lista, total, doPeriodo: janela.atual.length > 0 };
  }, [janela, orders]);

  /** Últimos acontecimentos: pedidos, mensagens, chats, avaliações e doações */
  const atividade = useMemo(() => {
    const itens = [
      ...orders.map((o) => ({ id: `p-${o.id}`, at: o.createdAt, icon: Package, cor: "text-emerald-700", titulo: `Novo pedido ${o.id}`, sub: `${o.customer.name} · ${formatBRL(o.total)}`, go: () => setOpenId(o.id) })),
      ...messages.map((m) => ({ id: `m-${m.id}`, at: m.createdAt, icon: Inbox, cor: "text-sky-700", titulo: `Mensagem de ${(m.name || "cliente").split(" ")[0]}`, sub: m.read ? "Lida" : "Não lida", go: () => setTab("mensagens") })),
      ...chats.filter((c) => c.ultimaEm).map((c) => ({ id: `c-${c.uid}`, at: c.ultimaEm, icon: MessageCircle, cor: "text-violet-700", titulo: `Chat com ${(c.name || "visitante").split(" ")[0]}`, sub: chatUnread(c, "cliente") > 0 ? "Esperando resposta" : "Respondido", go: () => setTab("chat") })),
      ...reviews.map((r) => ({ id: `a-${r.id}`, at: r.createdAt, icon: Star, cor: "text-amber-700", titulo: `Avaliação ${"★".repeat(Math.max(0, Math.min(5, r.stars || 0)))}`, sub: r.status === "pendente" ? "Esperando aprovação" : r.status, go: () => setTab("avaliacoes") })),
      ...donations.map((d) => ({ id: `d-${d.id}`, at: d.createdAt, icon: Heart, cor: "text-rose-700", titulo: `Doação de ${formatBRL(d.amount || 0)}`, sub: d.name || "Anônima", go: () => setTab("doacoes") })),
    ];
    return itens.filter((i) => i.at && !Number.isNaN(new Date(i.at).getTime())).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 7);
  }, [orders, messages, chats, reviews, donations]);

  const MENU = [
    { titulo: "Loja", itens: TABS.filter((t) => !["aparencia", "config"].includes(t.id)) },
    { titulo: "Sistema", itens: TABS.filter((t) => ["aparencia", "config"].includes(t.id)) },
  ];
  const iniciais = (cloud.email || "Equipe Farmaura").replace(/@.*/, "").split(/[ ._-]+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("") || "EF";
  const buscar = (e) => { e.preventDefault(); setStatusFilter("Todos"); setPaymentFilter("Todos"); setOnlyGifts(false); setTab("pedidos"); };

  return (
    <div className="vidro">
      <div className="vidro-fundo" aria-hidden="true" />
      <div className="mx-auto flex max-w-[1520px] gap-5 p-3 sm:p-4 lg:p-5">
        {/* ---------- Menu lateral ---------- */}
        <aside className="sticky top-5 hidden h-[calc(100dvh-2.5rem)] w-64 shrink-0 flex-col rounded-[1.75rem] bg-surface vidro-borda p-4 lg:flex" aria-label="Menu do painel">
          <div className="flex items-center gap-3 px-2 pb-5 pt-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destaque text-destaque-fg vidro-brilho"><Leaf className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="truncate font-bold text-stone-950">Farmaura</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Central da equipe</p>
            </div>
          </div>
          <nav className="flex-1 space-y-5 overflow-y-auto">
            {MENU.map((grupo) => (
              <div key={grupo.titulo}>
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">{grupo.titulo}</p>
                <ul className="space-y-1">
                  {grupo.itens.map(({ id, label, icon: Icon, count, warn }) => (
                    <li key={id}>
                      <button
                        onClick={() => setTab(id)}
                        aria-current={tab === id ? "page" : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          tab === id ? "bg-white/10 text-stone-950 vidro-borda" : "border border-transparent text-stone-600 hover:bg-white/5 hover:text-stone-900"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${tab === id ? "text-[rgb(var(--destaque))]" : ""}`} />
                        <span className="flex-1 text-left">{label}</span>
                        {count > 0 && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${warn ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-700"}`}>{count}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="space-y-2 border-t border-white/10 pt-4">
            <button onClick={onStore} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-white/5 hover:text-stone-900">
              <Store className="h-4 w-4" /> Ver a loja
            </button>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">{iniciais}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900">{cloud.email || "Modo local"}</p>
                <p className="text-[11px] text-stone-500">{cloud.status === "online" ? "Equipe Farmaura" : "Só neste computador"}</p>
              </div>
              <button onClick={onLogout} className="rounded-lg p-1.5 text-stone-500 transition hover:bg-white/10 hover:text-stone-900" aria-label="Sair do painel" title="Sair">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-5 pb-10">
          {/* ---------- Barra do topo ---------- */}
          <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] bg-surface vidro-borda p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destaque text-destaque-fg lg:hidden"><Leaf className="h-4 w-4" /></span>
            <form onSubmit={buscar} className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-xl bg-white/5 px-3 py-2 vidro-borda" role="search">
              <Search className="h-4 w-4 shrink-0 text-stone-500" />
              <label htmlFor="busca-painel" className="sr-only">Buscar pedido, cliente ou e-mail</label>
              <input id="busca-painel" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar pedido, cliente ou e-mail…" className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-500" />
            </form>
            {tab === "visao" && (
              <div className="flex gap-1 rounded-xl bg-white/5 p-1 vidro-borda" role="radiogroup" aria-label="Período">
                {[7, 30, 90].map((n) => (
                  <button key={n} role="radio" aria-checked={period === n} onClick={() => setPeriod(n)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold tabular-nums transition ${period === n ? "bg-white/15 text-stone-950" : "text-stone-500 hover:text-stone-800"}`}>
                    {n}D
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setApresentando(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-destaque px-3 py-2 text-xs font-semibold text-destaque-fg btn-glow transition hover:brightness-105">
              <Play className="h-3.5 w-3.5" /> Apresentação
            </button>
            {cloud.status === "online" ? (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                {cloud.provider === "firebase" ? "Firebase conectado" : "Banco conectado"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-stone-600 vidro-borda" title="Os dados ficam só neste navegador">
                <Database className="h-3.5 w-3.5" /> {cloud.status === "connecting" ? "Conectando…" : "Modo local"}
              </span>
            )}
            <button onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-stone-800 vidro-borda transition hover:bg-white/10 lg:hidden">
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>

          {/* Abas no celular e tablet (no computador, o menu lateral) */}
          <div className="overflow-x-auto lg:hidden">
            <div className="flex min-w-max gap-1 rounded-2xl bg-surface vidro-borda p-1">
              {[...TABS, { id: "__loja", label: "Ver a loja", icon: Store }].map(({ id, label, icon: Icon, count, warn }) => (
                <button
                  key={id}
                  onClick={() => (id === "__loja" ? onStore() : setTab(id))}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${tab === id ? "bg-white/15 text-stone-950" : "text-stone-600"}`}
                >
                  <Icon className="h-4 w-4" /> {label}
                  {count > 0 && <span className={`rounded-full px-1.5 text-[10px] font-bold tabular-nums ${warn ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-700"}`}>{count}</span>}
                </button>
              ))}
            </div>
          </div>

          {cloud.status === "online" && !cloud.isAdmin && (
            <p className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Sua conta não faz parte da equipe deste site, então o painel mostra só os seus próprios dados.
            </p>
          )}
          {cloud.status === "local" && (
            <p className="flex items-start gap-2 rounded-2xl bg-surface vidro-borda p-4 text-sm text-stone-600">
              <Database className="mt-0.5 h-4 w-4 shrink-0" />
              Modo local: os cadastros e pedidos ficam salvos só neste navegador. No site publicado, o painel usa o banco de dados.
            </p>
          )}

      {/* ---------------- VISÃO GERAL ---------------- */}
      {tab === "visao" && (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-stone-950 sm:text-3xl">Olá, equipe Farmaura</h1>
            <p className="mt-1 text-sm text-stone-500">
              {kpis.pending > 0 ? `${kpis.pending} ${kpis.pending === 1 ? "pedido espera" : "pedidos esperam"} processamento` : "Nenhum pedido pendente agora"}
              {lowStock.length > 0 && ` · ${lowStock.length} ${lowStock.length === 1 ? "produto" : "produtos"} com estoque baixo`}
              {(() => { const n = chats.filter((c) => chatUnread(c, "cliente") > 0).length; return n ? ` · ${n} ${n === 1 ? "conversa esperando" : "conversas esperando"} resposta` : ""; })()}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiVidro icon={DollarSign} cor="bg-lime-100 text-lime-800" label="Faturamento" value={formatBRL(janela.fat)} atual={janela.fat} anterior={janela.fatAnt} period={period} />
            <KpiVidro icon={Package} cor="bg-emerald-100 text-emerald-800" label="Pedidos" value={janela.pedidos} atual={janela.pedidos} anterior={janela.pedidosAnt} period={period} />
            <KpiVidro icon={ShoppingBag} cor="bg-sky-100 text-sky-800" label="Ticket médio" value={formatBRL(janela.ticket)} atual={janela.ticket} anterior={janela.ticketAnt} period={period} />
            <KpiVidro icon={Users} cor="bg-violet-100 text-violet-800" label="Clientes que compraram" value={janela.clientes} atual={janela.clientes} anterior={janela.clientesAnt} period={period} />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: Gift, label: "Pedidos para presente", value: kpis.gifts, tone: "text-rose-700", go: () => { setOnlyGifts(true); setStatusFilter("Todos"); setTab("pedidos"); } },
              { icon: PenLine, label: "Itens personalizados", value: kpis.customs, tone: "text-amber-700", go: () => setTab("pedidos") },
              { icon: Tag, label: `Pedidos com cupom · ${activeCoupons} ativos`, value: kpis.couponOrders, tone: "text-emerald-700", go: () => setTab("cupons") },
              { icon: AlertTriangle, label: "Produtos com estoque baixo", value: lowStock.length, tone: lowStock.length ? "text-amber-700" : "text-stone-400", go: () => setTab("produtos") },
            ].map(({ icon: Icon, label, value, tone, go }) => (
              <button key={label} onClick={go} className="flex items-center gap-3 rounded-2xl bg-surface vidro-borda px-4 py-3 text-left transition hover:bg-white/10">
                <Icon className={`h-5 w-5 shrink-0 ${tone}`} />
                <div className="min-w-0">
                  <p className="text-lg font-bold tabular-nums text-stone-950">{value}</p>
                  <p className="truncate text-[11px] text-stone-500">{label}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
            <section className="rounded-[1.75rem] bg-surface vidro-borda p-5 sm:p-6" aria-labelledby="titulo-grafico">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="titulo-grafico" className="text-base font-semibold text-stone-950">Vendas no período</h2>
                  <p className="text-xs tabular-nums text-stone-500">
                    {formatBRL(days.reduce((a, d) => a + d.value, 0))} em {days.reduce((a, d) => a + d.count, 0)} pedidos{period === 90 ? " · por semana" : " · por dia"}
                  </p>
                </div>
                <div className="flex gap-1 rounded-xl bg-white/5 p-1 vidro-borda" role="radiogroup" aria-label="O que mostrar no gráfico">
                  {[["valor", "Faturamento"], ["pedidos", "Pedidos"]].map(([id, label]) => (
                    <button key={id} role="radio" aria-checked={serie === id} onClick={() => setSerie(id)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${serie === id ? "bg-white/15 text-stone-950" : "text-stone-500 hover:text-stone-800"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <GraficoLinha
                pontos={days.map((d) => (serie === "valor" ? d.value : d.count))}
                rotulos={days.map((d) => (d.showLabel === false ? "" : d.label))}
                formatar={serie === "valor" ? (v) => formatBRL(v) : (v) => `${v} ${v === 1 ? "pedido" : "pedidos"}`}
              />
            </section>

            <section className="flex flex-col rounded-[1.75rem] bg-surface vidro-borda p-5 sm:p-6" aria-labelledby="titulo-pagamentos">
              <h2 id="titulo-pagamentos" className="text-base font-semibold text-stone-950">Formas de pagamento</h2>
              <p className="text-xs text-stone-500">{pagamentos.doPeriodo ? `Pedidos dos últimos ${period} dias` : "Todos os pedidos (nenhum no período)"}</p>
              <Rosca fatias={pagamentos.lista} total={pagamentos.total} />
              <ul className="mt-auto space-y-2.5 pt-4">
                {pagamentos.lista.map((p) => (
                  <li key={p.id} className="flex items-center gap-2.5 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.cor }} />
                    <span className="flex-1 text-stone-700">{p.label}</span>
                    <span className="font-semibold tabular-nums text-stone-950">{pagamentos.total ? Math.round((p.n / pagamentos.total) * 100) : 0}%</span>
                    <span className="w-12 text-right text-xs tabular-nums text-stone-500">({p.n})</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
            <section className="min-w-0 rounded-[1.75rem] bg-surface vidro-borda" aria-labelledby="titulo-recentes">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
                <h2 id="titulo-recentes" className="text-base font-semibold text-stone-950">Pedidos recentes</h2>
                <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Filtrar por status">
                  {["Todos", ...Object.keys(ORDER_STATUS)].map((s) => (
                    <button key={s} role="radio" aria-checked={filtroRecentes === s} onClick={() => setFiltroRecentes(s)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold transition vidro-borda ${filtroRecentes === s ? "bg-white/15 text-stone-950" : "text-stone-500 hover:text-stone-800"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {recentesTabela.length === 0 ? (
                <p className="px-6 py-12 text-center text-sm text-stone-500">Nenhum pedido {filtroRecentes === "Todos" ? "ainda" : `com status “${filtroRecentes}”`}.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[34rem] text-left text-sm">
                    <thead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      <tr className="border-b border-white/10">
                        <th className="px-5 py-2.5 font-semibold sm:px-6">Cliente</th>
                        <th className="px-3 py-2.5 font-semibold">Pagamento</th>
                        <th className="px-3 py-2.5 font-semibold">Status</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                        <th className="px-5 py-2.5 text-right font-semibold sm:px-6">Quando</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {recentesTabela.map((o) => (
                        <tr key={o.id} onClick={() => setOpenId(o.id)} className="cursor-pointer transition hover:bg-white/5">
                          <td className="px-5 py-3 sm:px-6">
                            <button onClick={(e) => { e.stopPropagation(); setOpenId(o.id); }} className="flex items-center gap-3 text-left">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                                {o.customer.name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("")}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-medium text-stone-950">{o.customer.name}</span>
                                <span className="block font-mono text-[11px] text-stone-500">{o.id}</span>
                              </span>
                            </button>
                          </td>
                          <td className="px-3 py-3 text-xs text-stone-600">{PAYMENT_GROUP(o.payment)}</td>
                          <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                          <td className="px-3 py-3 text-right font-semibold tabular-nums text-stone-950">{formatBRL(o.total)}</td>
                          <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-stone-500 sm:px-6">{quando(o.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-5 pb-5 pt-3 sm:px-6">
                <button onClick={() => goOrders(filtroRecentes)} className="text-xs font-semibold text-emerald-700 hover:underline">Ver todos os pedidos</button>
              </div>
            </section>

            <section className="rounded-[1.75rem] bg-surface vidro-borda p-5 sm:p-6" aria-labelledby="titulo-atividade">
              <div className="flex items-center justify-between gap-2">
                <h2 id="titulo-atividade" className="text-base font-semibold text-stone-950">Atividade</h2>
                {cloud.status === "online" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Ao vivo
                  </span>
                )}
              </div>
              {atividade.length === 0 ? (
                <p className="py-10 text-center text-sm text-stone-500">Nada por aqui ainda.</p>
              ) : (
                <ul className="mt-4 space-y-1">
                  {atividade.map(({ id, at, icon: Icon, cor, titulo, sub, go }) => (
                    <li key={id}>
                      <button onClick={go} className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5">
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 vidro-borda ${cor}`}><Icon className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-stone-900">{titulo}</span>
                          <span className="block truncate text-xs text-stone-500">{sub} · {quando(at)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <section className="rounded-[1.75rem] bg-surface vidro-borda">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <h2 className="text-sm font-semibold text-stone-950">Precisam de ação</h2>
                <button onClick={() => goOrders("Todos")} className="text-xs font-semibold text-emerald-700 hover:underline">Ver todos</button>
              </div>
              {attention.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-stone-500">Tudo em dia. Nenhum pedido aguardando.</p>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {attention.map((o) => (
                    <li key={o.id}>
                      <button onClick={() => setOpenId(o.id)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-left transition hover:bg-white/5">
                        <span className="font-mono text-xs font-bold text-emerald-700">{o.id}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-900">{o.customer.name}</span>
                        {o.gift && <Gift className="h-4 w-4 text-rose-700" aria-label="Presente" />}
                        {o.items.some((i) => i.custom) && <PenLine className="h-4 w-4 text-amber-700" aria-label="Personalizado" />}
                        <StatusBadge status={o.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-[1.75rem] bg-surface vidro-borda">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <h2 className="text-sm font-semibold text-stone-950">Estoque baixo</h2>
                <span className="text-xs text-stone-500">até {settings.lowStock} un.</span>
              </div>
              {lowStock.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-stone-500">Todos os produtos têm estoque suficiente.</p>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {lowStock.map((p) => (
                    <li key={p.id}>
                      <button onClick={() => setEditId(p.id)} className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-white/5">
                        <SafeImage src={p.image} alt={p.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-900">{p.name}</span>
                        <StockBadge stock={p.stock} low={settings.lowStock} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-[1.75rem] bg-surface vidro-borda">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <h2 className="text-sm font-semibold text-stone-950">Mais vendidos</h2>
                <span className="text-xs text-stone-500">por unidades</span>
              </div>
              {topSellers.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-stone-500">Ainda não há vendas registradas.</p>
              ) : (
                <ol className="space-y-3 px-5 py-4">
                  {topSellers.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="w-4 text-sm font-bold tabular-nums text-stone-500">{i + 1}</span>
                      <SafeImage src={p.image} alt={p.name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="truncate font-medium text-stone-900">{p.name}</span>
                          <span className="shrink-0 tabular-nums text-stone-700">{p.units} un.</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-destaque" style={{ width: `${(p.units / topSellers[0].units) * 100}%` }} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              <div className="space-y-3 border-t border-stone-200 px-5 py-4">
                {byCategory.map((c) => (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-600">{c.label}</span>
                      <span className="font-semibold tabular-nums text-stone-900">{formatBRL(c.value)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(c.value / maxCategory) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ---------------- PEDIDOS ---------------- */}
      {tab === "pedidos" && (
        <section className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-surface">
          <div className="flex flex-col gap-3 border-b border-stone-200 p-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Gerenciamento de Pedidos</h2>
              <p className="text-xs text-stone-500">{filtered.length} de {orders.length} pedidos · clique em um pedido para ver tudo</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  id="admin-busca"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nome, e-mail ou nº do pedido"
                  className="w-full rounded-xl border border-stone-300 bg-page py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 sm:w-60"
                />
              </div>
              <select id="admin-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-stone-300 bg-page px-3 py-2.5 text-sm outline-none focus:border-emerald-700" aria-label="Filtrar por status">
                <option value="Todos">Todos os status</option>
                {Object.keys(ORDER_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select id="admin-pagamento" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="rounded-xl border border-stone-300 bg-page px-3 py-2.5 text-sm outline-none focus:border-emerald-700" aria-label="Filtrar por pagamento">
                <option value="Todos">Todos os pagamentos</option>
                {PAYMENT_METHODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <button
                onClick={() => setOnlyGifts((v) => !v)}
                aria-pressed={onlyGifts}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  onlyGifts ? "border-rose-600 bg-rose-600 text-white" : "border-stone-300 text-stone-700 hover:border-stone-500"
                }`}
              >
                <Gift className="h-4 w-4" /> Presentes
              </button>
              <button onClick={copyCSV} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-500">
                <Copy className="h-4 w-4" /> Copiar planilha
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-stone-500">
              <Search className="mx-auto mb-3 h-8 w-8 text-stone-300" />
              Nenhum pedido encontrado para os filtros aplicados.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Pedido</th>
                      <th className="px-5 py-3 font-semibold">Cliente</th>
                      <th className="px-5 py-3 font-semibold">Itens e observações</th>
                      <th className="px-5 py-3 text-right font-semibold">Total</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filtered.map((o) => (
                      <tr key={o.id} className="cursor-pointer align-top transition hover:bg-stone-50/70" onClick={() => setOpenId(o.id)}>
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs font-bold text-emerald-800">{o.id}</p>
                          <p className="mt-1 whitespace-nowrap text-xs text-stone-500">{formatDateTime(o.createdAt)}</p>
                          {o.note && <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-stone-500"><StickyNote className="h-3 w-3" /> com nota</p>}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-stone-900">{o.customer.name}</p>
                          <p className="text-xs text-stone-500">{o.address.city}/{o.address.state}</p>
                        </td>
                        <td className="max-w-[360px] px-5 py-4 text-xs text-stone-700">
                          {o.items.map((i) => (
                            <p key={i.lineId || i.id}>
                              <b>{i.qty}×</b> {i.name}
                              {i.custom && <span className="ml-1 font-semibold text-amber-800">· nome “{i.custom}”</span>}
                            </p>
                          ))}
                          {o.gift && (
                            <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-rose-800">
                              <p className="flex items-center gap-1 font-semibold"><Gift className="h-3 w-3" /> Presente · cartão:</p>
                              <p className="mt-0.5 font-serif text-[13px] italic">{o.gift.message ? `“${o.gift.message}”` : "sem mensagem"}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="font-bold tabular-nums text-stone-900">{formatBRL(o.total)}</p>
                          <p className="text-xs text-stone-500">{PAYMENT_GROUP(o.payment)}</p>
                          {o.coupon && <p className="mt-1 font-mono text-[10px] font-bold text-emerald-700">{o.coupon}</p>}
                        </td>
                        <td className="w-44 px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <StatusSelect value={o.status} onChange={(s) => onUpdateStatus(o.id, s)} />
                        </td>
                        <td className="px-3 py-4 text-stone-400"><ChevronRight className="h-4 w-4" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y divide-stone-100 lg:hidden">
                {filtered.map((o) => (
                  <li key={o.id} className="space-y-3 p-5">
                    <button onClick={() => setOpenId(o.id)} className="w-full space-y-3 text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs font-bold text-emerald-800">{o.id}</p>
                          <p className="text-xs text-stone-500">{formatDateTime(o.createdAt)}</p>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="font-semibold text-stone-900">{o.customer.name} <span className="font-normal text-stone-500">· {o.address.city}/{o.address.state}</span></p>
                      <div className="rounded-xl bg-stone-50 p-3 text-xs text-stone-700">
                        {o.items.map((i) => <p key={i.lineId || i.id}><b>{i.qty}×</b> {i.name}{i.custom ? ` · nome “${i.custom}”` : ""}</p>)}
                        {o.gift && (
                          <p className="mt-2 font-serif text-[13px] italic text-rose-800">
                            <Gift className="mr-1 inline h-3 w-3" />
                            {o.gift.message ? `“${o.gift.message}”` : "Presente, sem mensagem"}
                          </p>
                        )}
                        <p className="mt-2 flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-900">
                          <span>{PAYMENT_GROUP(o.payment)}</span><span>{formatBRL(o.total)}</span>
                        </p>
                      </div>
                    </button>
                    <StatusSelect value={o.status} onChange={(s) => onUpdateStatus(o.id, s)} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* ---------------- PRODUTOS ---------------- */}
      {tab === "produtos" && (
        <>
        <section className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-surface">
          <div className="flex flex-col gap-3 border-b border-stone-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Produtos e estoque</h2>
              <p className="text-xs text-stone-500">
                {allProducts.filter((p) => p.active).length} na loja · {allProducts.filter((p) => !p.active).length} ocultos · clique em Editar para mudar preço, promoção, estoque e personalização
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={() => setQrSheet(true)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800">
              <QrCode className="h-4 w-4" /> QR Codes
            </button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="admin-busca-produto"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Buscar produto"
                className="w-full rounded-xl border border-stone-300 bg-page py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-700 md:w-60"
              />
            </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Produto</th>
                  <th className="px-5 py-3 text-right font-semibold">Preço</th>
                  <th className="px-5 py-3 font-semibold">Estoque</th>
                  <th className="px-5 py-3 text-right font-semibold">Vendidos</th>
                  <th className="px-5 py-3 font-semibold">Faturamento</th>
                  <th className="px-5 py-3 font-semibold">Na loja</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visibleProducts.map((p) => (
                  <tr key={p.id} className={p.active ? "" : "bg-stone-50/60"}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <SafeImage src={p.image} alt={p.name} className={`h-11 w-11 shrink-0 rounded-lg object-cover ${p.active ? "" : "opacity-40 grayscale"}`} />
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900">{p.name}</p>
                          <p className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                            {CATEGORY_LABELS[p.category]}
                            {store.customization[p.id] && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Personalizável</span>}
                            {!p.active && <span className="rounded-full bg-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600">Oculto</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {p.oldPrice && <p className="text-[11px] text-stone-500 line-through">{formatBRL(p.oldPrice)}</p>}
                      <p className="font-semibold text-stone-900">{formatBRL(p.price)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => actions.adjustStock(p.id, -1)} disabled={p.stock <= 0} className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:border-rose-400 hover:text-rose-600 disabled:opacity-30" aria-label={`Retirar 1 unidade de ${p.name}`}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <StockBadge stock={p.stock} low={settings.lowStock} />
                        <button onClick={() => actions.adjustStock(p.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:border-emerald-700 hover:text-emerald-800" aria-label={`Adicionar 1 unidade de ${p.name}`}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => actions.adjustStock(p.id, 10)} className="rounded-full border border-stone-300 px-2 py-1 text-[10px] font-bold text-stone-600 transition hover:border-emerald-700 hover:text-emerald-800" aria-label={`Adicionar 10 unidades de ${p.name}`}>
                          +10
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-stone-700">
                      {p.units}
                      {p.customs > 0 && <span className="block text-[10px] text-amber-800">{p.customs} personalizad{p.customs === 1 ? "o" : "os"}</span>}
                    </td>
                    <td className="w-48 px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div className="h-full rounded-full bg-emerald-700" style={{ width: `${(p.value / maxProduct) * 100}%` }} />
                        </div>
                        <span className="w-20 text-right text-xs font-semibold tabular-nums text-stone-900">{formatBRL(p.value)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Switch
                        id={`ativo-${p.id}`}
                        checked={p.active}
                        onChange={(v) => { actions.saveProduct(p.id, { active: v }); notify(`${p.name} ${v ? "voltou para a loja" : "foi ocultado da loja"}`); }}
                        label={`Mostrar ${p.name} na loja`}
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setEditId(p.id)} className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800">
                        <PenLine className="h-3.5 w-3.5" /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <StockMovements movements={store.data.movimentos || []} />
        {qrSheet && <QrSheetModal onClose={() => setQrSheet(false)} notify={notify} />}
        </>
      )}

      {/* ---------------- CUPONS ---------------- */}
      {tab === "cupons" && <CouponsPanel onSave={actions.saveCoupon} onDelete={actions.deleteCoupon} notify={notify} orders={orders} />}

      {/* ---------------- CLIENTES ---------------- */}
      {tab === "clientes" && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard icon={User} label="Cadastrados" value={customers.filter((c) => c.registered).length} sub="Criaram conta no site" tone="bg-emerald-50 text-emerald-800" />
            <KpiCard icon={ShoppingBag} label="Já compraram" value={customers.filter((c) => c.orders > 0).length} sub={`${customers.filter((c) => c.orders > 1).length} compraram mais de uma vez`} tone="bg-amber-50 text-amber-700" />
            <KpiCard icon={Mail} label="Querem novidades" value={new Set([...customers.filter((c) => c.newsletter).map((c) => c.email), ...newsletter.map((n) => n.email)]).size} sub="Pelo cadastro ou pela newsletter" tone="bg-sky-50 text-sky-700" />
          </div>
          <section className="overflow-hidden rounded-3xl border border-stone-200 bg-surface">
            <div className="border-b border-stone-200 p-5">
              <h2 className="text-lg font-semibold text-stone-900">Clientes</h2>
              <p className="text-xs text-stone-500">{customers.length} {customers.length === 1 ? "pessoa" : "pessoas"} · cadastros feitos em “Minha conta” e quem comprou sem cadastro</p>
            </div>
            {customers.length === 0 ? (
              <div className="p-12 text-center text-sm text-stone-500">
                <User className="mx-auto mb-3 h-8 w-8 text-stone-300" />
                Ninguém se cadastrou ainda. Os cadastros aparecem aqui assim que alguém usa “Minha conta” ou faz um pedido.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Cliente</th>
                      <th className="px-5 py-3 font-semibold">Contato</th>
                      <th className="px-5 py-3 font-semibold">Cidade</th>
                      <th className="px-5 py-3 font-semibold">Cadastro</th>
                      <th className="px-5 py-3 text-right font-semibold">Pedidos</th>
                      <th className="px-5 py-3 text-right font-semibold">Total gasto</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {customers.map((c) => (
                      <tr key={c.email || c.uid}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                              {(c.name || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                            </span>
                            <div>
                              <p className="font-semibold text-stone-900">{c.name}</p>
                              <p className="flex flex-wrap gap-1">
                                {c.registered
                                  ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Cadastrado</span>
                                  : <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">Comprou sem cadastro</span>}
                                {c.orders > 1 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Recorrente</span>}
                                {c.newsletter && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">Novidades</span>}
                                {c.demo && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500">Exemplo</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-stone-600">
                          <p className="select-all">{c.email}</p>
                          <p className="select-all">{c.phone}</p>
                        </td>
                        <td className="px-5 py-3 text-xs text-stone-600">{c.city}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-stone-500">{c.createdAt ? formatDateTime(c.createdAt) : "—"}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-stone-700">{c.orders}</td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums text-stone-900">{formatBRL(c.spent)}</td>
                        <td className="px-5 py-3 text-right">
                          {c.registered && (confirmClient === (c.email || c.uid) ? (
                            <ConfirmInline
                              question="Apagar o cadastro?"
                              confirmLabel="Apagar"
                              onConfirm={() => { actions.deleteClient(c); setConfirmClient(null); }}
                              onCancel={() => setConfirmClient(null)}
                            />
                          ) : (
                            <button onClick={() => setConfirmClient(c.email || c.uid)} className="rounded-full p-1.5 text-stone-400 hover:text-rose-600" aria-label={`Apagar cadastro de ${c.name}`}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ---------------- AVALIAÇÕES ---------------- */}
      {tab === "avaliacoes" && <ReviewsAdminPanel reviews={reviews} onModerate={actions.moderateReview} onDelete={actions.deleteReview} />}

      {/* ---------------- CHAT AO VIVO ---------------- */}
      {tab === "chat" && (
        <ChatAdminPanel chats={chats} onReply={actions.replyChat} onRead={actions.readChat} onDelete={actions.deleteChat} notify={notify} />
      )}

      {/* ---------------- MENSAGENS ---------------- */}
      {tab === "mensagens" && (
        <MessagesPanel messages={messages} newsletter={newsletter} onUpdate={actions.updateMessage} onDelete={actions.deleteMessage} notify={notify} />
      )}

      {/* ---------------- DOAÇÕES ---------------- */}
      {tab === "doacoes" && (
        <DonationsPanel donations={donations} onUpdate={actions.updateDonation} onDelete={actions.deleteDonation} notify={notify} />
      )}

      {/* ---------------- CONFIGURAÇÕES ---------------- */}
      {tab === "aparencia" && <AparenciaPanel onSave={actions.saveAppearance} onPreview={actions.previewStore} notify={notify} />}
      {tab === "config" && (
        <SettingsPanel onSave={actions.saveSettings} onResetStore={actions.resetStore} onResetOrders={actions.resetOrders} onLoadDemo={actions.loadDemo} onClearDemo={actions.clearDemo} demoCount={clients.filter((c) => c.demo).length} notify={notify} />
      )}

      {apresentando && (
        <TelaApresentacao
          orders={orders}
          onClose={() => setApresentando(false)}
          onLoadDemo={actions.loadDemo}
          onClearDemo={actions.clearDemo}
          demoCount={clients.filter((c) => c.demo).length}
          som={som}
          setSom={setSom}
        />
      )}
      {openOrder && (
        <OrderDetail
          key={openOrder.id}
          order={openOrder}
          onClose={() => setOpenId(null)}
          onUpdateStatus={onUpdateStatus}
          onUpdateOrder={onUpdateOrder}
          onDelete={(id) => { onDelete(id); setOpenId(null); }}
          notify={notify}
        />
      )}
      {editProduct && (
        <ProductEditor
          key={editProduct.id}
          product={editProduct}
          onClose={() => setEditId(null)}
          onSave={actions.saveProduct}
          onSaveCustom={actions.saveCustomization}
          onReset={actions.resetProduct}
          notify={notify}
        />
      )}
        </main>
      </div>
    </div>
  );
}
