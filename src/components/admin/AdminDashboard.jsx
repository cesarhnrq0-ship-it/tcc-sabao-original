import React, { useMemo, useState } from "react";
import { AparenciaPanel } from "./AparenciaPanel";
import { ChatAdminPanel, CouponsPanel, DonationsPanel, MessagesPanel, OrderDetail, ProductEditor, QrSheetModal, RevenueChart, ReviewsAdminPanel, SettingsPanel, StockMovements } from "./Paineis";
import { ConfirmInline, KpiCard, SafeImage, StatusBadge, StatusSelect, StockBadge, Switch } from "../ui";
import { CATEGORY_LABELS, ORDER_STATUS, PAYMENT_METHODS } from "../../data/catalogo";
import { useCloud, useStore } from "../../lib/contextos";
import { Sparkles, AlertTriangle, BarChart, ChevronRight, Clock, Copy, Database, DollarSign, Gift, Heart, Inbox, LogOut, Mail, MessageCircle, Minus, Package, PenLine, Plus, QrCode, Search, Settings, ShoppingBag, Star, StickyNote, Store, Tag, Trash2, User, Users } from "../../lib/icones";
import { PAYMENT_GROUP, chatUnread, formatBRL, formatDateTime, normalize, ordersToCSV } from "../../lib/util";

export function AdminDashboard({ orders, donations, clients, messages, newsletter, chats, reviews, onUpdateStatus, onUpdateOrder, onDelete, onLogout, notify, actions }) {
  const cloud = useCloud();
  const store = useStore();
  const { allProducts, settings, coupons } = store;
  const [tab, setTab] = useState("visao");
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Título e ações */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Painel Administrativo</p>
          <h1 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">Olá, equipe Farmaura</h1>
          <p className="mt-1 text-sm text-stone-500">
            {kpis.pending > 0 ? `${kpis.pending} ${kpis.pending === 1 ? "pedido espera" : "pedidos esperam"} processamento` : "Nenhum pedido pendente agora"}
            {lowStock.length > 0 && ` · ${lowStock.length} ${lowStock.length === 1 ? "produto" : "produtos"} com estoque baixo`}
            {(() => { const n = chats.filter((c) => chatUnread(c, "cliente") > 0).length; return n ? ` · ${n} ${n === 1 ? "conversa esperando" : "conversas esperando"} resposta` : ""; })()}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cloud.status === "online" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              <Database className="h-3.5 w-3.5" /> {cloud.provider === "firebase" ? "Firebase conectado" : "Banco de dados conectado"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600" title="Os dados ficam só neste navegador">
              <Database className="h-3.5 w-3.5" /> {cloud.status === "connecting" ? "Conectando…" : "Modo local"}
            </span>
          )}
          <button onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-ink-fg transition hover:opacity-90">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </div>

      {cloud.status === "online" && !cloud.isAdmin && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Sua conta não faz parte da equipe deste site, então o painel mostra só os seus próprios dados. Para ver tudo, o dono precisa convidar você como Editor.
        </p>
      )}
      {cloud.status === "local" && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl border border-stone-200 bg-surface p-4 text-sm text-stone-600">
          <Database className="mt-0.5 h-4 w-4 shrink-0" />
          Modo local: os cadastros e pedidos ficam salvos só neste navegador. Abra o site pelo link do Claude para usar o banco de dados compartilhado.
        </p>
      )}

      {/* Abas */}
      <div className="sticky z-30 mt-8 -mx-1 overflow-x-auto px-1 pb-1" style={{ top: "calc(env(safe-area-inset-top, 0px) + 6.5rem)" }}>
        <div className="flex min-w-max gap-1 rounded-2xl border border-stone-200 bg-surface/95 p-1 shadow-sm backdrop-blur">
          {TABS.map(({ id, label, icon: Icon, count, warn }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === id ? "bg-emerald-900 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                  tab === id ? "bg-white/20 text-white" : warn ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-700"
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- VISÃO GERAL ---------------- */}
      {tab === "visao" && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard icon={DollarSign} label="Faturamento estimado" value={formatBRL(kpis.revenue)} sub={`Ticket médio ${formatBRL(kpis.ticket)}`} tone="bg-amber-50 text-amber-700" />
            <KpiCard icon={Package} label="Pedidos" value={kpis.sales} sub={`${kpis.units} unidades vendidas`} tone="bg-emerald-50 text-emerald-800" />
            <KpiCard icon={Clock} label="Pendentes" value={kpis.pending} sub="Aguardando processamento" tone="bg-rose-50 text-rose-700" />
            <KpiCard icon={Users} label="Clientes" value={kpis.customers} sub="Únicos, por e-mail" tone="bg-sky-50 text-sky-700" />
            <KpiCard icon={Store} label="Produtos cadastrados" value={allProducts.length} sub={`${allProducts.filter((p) => p.active).length} à venda na loja`} tone="bg-lime-50 text-lime-700" />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: Gift, label: "Pedidos para presente", value: kpis.gifts, tone: "text-rose-700", go: () => { setOnlyGifts(true); setStatusFilter("Todos"); setTab("pedidos"); } },
              { icon: PenLine, label: "Itens personalizados", value: kpis.customs, tone: "text-amber-700", go: () => setTab("pedidos") },
              { icon: Tag, label: `Pedidos com cupom · ${activeCoupons} ativos`, value: kpis.couponOrders, tone: "text-emerald-700", go: () => setTab("cupons") },
              { icon: AlertTriangle, label: "Produtos com estoque baixo", value: lowStock.length, tone: lowStock.length ? "text-amber-700" : "text-stone-400", go: () => setTab("produtos") },
            ].map(({ icon: Icon, label, value, tone, go }) => (
              <button key={label} onClick={go} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-surface px-4 py-3 text-left transition hover:border-stone-400">
                <Icon className={`h-5 w-5 shrink-0 ${tone}`} />
                <div className="min-w-0">
                  <p className="text-lg font-bold tabular-nums text-stone-900">{value}</p>
                  <p className="truncate text-[11px] text-stone-500">{label}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-stone-200 bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Vendas por período</p>
                  <p className="text-xs tabular-nums text-stone-500">
                    {formatBRL(days.reduce((a, d) => a + d.value, 0))} em {days.reduce((a, d) => a + d.count, 0)} pedidos{period === 90 ? " · por semana" : ""}
                  </p>
                </div>
                <div className="flex gap-1 rounded-xl bg-stone-100 p-1" role="radiogroup" aria-label="Período">
                  {[7, 30, 90].map((n) => (
                    <button key={n} role="radio" aria-checked={period === n} onClick={() => setPeriod(n)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${period === n ? "bg-surface text-emerald-800 shadow-sm" : "text-stone-500"}`}>
                      {n} dias
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6"><RevenueChart days={days} /></div>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-surface p-6">
              <p className="text-sm font-semibold text-stone-900">Faturamento por linha</p>
              <div className="mt-5 space-y-4">
                {byCategory.map((c) => (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-stone-700">{c.label}</span>
                      <span className="font-semibold tabular-nums text-stone-900">{formatBRL(c.value)}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-emerald-700 transition-all duration-700" style={{ width: `${(c.value / maxCategory) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm font-semibold text-stone-900">Pedidos por status</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {Object.keys(ORDER_STATUS).map((s) => (
                  <button key={s} onClick={() => goOrders(s)} className="flex items-center justify-between rounded-xl border border-stone-200 p-2.5 text-left transition hover:border-stone-400">
                    <StatusBadge status={s} />
                    <span className="text-base font-bold tabular-nums text-stone-900">{orders.filter((o) => o.status === s).length}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-surface">
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
                <p className="text-sm font-semibold text-stone-900">Produtos mais vendidos</p>
                <span className="text-xs text-stone-500">por unidades</span>
              </div>
              {topSellers.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-stone-500">Ainda não há vendas registradas.</p>
              ) : (
                <ol className="space-y-3 px-6 py-4">
                  {topSellers.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="w-5 text-sm font-bold tabular-nums text-stone-400">{i + 1}</span>
                      <SafeImage src={p.image} alt={p.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="truncate font-medium text-stone-900">{p.name}</span>
                          <span className="shrink-0 tabular-nums text-stone-700">{p.units} un.</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                          <div className="h-full rounded-full bg-emerald-700" style={{ width: `${(p.units / topSellers[0].units) * 100}%` }} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="rounded-3xl border border-stone-200 bg-surface">
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
                <p className="text-sm font-semibold text-stone-900">Pedidos recentes</p>
                <button onClick={() => goOrders("Todos")} className="text-xs font-semibold text-emerald-800 hover:underline">Ver histórico completo</button>
              </div>
              {recent.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-stone-500">Nenhum pedido ainda.</p>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {recent.map((o) => (
                    <li key={o.id}>
                      <button onClick={() => setOpenId(o.id)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-6 py-3 text-left transition hover:bg-stone-50">
                        <span className="font-mono text-xs font-bold text-emerald-800">{o.id}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-stone-900">{o.customer.name}</span>
                        <span className="text-xs text-stone-500">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</span>
                        <span className="text-sm font-semibold tabular-nums text-stone-900">{formatBRL(o.total)}</span>
                        <StatusBadge status={o.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-surface">
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
                <p className="text-sm font-semibold text-stone-900">Pedidos que precisam de ação</p>
                <button onClick={() => goOrders("Todos")} className="text-xs font-semibold text-emerald-800 hover:underline">Ver todos</button>
              </div>
              {attention.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-stone-500">Tudo em dia. Nenhum pedido aguardando.</p>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {attention.map((o) => (
                    <li key={o.id}>
                      <button onClick={() => setOpenId(o.id)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-6 py-3.5 text-left transition hover:bg-stone-50">
                        <span className="font-mono text-xs font-bold text-emerald-800">{o.id}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-900">{o.customer.name}</span>
                        {o.gift && <Gift className="h-4 w-4 text-rose-600" aria-label="Presente" />}
                        {o.items.some((i) => i.custom) && <PenLine className="h-4 w-4 text-amber-700" aria-label="Personalizado" />}
                        <StatusBadge status={o.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-3xl border border-stone-200 bg-surface">
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
                <p className="text-sm font-semibold text-stone-900">Estoque baixo</p>
                <span className="text-xs text-stone-500">Alerta em {settings.lowStock} un. ou menos</span>
              </div>
              {lowStock.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-stone-500">Todos os produtos têm estoque suficiente.</p>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {lowStock.map((p) => (
                    <li key={p.id}>
                      <button onClick={() => setEditId(p.id)} className="flex w-full items-center gap-3 px-6 py-3 text-left transition hover:bg-stone-50">
                        <SafeImage src={p.image} alt={p.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-900">{p.name}</span>
                        <StockBadge stock={p.stock} low={settings.lowStock} />
                        <span className="text-xs font-semibold text-emerald-800">Repor</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
  );
}
