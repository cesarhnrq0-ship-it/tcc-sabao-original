import React, { useEffect, useState } from "react";
import { Field, QRCodeSvg, QtyControl, RatingLine, SafeImage, StarInput, Stars } from "../ui";
import { CATALOGS, FEATURE_LABELS, PRODUCT_FACTS, productTags } from "../../data/catalogo";
import { useReviews, useStore } from "../../lib/contextos";
import { MessageCircle, Send, ArrowDown, ArrowLeft, CheckCircle2, ChevronRight, Copy, Heart, Leaf, Package, PenLine, ShoppingBag, Star } from "../../lib/icones";
import { whatsappUrl } from "../../lib/aparencia";
import { compartilhar } from "../../lib/recursos";
import { FreteCalculator } from "./Recursos";
import { downloadQR, fmtAvg, formatBRL, formatDateTime, productUrl } from "../../lib/util";

export function ReviewsBlock({ product, profile }) {
  const { approved, mine, submit, stats } = useReviews();
  const s = stats[product.id];
  const list = approved.filter((r) => r.productId === product.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const myOne = mine.find((r) => r.productId === product.id && r.status !== "rejeitada");
  const [stars, setStars] = useState(0);
  const [name, setName] = useState(profile ? profile.name : "");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { if (profile && !name) setName(profile.name); }, [profile]);

  const send = async (e) => {
    e.preventDefault();
    if (!stars) return setErr("Escolha de 1 a 5 estrelas.");
    if (name.trim().length < 2) return setErr("Digite seu nome.");
    if (text.trim().length < 10) return setErr("Escreva um comentário com pelo menos 10 letras.");
    setErr("");
    setBusy(true);
    const ok = await submit({ productId: product.id, stars, name: name.trim(), text: text.trim() });
    setBusy(false);
    if (ok) { setStars(0); setText(""); }
  };

  return (
    <section id="avaliacoes" className="scroll-mt-28 rounded-[2rem] border border-stone-200 bg-surface p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div>
          <h2 className="font-serif text-2xl text-stone-900">Avaliações</h2>
          {s ? (
            <div className="mt-4">
              <p className="font-serif text-5xl text-stone-900">{fmtAvg(s.avg)}</p>
              <Stars rating={s.avg} size="h-5 w-5" />
              <p className="mt-1 text-xs text-stone-500">{s.count} {s.count === 1 ? "avaliação" : "avaliações"} de clientes</p>
              <div className="mt-4 space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-3 tabular-nums text-stone-600">{n}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <span className="block h-full rounded-full bg-amber-400" style={{ width: `${(s.dist[n - 1] / s.count) * 100}%` }} />
                    </span>
                    <span className="w-5 text-right tabular-nums text-stone-500">{s.dist[n - 1]}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-stone-500">Este produto ainda não tem avaliações. Seja a primeira pessoa a avaliar.</p>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          {myOne ? (
            <div className={`rounded-2xl border p-4 ${myOne.status === "aprovada" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <p className="text-sm font-semibold text-stone-900">
                {myOne.status === "aprovada" ? "Sua avaliação está publicada" : "Sua avaliação foi enviada e aparece aqui depois de aprovada pela equipe"}
              </p>
              <div className="mt-2 flex items-center gap-2"><Stars rating={myOne.stars} /><span className="text-xs text-stone-500">{formatDateTime(myOne.createdAt)}</span></div>
              <p className="mt-1 text-sm text-stone-700">{myOne.text}</p>
            </div>
          ) : (
            <form onSubmit={send} className="space-y-3 rounded-2xl border border-stone-200 bg-page p-4" noValidate>
              <p className="text-sm font-semibold text-stone-900">Avaliar este produto</p>
              <StarInput value={stars} onChange={(n) => { setStars(n); setErr(""); }} />
              <Field label="Seu nome" value={name} onChange={(v) => { setName(v); setErr(""); }} maxLength={40} placeholder="Como quer aparecer" />
              <label className="block">
                <span className="mb-1.5 flex justify-between text-xs font-semibold text-stone-700">
                  Comentário <span className="font-normal tabular-nums text-stone-500">{text.length}/400</span>
                </span>
                <textarea
                  id={`avaliacao-texto-${product.id}`}
                  rows={3}
                  maxLength={400}
                  value={text}
                  onChange={(e) => { setText(e.target.value); setErr(""); }}
                  placeholder="O que achou do produto?"
                  className="w-full rounded-xl border border-stone-300 bg-surface px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              {err && <p className="text-xs font-medium text-rose-600">{err}</p>}
              <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                {busy ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Enviando…</> : "Enviar avaliação"}
              </button>
              <p className="text-[11px] text-stone-500">Uma avaliação por produto. Ela passa pela equipe antes de aparecer.</p>
            </form>
          )}

          {list.length > 0 && (
            <ul className="divide-y divide-stone-100">
              {(showAll ? list : list.slice(0, 4)).map((r) => (
                <li key={r.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                      {r.name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-stone-900">{r.name}</span>
                    <Stars rating={r.stars} size="h-3.5 w-3.5" />
                    <span className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">{r.text}</p>
                </li>
              ))}
            </ul>
          )}
          {list.length > 4 && (
            <button onClick={() => setShowAll((v) => !v)} className="text-sm font-semibold text-emerald-800 hover:underline">
              {showAll ? "Mostrar menos" : `Ver todas as ${list.length} avaliações`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * PÁGINA DO PRODUTO  (#produto-<id>)
 * ------------------------------------------------------------------------- */
/** SEO da página do produto: título, descrição e dados estruturados (Google mostra preço e estrelas) */
function useProductSeo(p, stat) {
  useEffect(() => {
    if (!p) return undefined;
    const prevTitle = document.title;
    const meta = document.querySelector("meta[name=description]");
    const prevDesc = meta ? meta.getAttribute("content") : null;
    document.title = `${p.name} · ${p.variant} | Farmaura`;
    if (meta) meta.setAttribute("content", `${p.tagline} ${p.name} por ${formatBRL(p.price)}. Frete grátis acima de R$ 150.`.slice(0, 160));
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.id = "ld-produto";
    const data = {
      "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, sku: p.id, brand: { "@type": "Brand", name: "Farmaura" },
      image: new URL(p.image, window.location.href).href,
      offers: { "@type": "Offer", priceCurrency: "BRL", price: p.price.toFixed(2), availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: productUrl(p.id) },
    };
    if (stat && stat.count) data.aggregateRating = { "@type": "AggregateRating", ratingValue: stat.avg.toFixed(1), reviewCount: stat.count };
    ld.textContent = JSON.stringify(data);
    document.getElementById("ld-produto")?.remove();
    document.head.appendChild(ld);
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc !== null) meta.setAttribute("content", prevDesc);
      ld.remove();
    };
  }, [p && p.id, p && p.price, p && p.stock, stat && stat.count]);
}

export function ProductPage({ productId, onBack, onAdd, onCustomize, onOpenPage, favs, onToggleFav, profile, notify }) {
  const { allProducts, products, customization, settings, appearance } = useStore();
  const { stats } = useReviews();
  const p = allProducts.find((x) => x.id === productId && x.active);
  const [qty, setQty] = useState(1);
  useEffect(() => { setQty(1); }, [productId]);
  useProductSeo(p, stats[productId]);

  if (!p) {
    return (
      <main className="page-in mx-auto max-w-xl px-4 py-24 text-center">
        <Package className="mx-auto h-12 w-12 text-stone-300" />
        <h1 className="mt-4 font-serif text-3xl text-stone-900">Produto não encontrado</h1>
        <p className="mt-2 text-sm text-stone-500">Este produto não está mais disponível ou o link está incompleto.</p>
        <button onClick={onBack} className="mt-6 rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white hover:brightness-110">Ver o catálogo</button>
      </main>
    );
  }

  const facts = PRODUCT_FACTS[p.id] || {};
  const tags = productTags(p, customization);
  const soldOut = p.stock <= 0;
  const custom = customization[p.id];
  const url = productUrl(p.id);
  const related = products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);
  const cat = CATALOGS.find((c) => c.category === p.category);
  const isFav = favs.includes(p.id);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); notify("Link do produto copiado"); }
    catch { notify("Não foi possível copiar. Copie o endereço da barra do navegador.", "error"); }
  };

  const Section = ({ title, children }) => (
    <section className="rounded-[1.5rem] border border-stone-200 bg-surface p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-stone-700">{children}</div>
    </section>
  );

  return (
    <main id="conteudo" tabIndex={-1} className="page-in mx-auto max-w-7xl px-4 py-8 outline-none sm:px-6 lg:px-8 lg:py-12">
      <nav aria-label="Caminho" className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
        <button onClick={onBack} className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar à loja
        </button>
        <ChevronRight className="h-3 w-3" />
        <span>{cat ? cat.short : "Catálogo"}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-stone-800">{p.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${p.accent} shadow-xl shadow-black/5 ring-1 ring-stone-900/5`}>
          <SafeImage src={p.image} alt={p.name} className={`aspect-square w-full object-cover ${soldOut ? "opacity-60 grayscale" : ""}`} />
          <span className="absolute left-4 top-4 rounded-full bg-emerald-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">{p.badge}</span>
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{facts.linha || (cat && cat.short)}</p>
          <h1 className="mt-2 font-serif text-4xl text-stone-900 sm:text-5xl">{p.name}</h1>
          <p className="mt-1 text-sm font-medium text-emerald-800">{p.variant}</p>
          <a href="#avaliacoes" onClick={(e) => { e.preventDefault(); document.getElementById("avaliacoes")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-3 inline-block">
            <RatingLine productId={p.id} big />
          </a>
          <p className="mt-4 text-base text-stone-600">{p.tagline}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.filter((t) => t !== "estoque").map((t) => (
              <span key={t} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">{FEATURE_LABELS[t]}</span>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-stone-200 bg-surface p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                {p.oldPrice && <p className="text-sm text-stone-500 line-through">{formatBRL(p.oldPrice)}</p>}
                <p className="text-3xl font-bold text-stone-900">{formatBRL(p.price)}</p>
                {settings.pixDiscount > 0 && <p className="text-xs text-emerald-700">{formatBRL(p.price * (1 - settings.pixDiscount / 100))} no PIX</p>}
              </div>
              <p className={`text-sm font-semibold ${soldOut ? "text-rose-600" : p.stock <= settings.lowStock ? "text-amber-700" : "text-emerald-700"}`}>
                {soldOut ? "Esgotado" : p.stock <= settings.lowStock ? `Últimas ${p.stock} unidades` : "Em estoque"}
              </p>
            </div>
            {!soldOut && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {!custom && <QtyControl qty={qty} onChange={setQty} max={Math.max(1, Math.min(20, p.stock))} />}
                <button
                  onClick={() => (custom ? onCustomize(p) : onAdd(p, qty))}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:brightness-110 active:scale-[.98]"
                >
                  {custom ? <><PenLine className="h-4 w-4" /> Personalizar e comprar</> : <><ShoppingBag className="h-4 w-4" /> Adicionar · {formatBRL(p.price * qty)}</>}
                </button>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => onToggleFav(p.id)} className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-rose-400 hover:text-rose-600">
                <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-rose-600 text-rose-600" : ""}`} /> {isFav ? "Nos favoritos" : "Favoritar"}
              </button>
              <button onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-stone-500">
                <Copy className="h-3.5 w-3.5" /> Copiar link
              </button>
              <button
                onClick={() => compartilhar({ title: `${p.name} · Farmaura`, text: `${p.name} por ${formatBRL(p.price)} na Farmaura`, url }, notify)}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-stone-500"
              >
                <Send className="h-3.5 w-3.5" /> Compartilhar
              </button>
              {whatsappUrl(appearance.contato.whatsapp) && (
                <a
                  href={whatsappUrl(appearance.contato.whatsapp, `Olá! Tenho interesse no ${p.name} (${p.variant}) que vi no site: ${url}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#25d366] px-3 py-1.5 text-xs font-bold text-[#073b1c] transition hover:brightness-105"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Tirar dúvida no WhatsApp
                </a>
              )}
            </div>
          </div>
          <FreteCalculator subtotal={p.price * qty} />
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section title="Descrição"><p>{p.description}</p></Section>
          <Section title="Benefícios">
            <ul className="space-y-2">
              {p.benefits.map((b) => <li key={b} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {b}</li>)}
            </ul>
          </Section>
          <div className="grid gap-4 md:grid-cols-2">
            <Section title={p.specsLabel ? "Especificações" : "Composição"}>
              <ul className="space-y-2">
                {p.ingredients.map((i) => <li key={i} className="flex gap-2"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {i}</li>)}
              </ul>
            </Section>
            <Section title={p.usageLabel ? "Cuidados" : "Modo de uso e cuidados"}>
              <ol className="space-y-2">
                {p.howToUse.map((s, i) => (
                  <li key={s} className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-[10px] font-bold text-white">{i + 1}</span> {s}
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        </div>

        <div className="space-y-4">
          <Section title="Ficha técnica">
            <dl className="space-y-2">
              {[
                ["Linha", facts.linha],
                [p.category === "acessorios" ? "Tamanho" : "Conteúdo", facts.conteudo],
                ["Apresentação", p.variant],
                ["Código", p.id.toUpperCase()],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-stone-100 pb-2 last:border-0">
                  <dt className="text-stone-500">{k}</dt><dd className="text-right font-medium text-stone-800">{v}</dd>
                </div>
              ))}
            </dl>
          </Section>
          <section className="rounded-[1.5rem] border border-stone-200 bg-surface p-6 text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">QR Code do produto</h2>
            <div className="mt-4 flex justify-center"><QRCodeSvg text={url} label={`QR Code da página de ${p.name}`} /></div>
            <p className="mt-3 text-xs text-stone-500">Aponte a câmera do celular para abrir esta página.</p>
            <button onClick={() => downloadQR(url, `qrcode-${p.id}.png`, notify)} className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-500">
              <ArrowDown className="h-3.5 w-3.5" /> Baixar QR Code
            </button>
          </section>
        </div>
      </div>

      <div className="mt-10"><ReviewsBlock product={p} profile={profile} /></div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-3xl text-stone-900">Você também pode gostar</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <button key={r.id} onClick={() => onOpenPage(r.id)} className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-surface p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg">
                <SafeImage src={r.image} alt={r.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-stone-900 group-hover:text-emerald-800">{r.name}</span>
                  <span className="block truncate text-xs text-stone-500">{r.variant}</span>
                  <span className="mt-1 block text-sm font-bold text-stone-900">{formatBRL(r.price)}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
