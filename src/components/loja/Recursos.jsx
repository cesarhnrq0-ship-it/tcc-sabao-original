import React, { useEffect, useRef, useState } from "react";
import { RatingLine, SafeImage } from "../ui";
import { CATEGORY_LABELS } from "../../data/catalogo";
import { useStore } from "../../lib/contextos";
import { ArrowRight, CheckCircle2, Heart, ShoppingBag, Truck, X, Eye } from "../../lib/icones";
import { buscarCEP, freteParaUF, prazoTexto } from "../../lib/frete";
import { MAX_COMPARAR, alternarComparar, limparComparar, useComparar, useVistos } from "../../lib/recursos";
import { formatBRL, maskCEP } from "../../lib/util";

/* ============================================================================
 * VISTOS RECENTEMENTE — fileira com os últimos produtos abertos
 * ========================================================================== */
export function RecentlyViewed({ onOpen }) {
  const { products } = useStore();
  const ids = useVistos();
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  if (items.length < 2) return null; // com 1 só, não ajuda a decidir nada
  return (
    <section id="vistos" aria-labelledby="vistos-titulo" className="scroll-mt-28 border-y border-stone-200 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Continue de onde parou</p>
        <h2 id="vistos-titulo" className="mt-1 font-serif text-3xl text-stone-900">Vistos recentemente</h2>
        <ul className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2">
          {items.map((p) => (
            <li key={p.id} className="w-44 shrink-0 snap-start sm:w-52">
              <button onClick={() => onOpen(p.id)} className="group block w-full text-left">
                <span className="block overflow-hidden rounded-2xl bg-stone-100">
                  <SafeImage src={p.image} alt="" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                </span>
                <span className="mt-2 block truncate text-sm font-semibold text-stone-900 group-hover:text-emerald-800">{p.name}</span>
                <span className="block text-sm text-stone-600">{formatBRL(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Botão "Comparar" usado no card de produto */
export function CompareToggle({ product, notify }) {
  const ids = useComparar();
  const on = ids.includes(product.id);
  return (
    <button
      onClick={() => { if (!alternarComparar(product.id)) notify && notify(`Dá para comparar até ${MAX_COMPARAR} produtos.`, "error"); }}
      aria-pressed={on}
      aria-label={`Comparar ${product.name}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
        on ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-stone-300 text-stone-600 hover:border-stone-500"
      }`}
    >
      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${on ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-400"}`}>
        {on && <CheckCircle2 className="h-3 w-3" />}
      </span>
      Comparar
    </button>
  );
}

/* ============================================================================
 * COMPARADOR — barra flutuante + tabela lado a lado
 * ========================================================================== */
export function CompareBar({ onAdd, onOpenPage }) {
  const { products, settings, customization } = useStore();
  const ids = useComparar();
  const [open, setOpen] = useState(false);
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  useEffect(() => { if (items.length < 2) setOpen(false); }, [items.length]);
  if (!items.length) return null;

  const rows = [
    { label: "Preço", render: (p) => (
      <div>
        {p.oldPrice && <p className="text-xs text-stone-500 line-through">{formatBRL(p.oldPrice)}</p>}
        <p className="text-lg font-bold text-stone-900">{formatBRL(p.price)}</p>
        {settings.pixDiscount > 0 && <p className="text-xs text-emerald-700">{formatBRL(p.price * (1 - settings.pixDiscount / 100))} no PIX</p>}
      </div>
    ) },
    { label: "Avaliação", render: (p) => <RatingLine productId={p.id} /> },
    { label: "Linha", render: (p) => CATEGORY_LABELS[p.category] || p.category },
    { label: "Tamanho / versão", render: (p) => p.variant },
    { label: "Destaques", render: (p) => p.highlights.map((h) => h.label).join(" · ") },
    { label: "Principais benefícios", render: (p) => (
      <ul className="space-y-1">{(p.benefits || []).slice(0, 3).map((b) => <li key={b} className="flex gap-1.5"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />{b}</li>)}</ul>
    ) },
    { label: "Disponibilidade", render: (p) => (p.stock <= 0 ? <span className="font-semibold text-rose-700">Esgotado</span> : p.stock <= settings.lowStock ? <span className="font-semibold text-amber-700">Últimas {p.stock} unidades</span> : <span className="text-emerald-700">Em estoque</span>) },
  ];

  return (
    <>
      <div className="page-in fixed bottom-4 left-4 z-30 flex max-w-[calc(100vw-6.5rem)] items-center gap-3 rounded-2xl bg-ink p-2.5 pr-3 text-ink-fg shadow-2xl ring-1 ring-black/10" role="region" aria-label="Produtos para comparar">
        <div className="flex -space-x-3">
          {items.map((p) => (
            <SafeImage key={p.id} src={p.image} alt={p.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-ink" />
          ))}
        </div>
        <button
          onClick={() => setOpen(true)}
          disabled={items.length < 2}
          className="whitespace-nowrap rounded-full bg-destaque px-4 py-2 text-xs font-bold text-destaque-fg transition hover:brightness-105 disabled:opacity-60"
        >
          {items.length < 2 ? "Escolha mais 1" : `Comparar ${items.length}`}
        </button>
        <button onClick={limparComparar} className="rounded-full p-1.5 opacity-70 hover:opacity-100" aria-label="Limpar comparação"><X className="h-4 w-4" /></button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Comparar produtos">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <CompareDialog items={items} rows={rows} customization={customization} onClose={() => setOpen(false)} onAdd={onAdd} onOpenPage={onOpenPage} />
        </div>
      )}
    </>
  );
}

function CompareDialog({ items, rows, customization, onClose, onAdd, onOpenPage }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); if (prev && prev.focus) prev.focus(); };
  }, []);
  return (
    <div ref={ref} tabIndex={-1} className="page-in relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-t-[2rem] bg-surface p-5 outline-none sm:rounded-[2rem] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-3xl text-stone-900">Comparar produtos</h2>
        <button onClick={onClose} className="rounded-full p-2 text-stone-600 hover:bg-stone-100" aria-label="Fechar"><X className="h-5 w-5" /></button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              <th className="w-36 p-2" scope="col"><span className="sr-only">Característica</span></th>
              {items.map((p) => (
                <th key={p.id} scope="col" className="p-2 align-top font-normal">
                  <SafeImage src={p.image} alt="" className="aspect-square w-full max-w-[180px] rounded-2xl object-cover" />
                  <p className="mt-2 font-serif text-lg text-stone-900">{p.name}</p>
                  <button onClick={() => alternarComparar(p.id)} className="mt-1 text-[11px] font-semibold text-stone-500 hover:text-rose-700">Remover</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="border-t border-stone-200 p-2 align-top text-xs font-bold uppercase tracking-wider text-stone-500">{r.label}</th>
                {items.map((p) => <td key={p.id} className="border-t border-stone-200 p-2 align-top text-stone-700">{r.render(p)}</td>)}
              </tr>
            ))}
            <tr>
              <td />
              {items.map((p) => (
                <td key={p.id} className="space-y-2 p-2 pt-4">
                  {p.stock > 0 && (
                    <button onClick={() => onAdd(p)} className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 px-4 py-2.5 text-xs font-bold text-white hover:brightness-110">
                      <ShoppingBag className="h-4 w-4" /> {customization[p.id] ? "Escolher" : "Adicionar"}
                    </button>
                  )}
                  <button onClick={() => { onClose(); onOpenPage(p.id); }} className="flex w-full items-center justify-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:border-stone-500">
                    <Eye className="h-3.5 w-3.5" /> Ver página
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
 * LISTA DE FAVORITOS RECEBIDA POR LINK (#favoritos=...)
 * ========================================================================== */
export function SharedFavorites({ ids, onClose, onSaveAll, onOpenPage }) {
  const { products } = useStore();
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!items.length) return null;
  const total = items.reduce((a, p) => a + p.price, 0);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="lista-titulo">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="page-in relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-[2rem] bg-surface p-6 sm:rounded-[2rem] sm:p-8">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-stone-600 hover:bg-stone-100" aria-label="Fechar"><X className="h-5 w-5" /></button>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-700"><Heart className="h-3.5 w-3.5 fill-current" /> Lista compartilhada</p>
        <h2 id="lista-titulo" className="mt-3 font-serif text-3xl text-stone-900">Alguém separou estes produtos para você</h2>
        <ul className="mt-5 space-y-3">
          {items.map((p) => (
            <li key={p.id}>
              <button onClick={() => { onClose(); onOpenPage(p.id); }} className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 p-3 text-left transition hover:border-emerald-700">
                <SafeImage src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-stone-900">{p.name}</span>
                  <span className="block truncate text-xs text-stone-500">{p.variant}</span>
                </span>
                <span className="text-sm font-bold text-stone-900">{formatBRL(p.price)}</span>
                <ArrowRight className="h-4 w-4 text-stone-400" />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-sm text-stone-600">Total da lista: <b className="text-stone-900">{formatBRL(total)}</b></p>
        <button onClick={() => { onSaveAll(items.map((p) => p.id)); onClose(); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 py-3.5 text-sm font-bold text-white hover:brightness-110">
          <Heart className="h-4 w-4" /> Salvar todos nos meus favoritos
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
 * CALCULADORA DE FRETE POR CEP (página do produto)
 * ========================================================================== */
export function FreteCalculator({ subtotal }) {
  const { settings } = useStore();
  const [cep, setCep] = useState(() => { try { return localStorage.getItem("farmaura_cep_v1") || ""; } catch { return ""; } });
  const [res, setRes] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const calcular = async (e) => {
    e && e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const end = await buscarCEP(cep);
      setRes(end);
      try { localStorage.setItem("farmaura_cep_v1", cep); } catch { /* ignora */ }
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setRes(null);
      setStatus({ loading: false, error: err.message });
    }
  };
  const frete = res ? freteParaUF(res.state, settings, subtotal) : null;
  const falta = Math.max(0, settings.freeShipping - subtotal);
  return (
    <form onSubmit={calcular} className="mt-4 rounded-[1.5rem] border border-stone-200 bg-surface p-5" aria-labelledby="frete-titulo">
      <p id="frete-titulo" className="flex items-center gap-2 text-sm font-semibold text-stone-900"><Truck className="h-4 w-4 text-emerald-700" /> Calcular frete e prazo</p>
      <div className="mt-3 flex gap-2">
        <label htmlFor="cep-frete" className="sr-only">CEP</label>
        <input
          id="cep-frete"
          inputMode="numeric"
          autoComplete="postal-code"
          value={cep}
          onChange={(e) => { setCep(maskCEP(e.target.value)); setRes(null); }}
          placeholder="00000-000"
          className="w-36 rounded-full border border-stone-300 bg-page px-4 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
        />
        <button disabled={status.loading} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ink-fg transition hover:opacity-90 disabled:opacity-60">
          {status.loading ? "Calculando…" : "Calcular"}
        </button>
      </div>
      <div role="status" aria-live="polite" className="text-sm">
        {status.error && <p className="mt-3 text-rose-700">{status.error}</p>}
        {frete && (
          <div className="mt-3 rounded-2xl bg-stone-100 p-3.5">
            <p className="text-xs text-stone-500">{[res.district, res.city, res.state].filter(Boolean).join(" · ")}</p>
            <p className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold text-stone-900">{frete.gratis ? <span className="text-emerald-700">Frete grátis</span> : formatBRL(frete.fee)}</span>
              <span className="text-stone-600">chega em {prazoTexto(frete)}</span>
            </p>
            {!frete.gratis && falta > 0 && <p className="mt-1 text-xs text-emerald-800">Faltam {formatBRL(falta)} para o frete grátis.</p>}
          </div>
        )}
      </div>
      <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] text-stone-500 underline-offset-2 hover:underline">Não sei meu CEP</a>
    </form>
  );
}
