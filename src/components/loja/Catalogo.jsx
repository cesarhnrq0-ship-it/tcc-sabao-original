import React, { useId, useMemo, useRef, useState } from "react";
import { CompareToggle } from "./Recursos";
import { FOTO_CLASSE } from "../../lib/aparencia";
import { compartilhar, linkFavoritos } from "../../lib/recursos";
import { RatingLine, SafeImage } from "../ui";
import { CATALOGS, FEATURE_LABELS, PRICE_RANGES, SORTS, productTags } from "../../data/catalogo";
import { useNav, useReviews, useStore } from "../../lib/contextos";
import { ArrowRight, Award, Send, CheckCircle2, ChevronDown, Clock, Eye, Heart, PenLine, QrCode, Search, Settings, ShoppingBag, Sparkles, Sun, X } from "../../lib/icones";
import { formatBRL, normalize } from "../../lib/util";

/** Busca com sugestões enquanto digita (setas, Enter e Esc funcionam pelo teclado) */
const BUSCAS_POPULARES = ["refil", "protetor", "viagem", "presente", "boné"];
function SearchBox({ query, setQuery, products, onPick }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const blurTimer = useRef(null);
  const q = normalize(query.trim());
  const sugestoes = q
    ? products.filter((p) => normalize(`${p.name} ${p.variant} ${p.tagline} ${p.category}`).includes(q)).slice(0, 5)
    : [];
  const show = open && (q ? sugestoes.length > 0 : true);
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, sugestoes.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && active >= 0 && sugestoes[active]) { e.preventDefault(); setOpen(false); onPick(sugestoes[active]); }
    else if (e.key === "Escape") { setOpen(false); setActive(-1); }
  };
  const marcar = (texto) => {
    const t = normalize(texto);
    const i = q ? t.indexOf(q) : -1;
    if (i < 0) return texto;
    return <>{texto.slice(0, i)}<mark className="rounded bg-destaque/60 px-0.5 text-inherit">{texto.slice(i, i + q.length)}</mark>{texto.slice(i + q.length)}</>;
  };
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <input
        id="busca-produtos"
        type="search"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-label="Buscar produtos"
        autoComplete="off"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={() => { clearTimeout(blurTimer.current); setOpen(true); }}
        onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }}
        onKeyDown={onKey}
        placeholder="Buscar produtos: refil, protetor, boné, chaveiro..."
        className="w-full rounded-full border border-stone-300 bg-page py-3 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:text-stone-700" aria-label="Limpar busca">
          <X className="h-4 w-4" />
        </button>
      )}
      {show && (
        <div id={listId} role="listbox" aria-label="Sugestões" className="page-in absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-surface p-2 shadow-2xl shadow-black/10">
          {q ? (
            sugestoes.map((p, i) => (
              <button
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setOpen(false); onPick(p); }}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${i === active ? "bg-emerald-50" : ""}`}
              >
                <SafeImage src={p.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-stone-900">{marcar(p.name)}</span>
                  <span className="block truncate text-xs text-stone-500">{p.variant}</span>
                </span>
                <span className="text-sm font-bold text-stone-900">{formatBRL(p.price)}</span>
              </button>
            ))
          ) : (
            <div className="p-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Buscas populares</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {BUSCAS_POPULARES.map((t) => (
                  <button key={t} onMouseDown={(e) => e.preventDefault()} onClick={() => setQuery(t)} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-800">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Card de produto do catálogo */
export function ProductCard({ product, onOpen, onAdd, isFav, onToggleFav, notify }) {
  const { customization, settings, appearance } = useStore();
  const nav = useNav();
  const soldOut = product.stock <= 0;
  const lastUnits = !soldOut && product.stock <= settings.lowStock;
  return (
    <article data-reveal className="card-lift group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-surface shadow-sm hover:border-emerald-700/40 hover:shadow-2xl hover:shadow-emerald-900/15">
      <button
        onClick={() => onOpen(product)}
        className={`relative m-2 overflow-hidden rounded-[1.4rem] bg-gradient-to-br ${product.accent}`}
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <SafeImage
          src={product.image}
          alt={product.name}
          className={`${FOTO_CLASSE[appearance.formatoFoto]} w-full object-cover transition duration-700 group-hover:scale-110 ${soldOut ? "opacity-60 grayscale" : ""}`}
        />
        {soldOut && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-black/70 py-2 text-center text-xs font-bold uppercase tracking-[0.3em] text-white">
            Esgotado
          </span>
        )}
        <span className="absolute left-4 top-4 flex flex-wrap gap-1.5 pr-14">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
              product.bestSeller ? "bg-destaque text-destaque-fg shadow-md" : "bg-white/90 text-[#1c1917] shadow-sm backdrop-blur"
            }`}
          >
            {product.bestSeller && <Award className="-mt-0.5 mr-1 inline h-3 w-3" />}
            {product.badge}
          </span>
          {product.oldPrice && (
            <span className="rounded-full bg-[#e11d48] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              -{Math.round((1 - product.price / product.oldPrice) * 100)}%
            </span>
          )}
        </span>
        <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 translate-y-16 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#1c1917] shadow-lg transition duration-300 group-hover:translate-y-0">
          <Eye className="h-4 w-4" /> Ver detalhes
        </span>
      </button>
      <button
        onClick={() => onToggleFav(product.id)}
        className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur transition hover:scale-110 ${
          isFav ? "bg-[#e11d48] text-white" : "bg-white/90 text-[#44403c]"
        }`}
        aria-pressed={isFav}
        aria-label={isFav ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
      >
        <Heart className={`h-4 w-4 ${isFav ? "fill-white" : ""}`} />
      </button>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <div className="flex items-center gap-2">
          <RatingLine productId={product.id} />
        </div>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-stone-900">
          <button onClick={() => nav.openPage(product.id)} className="text-left transition hover:text-emerald-800 hover:underline decoration-emerald-700/40 underline-offset-4">
            {product.name}
          </button>
        </h3>
        <p className="text-sm font-medium text-emerald-800">{product.variant}</p>
        <p className="mt-2 text-sm text-stone-500">{product.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {lastUnits && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
              <Clock className="h-3 w-3" /> {product.stock === 1 ? "Última unidade" : `Últimas ${product.stock} unidades`}
            </span>
          )}
          {customization[product.id] && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              <PenLine className="h-3 w-3" /> Personalizável
            </span>
          )}
          {product.highlights.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700 max-sm:hidden">
              <Icon className="h-3 w-3" /> {label}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button onClick={() => nav.openPage(product.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline">
            Ver página do produto <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <CompareToggle product={product} notify={notify} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-dashed border-stone-200 pt-4">
          <div>
            {product.oldPrice && <p className="text-xs text-stone-500 line-through">de {formatBRL(product.oldPrice)}</p>}
            <p className={`text-[1.65rem] font-bold leading-none tracking-tight ${product.oldPrice ? "text-[#e11d48]" : "text-stone-900"}`}>{formatBRL(product.price)}</p>
            {settings.pixDiscount > 0 && (
              <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                <QrCode className="h-3 w-3" /> {formatBRL(product.price * (1 - settings.pixDiscount / 100))} no PIX
              </p>
            )}
          </div>
          {soldOut ? (
            <span className="inline-flex items-center rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-500">
              Esgotado
            </span>
          ) : (
            <button
              onClick={() => (customization[product.id] ? onOpen(product) : onAdd(product))}
              className="shine inline-flex items-center gap-2 rounded-full bg-emerald-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
            >
              {customization[product.id] ? <PenLine className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              {customization[product.id] ? "Escolher" : "Adicionar"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** Painel de destaque ao lado de um catálogo com produto único */
export function SpotlightPanel({ product }) {
  const nav = useNav();
  const list = (product.benefits || []).slice(0, 5);
  return (
    <div data-reveal className="palette-light grain relative isolate flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#0c4a6e] via-banner to-banner p-7 text-white sm:p-10">
      <div className="orb pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl" />
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-banner">
          <Sun className="h-3.5 w-3.5" /> {product.badge}
        </p>
        <h3 className="mt-5 font-serif text-3xl leading-tight sm:text-5xl">
          Por que escolher o <em className="text-gradient">{product.name}</em>
        </h3>
        {list.length > 0 && (
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {list.map((b) => (
              <li key={b} className="flex gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm text-white/85">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-destaque" /> {b}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => nav.openPage(product.id)}
        className="btn-glow shine mt-8 inline-flex items-center gap-2 self-start rounded-full bg-destaque px-7 py-3.5 text-sm font-bold text-destaque-fg transition hover:-translate-y-0.5"
      >
        Conhecer o {product.name} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CatalogSection({ catalog, items, onOpen, onAdd, favs, onToggleFav, notify }) {
  if (!items.length) return null;
  const single = items.length === 1;
  return (
    <section id={catalog.id} className={`scroll-mt-28 ${catalog.tone}`}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div data-reveal className="grid items-end gap-6 border-b border-stone-200 pb-8 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> {catalog.eyebrow}
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-stone-900 sm:text-6xl">{catalog.title}</h2>
            <p className="mt-4 text-stone-600 sm:text-lg">{catalog.text}</p>
          </div>
          {/* número decorativo (vem do CSS, leitores de tela ignoram) */}
          <span className="numero-deco hidden font-serif text-8xl leading-none text-stone-200 md:block" data-numero={String(items.length).padStart(2, "0")} aria-hidden="true" />
        </div>
        <div className={`mt-10 grid gap-5 ${single ? "md:grid-cols-[minmax(0,26rem)_1fr]" : items.length % 4 === 0 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={onOpen} onAdd={onAdd} isFav={favs.includes(p.id)} onToggleFav={onToggleFav} notify={notify} />
          ))}
          {single && <SpotlightPanel product={items[0]} />}
        </div>
      </div>
    </section>
  );
}

export function ProductsSection({ onOpen, onAdd, favs, onToggleFav, notify }) {
  const { products, customization } = useStore();
  const { stats } = useReviews();
  const nav = useNav();
  const [category, setCategory] = useState("todos");
  const [price, setPrice] = useState("todos");
  const [feats, setFeats] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const toggleFeat = (f) => setFeats((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  const FEATS = ["estoque", "promocao", "refil", "viagem", "presente", "praia", "personalizavel", "reutilizavel"];
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("relevancia");
  const [onlyFavs, setOnlyFavs] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    let list = products.filter((p) => {
      if (category !== "todos" && p.category !== category) return false;
      if (!PRICE_RANGES.find((r) => r.id === price).test(p.price)) return false;
      if (feats.length) { const t = productTags(p, customization); if (!feats.every((f) => t.includes(f))) return false; }
      if (onlyFavs && !favs.includes(p.id)) return false;
      if (!q) return true;
      return normalize(`${p.name} ${p.variant} ${p.tagline} ${p.category}`).includes(q);
    });
    if (sort === "menor") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "maior") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "avaliados") list = [...list].sort((a, b) => ((stats[b.id] || {}).avg || 0) - ((stats[a.id] || {}).avg || 0) || ((stats[b.id] || {}).count || 0) - ((stats[a.id] || {}).count || 0));
    return list;
  }, [query, sort, onlyFavs, favs, products, category, price, feats, stats, customization]);

  const filtering = !!(query.trim() || onlyFavs || category !== "todos" || price !== "todos" || feats.length);
  const clear = () => { setQuery(""); setOnlyFavs(false); setSort("relevancia"); setCategory("todos"); setPrice("todos"); setFeats([]); };
  const nFilters = (price !== "todos" ? 1 : 0) + feats.length;
  const chips = [
    { id: "todos", label: "Todos", n: products.length },
    ...CATALOGS.map((c) => ({ id: c.category, label: c.short, n: products.filter((p) => p.category === c.category).length })),
  ];

  return (
    <div id="produtos">
      {/* Barra de busca, ordenação e favoritos */}
      <div className="border-b border-stone-200 bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center lg:px-8">
          <SearchBox query={query} setQuery={setQuery} products={products} onPick={(p) => nav.openPage(p.id)} />
          {/* No celular: ordenação ocupa a linha inteira e os dois botões dividem a linha de baixo */}
          <div className="grid grid-cols-2 gap-2 md:flex">
            <div className="relative col-span-2 md:col-span-1 md:flex-none">
              <select
                id="ordenar-produtos"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full appearance-none rounded-full border border-stone-300 bg-page py-3 pl-4 pr-10 text-sm font-medium text-stone-700 outline-none focus:border-emerald-700"
                aria-label="Ordenar produtos"
              >
                {SORTS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            </div>
            <button
              onClick={() => setOnlyFavs((v) => !v)}
              aria-pressed={onlyFavs}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
                onlyFavs ? "border-rose-600 bg-rose-600 text-white" : "border-stone-300 text-stone-700 hover:border-stone-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${onlyFavs ? "fill-white" : ""}`} />
              Favoritos <span className="tabular-nums">({favs.length})</span>
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
                showFilters || nFilters ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-stone-300 text-stone-700 hover:border-stone-500"
              }`}
            >
              <Settings className="h-4 w-4" /> Filtros{nFilters ? ` (${nFilters})` : ""}
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="page-in mx-auto max-w-7xl space-y-3 px-4 pb-4 sm:px-6 lg:px-8">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">Preço</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Faixa de preço">
                {PRICE_RANGES.map((r) => (
                  <button key={r.id} role="radio" aria-checked={price === r.id} onClick={() => setPrice(r.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${price === r.id ? "border-emerald-900 bg-emerald-900 text-white" : "border-stone-300 text-stone-700 hover:border-stone-500"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">Características</p>
              <div className="flex flex-wrap gap-2">
                {FEATS.map((f) => (
                  <button key={f} aria-pressed={feats.includes(f)} onClick={() => toggleFeat(f)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${feats.includes(f) ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-stone-300 text-stone-700 hover:border-stone-500"}`}>
                    {feats.includes(f) && <CheckCircle2 className="h-3.5 w-3.5" />} {FEATURE_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => nav.openQuiz()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline">
              <Sparkles className="h-3.5 w-3.5" /> Não sabe o que escolher? Faça o quiz
            </button>
          </div>
        )}
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
          {chips.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                category === c.id ? "bg-emerald-900 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {c.label}
              <span className={`tabular-nums ${category === c.id ? "text-white/70" : "text-stone-400"}`}>{c.n}</span>
            </button>
          ))}
        </div>
        {filtering && (
          <div className="mx-auto max-w-7xl px-4 pb-4 text-xs text-stone-500 sm:px-6 lg:px-8">
            {filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"} ·{" "}
            <button onClick={clear} className="font-semibold text-emerald-800 underline-offset-2 hover:underline">limpar filtros</button>
          </div>
        )}
        {onlyFavs && favs.length > 0 && (
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 pb-4 sm:px-6 lg:px-8">
            <button
              onClick={() => compartilhar({ title: "Minha lista Farmaura", text: "Olha os produtos que eu separei na Farmaura:", url: linkFavoritos(favs) }, notify)}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
            >
              <Send className="h-3.5 w-3.5" /> Compartilhar minha lista ({favs.length})
            </button>
            <span className="text-xs text-stone-500">Quem abrir o link vê os produtos e pode salvar nos favoritos.</span>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
            {onlyFavs && !query ? <Heart className="h-7 w-7 text-stone-400" /> : <Search className="h-7 w-7 text-stone-400" />}
          </div>
          <p className="mt-4 font-serif text-2xl text-stone-900">
            {onlyFavs && !query ? "Nenhum favorito ainda" : "Nada encontrado"}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            {onlyFavs && !query
              ? "Toque no coração de um produto para guardá-lo aqui."
              : "Tente outra palavra, como refil, protetor ou boné."}
          </p>
          <button onClick={clear} className="mt-6 rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white hover:brightness-110">
            Ver todos os produtos
          </button>
        </div>
      ) : (
        CATALOGS.map((c) => (
          <CatalogSection
            key={c.id}
            catalog={c}
            items={filtered.filter((p) => p.category === c.category)}
            onOpen={onOpen}
            onAdd={onAdd}
            favs={favs}
            onToggleFav={onToggleFav}
            notify={notify}
          />
        ))
      )}
    </div>
  );
}
