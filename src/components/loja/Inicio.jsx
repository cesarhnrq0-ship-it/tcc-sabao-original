import React from "react";
import { SafeImage } from "../ui";
import { useNav, useReviews, useStore } from "../../lib/contextos";
import { ArrowRight, Award, Droplets, FlaskConical, Heart, Leaf, Recycle, ShoppingBag, Sparkles, Sun } from "../../lib/icones";
import { fmtAvg, formatBRL } from "../../lib/util";

/** Banner principal (Hero) — faixa escura de alto contraste com produto em destaque */
export function Hero({ onShop, onAbout }) {
  const { approved } = useReviews();
  const { products, settings, appearance } = useStore();
  const h = appearance.hero;
  const frasesLetreiro = (h.letreiro || "").split(/[·|]/).map((t) => t.trim()).filter(Boolean);
  const nav = useNav();
  const avgAll = approved.length ? approved.reduce((a, r) => a + r.stars, 0) / approved.length : 0;
  // Produto do banner: o escolhido no painel ou o mais vendido em estoque
  const star = products.find((p) => p.id === h.produtoId) || products.find((p) => p.bestSeller && p.stock > 0) || products.find((p) => p.stock > 0) || products[0];
  const launch = products.find((p) => p.category === "protetor");
  const off = star && star.oldPrice ? Math.round((1 - star.price / star.oldPrice) * 100) : 0;
  const minPrice = products.length ? Math.min(...products.map((p) => p.price)) : 0;

  return (
    <section id="inicio" className="palette-light grain relative isolate overflow-hidden bg-banner text-white">
      {/* Fundo: grade, brilhos e luzes */}
      <div className="grid-lines pointer-events-none absolute inset-0 -z-10" />
      <div className="orb pointer-events-none absolute -left-40 -top-24 -z-10 h-[34rem] w-[34rem] rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="orb pointer-events-none absolute -right-24 top-1/3 -z-10 h-[28rem] w-[28rem] rounded-full bg-destaque/20 blur-3xl" style={{ animationDelay: "-6s" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-64 w-96 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-12 sm:px-6 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div className="page-in min-w-0">
          {h.selo === "auto" && launch && (
            <button
              onClick={() => nav.openPage(launch.id)}
              className="group inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pl-1 pr-4 text-xs font-semibold text-white/90 backdrop-blur transition hover:border-destaque/60 hover:bg-white/10"
            >
              <span className="rounded-full bg-destaque px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-destaque-fg">Novo</span>
              <span className="truncate">{launch.name} · {launch.variant.split("·")[0].trim()}</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </button>
          )}
          {h.selo && h.selo !== "auto" && (
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-destaque" /> {h.selo}
            </p>
          )}

          <h1 className="mt-7 font-serif text-[2.75rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            {h.titulo}{h.destaque && " "}
            {h.destaque && <em className="text-gradient pr-1">{h.destaque}</em>}
            {h.destaque && "."}
          </h1>
          {h.subtitulo && <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{h.subtitulo}</p>}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={onShop}
              className="btn-glow shine group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-destaque px-8 py-4 text-sm font-bold text-destaque-fg transition hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-4 w-4" />
              {h.botao || "Comprar agora"}
              {minPrice > 0 && <span className="max-[379px]:hidden">· a partir de {formatBRL(minPrice)}</span>}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => nav.openQuiz()}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4 text-destaque" /> Quiz: qual é o meu?
            </button>
          </div>
          <button onClick={onAbout} className="mt-4 text-xs font-semibold text-white/50 underline-offset-4 transition hover:text-white hover:underline">
            Conheça a história da Farmaura
          </button>

          {/* Prova social */}
          {h.mostrarNumeros && <div className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
            {[
              approved.length
                ? { n: `${fmtAvg(avgAll)}`, s: "★", l: `${approved.length} ${approved.length === 1 ? "avaliação" : "avaliações"}` }
                : { n: String(products.length), s: "", l: "produtos no catálogo" },
              { n: "100", s: "%", l: "Vegano e cruelty free" },
              { n: "-80", s: "%", l: "Plástico no refil" },
            ].map((s) => (
              <div key={s.l} className="px-4 py-4 sm:px-5">
                <p className="font-serif text-3xl leading-none text-white">
                  {s.n}<span className="text-destaque">{s.s}</span>
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-white/55 sm:text-xs">{s.l}</p>
              </div>
            ))}
          </div>}
        </div>

        {/* Composição do produto em destaque */}
        {star && (
          <div className="relative mx-auto mb-8 w-full max-w-md lg:mb-0 lg:max-w-none">
            <div className="absolute inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-destaque/40 via-emerald-400/20 to-transparent blur-2xl" />
            <button
              onClick={() => nav.openPage(star.id)}
              className="group block w-full overflow-hidden rounded-[2.5rem] ring-1 ring-white/15 shadow-2xl shadow-black/40"
              aria-label={`Ver ${star.name}`}
            >
              <SafeImage src={star.image} alt={star.name} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105" />
            </button>

            {/* Selo giratório de desconto */}
            {h.mostrarDesconto && off > 0 && (
              <div className="absolute -left-3 -top-5 flex h-28 w-28 items-center justify-center sm:-left-8 sm:h-32 sm:w-32" role="img" aria-label={`${off}% de desconto`}>
                <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full" aria-hidden="true">
                  <defs><path id="heroCircle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
                  <circle cx="50" cy="50" r="49" fill="#fcd34d" />
                  <text fontSize="9.5" fontWeight="700" letterSpacing="2.4" style={{ fill: "rgb(var(--banner))" }}>
                    <textPath href="#heroCircle">OFERTA · MAIS VENDIDO · OFERTA · MAIS VENDIDO ·</textPath>
                  </text>
                </svg>
                <span className="relative font-serif text-3xl leading-none text-banner sm:text-4xl">-{off}%</span>
              </div>
            )}

            {/* Cartão flutuante de preço */}
            {/* Posição fica no invólucro; a animação de flutuar fica no cartão (as duas usam "transform" e uma apagava a outra no celular) */}
            <div className="absolute inset-x-4 -bottom-10 sm:inset-x-auto sm:right-[-1.5rem] sm:w-72">
            <div className="float-soft rounded-3xl bg-white/95 p-4 text-[#1c1917] shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex items-center gap-3">
                <SafeImage src={star.image} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{star.badge}</p>
                  <p className="truncate font-semibold">{star.name}</p>
                  <p className="text-sm">
                    {star.oldPrice && <span className="mr-1.5 text-xs text-stone-500 line-through">{formatBRL(star.oldPrice)}</span>}
                    <b>{formatBRL(star.price)}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => nav.openPage(star.id)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-banner py-2.5 text-xs font-bold text-white transition hover:brightness-125"
              >
                Ver produto <ArrowRight className="h-3.5 w-3.5" />
              </button>
              {settings.pixDiscount > 0 && (
                <p className="mt-2 text-center text-[11px] font-semibold text-emerald-700">
                  ou {formatBRL(star.price * (1 - settings.pixDiscount / 100))} no PIX
                </p>
              )}
            </div>
            </div>

            <div className="absolute -right-2 top-8 hidden items-center gap-2.5 rounded-2xl bg-banner/80 px-3.5 py-2.5 ring-1 ring-white/15 backdrop-blur sm:flex lg:-right-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-destaque text-destaque-fg"><Award className="h-4 w-4" /></span>
              <span className="text-xs leading-tight"><b className="block text-white">Testado</b><span className="text-white/60">dermatologicamente</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Letreiro grande do banner (texto editável em Painel > Aparência > Topo e banner) */}
      {appearance.letreiros.banner && frasesLetreiro.length > 0 && (
        <div className="marquee-wrap relative border-y border-white/10 bg-black/15 py-5 backdrop-blur-sm">
          <p className="sr-only">{frasesLetreiro.join(", ")}</p>
          <div className="marquee marquee-lento" aria-hidden="true">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {frasesLetreiro.map((t, i) => (
                  <span key={i} className="flex items-center gap-8 px-8 font-serif text-4xl italic leading-none sm:text-6xl">
                    <span className={i % 2 ? "texto-vazado" : "text-white"}>{t}</span>
                    <Sparkles className="h-7 w-7 shrink-0 text-destaque sm:h-9 sm:w-9" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** Faixa de benefícios — letreiro em movimento */
const BENEFICIO_ICONES = [Leaf, Recycle, FlaskConical, Heart, Droplets, Sun];
export function BenefitsStrip() {
  const { appearance } = useStore();
  const items = appearance.beneficios.filter((t) => t.trim()).map((title, i) => ({ icon: BENEFICIO_ICONES[i % BENEFICIO_ICONES.length], title }));
  if (!items.length) return null;
  return (
    <section className="palette-light marquee-wrap relative overflow-hidden border-y border-banner/10 bg-destaque py-4 text-destaque-fg" aria-label={items.map((i) => i.title).join(", ")}>
      <div className="marquee marquee-fast" aria-hidden="true">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {items.map(({ icon: Icon, title }) => (
              <span key={title} className="flex items-center gap-3 px-7 font-serif text-xl italic sm:text-2xl">
                <Icon className="h-5 w-5" />
                {title}
                <Sparkles className="ml-7 h-4 w-4 opacity-60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Vitrine de linhas — três atalhos visuais para os catálogos */
export function CategoryShowcase({ onNavigate }) {
  const { products } = useStore();
  const lines = [
    { cat: "sabonete", id: "catalogo-sabonete", title: "Wayfarer", sub: "Sabonete em pó", tint: "from-banner/95", chip: "bg-destaque text-destaque-fg" },
    { cat: "protetor", id: "catalogo-protetor", title: "Aura Vital", sub: "Protetor solar FPS 67", tint: "from-[#0c4a6e]/95", chip: "bg-amber-300 text-banner" },
    { cat: "acessorios", id: "catalogo-acessorios", title: "Acessórios", sub: "Para a mochila e a praia", tint: "from-[#7c2d12]/90", chip: "bg-white text-[#1c1917]" },
  ]
    .map((l) => {
      const items = products.filter((p) => p.category === l.cat);
      return { ...l, n: items.length, img: (items.find((p) => p.bestSeller) || items[0] || {}).image, from: items.length ? Math.min(...items.map((p) => p.price)) : 0 };
    })
    .filter((l) => l.n > 0);
  if (!lines.length) return null;
  return (
    <section id="linhas" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-16 pt-20 sm:px-6 lg:px-8">
      <div data-reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Compre por linha</p>
          <h2 className="mt-2 font-serif text-4xl text-stone-900 sm:text-5xl">Escolha o seu ritual</h2>
        </div>
        <button onClick={() => onNavigate("produtos")} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-emerald-800 hover:underline sm:self-auto">
          Ver todos os {products.length} produtos <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {lines.map((l, i) => (
          <button
            key={l.id}
            data-reveal
            style={{ transitionDelay: `${i * 90}ms` }}
            onClick={() => onNavigate(l.id)}
            className="palette-light group bg-banner relative isolate flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-[2rem] p-6 text-left text-white shadow-xl shadow-black/10 md:min-h-[24rem]"
          >
            {l.img && <SafeImage src={l.img} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-110" />}
            <div className={`absolute inset-0 -z-10 bg-gradient-to-t ${l.tint} via-black/20 to-transparent`} />
            <span className={`absolute left-5 top-5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${l.chip}`}>
              {l.n} {l.n === 1 ? "produto" : "produtos"}
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{l.sub}</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <h3 className="font-serif text-4xl leading-none">{l.title}</h3>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-destaque-fg transition duration-300 group-hover:-rotate-45 group-hover:bg-destaque">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-2 text-sm text-white/85">a partir de <b className="text-white">{formatBRL(l.from)}</b></p>
          </button>
        ))}
      </div>
    </section>
  );
}
