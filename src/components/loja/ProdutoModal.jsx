import React, { useState } from "react";
import { CustomPreview, QtyControl, RatingLine, SafeImage } from "../ui";
import { CUSTOM_FONTS } from "../../data/catalogo";
import { useNav, useStore } from "../../lib/contextos";
import { ArrowRight, CheckCircle2, Clock, Heart, Leaf, PenLine, ShoppingBag, X } from "../../lib/icones";
import { formatBRL } from "../../lib/util";

/** Modal de detalhes do produto (ingredientes, modo de uso, benefícios) */
export function ProductModal({ product, onClose, onAdd, isFav, onToggleFav }) {
  const { customization } = useStore();
  const nav = useNav();
  const [tab, setTab] = useState("beneficios");
  const [qty, setQty] = useState(1);
  const custom = customization[product.id];
  const [wantsCustom, setWantsCustom] = useState(!!custom);
  const [customText, setCustomText] = useState("");
  const [customFont, setCustomFont] = useState(CUSTOM_FONTS[0].id);
  const [customColor, setCustomColor] = useState(custom ? custom.colors[0].id : null);
  const customOn = custom && wantsCustom && customText.trim().length > 0;
  const needsText = custom && wantsCustom && !customText.trim();
  const unitPrice = product.price + (customOn ? custom.fee : 0);
  const soldOut = product.stock <= 0;
  const maxQty = Math.max(1, Math.min(20, product.stock));

  if (!product) return null;

  const tabs = [
    { id: "beneficios", label: "Benefícios" },
    { id: "ingredientes", label: product.specsLabel || "Ingredientes" },
    { id: "uso", label: product.usageLabel || "Modo de Uso" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-page shadow-2xl sm:rounded-[2rem] md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-surface/90 p-2 text-stone-700 shadow hover:bg-surface"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className={`relative bg-gradient-to-br ${product.accent}`}>
          <SafeImage src={product.image} alt={product.name} className="h-64 w-full object-cover md:h-full" />
          <span className="absolute left-4 top-4 rounded-full bg-emerald-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            {product.badge}
          </span>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <RatingLine productId={product.id} />
          </div>
          <h3 className="mt-3 font-serif text-3xl text-stone-900">{product.name}</h3>
          <p className="text-sm font-medium text-emerald-800">{product.variant}</p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.description}</p>
          <button onClick={() => { onClose(); nav.openPage(product.id); }} className="mt-3 inline-flex items-center gap-1 self-start text-xs font-semibold text-emerald-800 hover:underline">
            Ver página completa, avaliações e QR Code <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {/* Abas de informação */}
          <div className="mt-6 flex gap-1 rounded-full bg-stone-200/70 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${
                  tab === t.id ? "bg-surface text-emerald-800 shadow-sm" : "text-stone-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 min-h-[170px] text-sm text-stone-700">
            {tab === "beneficios" && (
              <ul className="space-y-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {b}
                  </li>
                ))}
              </ul>
            )}
            {tab === "ingredientes" && (
              <ul className="space-y-2">
                {product.ingredients.map((i) => (
                  <li key={i} className="flex gap-2">
                    <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {i}
                  </li>
                ))}
              </ul>
            )}
            {tab === "uso" && (
              <ol className="space-y-3">
                {product.howToUse.map((s, idx) => (
                  <li key={s} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-6">
            <div>
              {product.oldPrice && <p className="text-sm text-stone-500 line-through">{formatBRL(product.oldPrice)}</p>}
              <p className="text-3xl font-bold text-stone-900">{formatBRL(product.price)}</p>
            </div>
            {!soldOut && <QtyControl qty={qty} onChange={setQty} max={maxQty} />}
          </div>
          {!soldOut && product.stock <= 10 && (
            <p className="mt-2 text-right text-xs font-semibold text-rose-700">
              {product.stock === 1 ? "Última unidade em estoque" : `Só ${product.stock} unidades em estoque`}
            </p>
          )}

          {/* Personalização com nome */}
          {custom && !soldOut && (
            <div className={`mt-4 rounded-2xl border p-4 transition ${wantsCustom ? "border-amber-400 bg-amber-50/70" : "border-stone-200 bg-surface"}`}>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  id="personalizar"
                  type="checkbox"
                  checked={wantsCustom}
                  onChange={(e) => setWantsCustom(e.target.checked)}
                  className="h-4 w-4 accent-emerald-700"
                />
                <span className="flex-1 text-sm font-semibold text-stone-900">
                  <PenLine className="mr-1.5 inline h-4 w-4 text-amber-700" />
                  {custom.label}
                </span>
                <span className="text-xs font-semibold text-amber-800">+ {formatBRL(custom.fee)}</span>
              </label>
              {wantsCustom && (
                <div className="mt-4 space-y-4">
                  <CustomPreview custom={custom} text={customText.trim()} font={customFont} color={customColor} />
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-700">Nome</span>
                      <span className="tabular-nums text-stone-500">{customText.length}/{custom.max}</span>
                    </div>
                    <input
                      id="texto-personalizado"
                      value={customText}
                      maxLength={custom.max}
                      onChange={(e) => setCustomText(e.target.value.replace(/[^\p{L}\p{N} .'-]/gu, ""))}
                      placeholder="Digite o nome"
                      className="w-full rounded-xl border border-stone-300 bg-surface px-4 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-stone-700">Letra</p>
                      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Estilo da letra">
                        {CUSTOM_FONTS.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            role="radio"
                            aria-checked={customFont === f.id}
                            onClick={() => setCustomFont(f.id)}
                            className={`flex flex-col items-center rounded-xl border px-2 py-2 transition ${
                              customFont === f.id ? "border-emerald-700 bg-surface ring-2 ring-emerald-700/15" : "border-stone-300 bg-surface/60 hover:border-stone-400"
                            }`}
                          >
                            <span className="text-lg leading-tight text-stone-900" style={f.style}>Aa</span>
                            <span className="text-[10px] font-semibold text-stone-500">{f.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-stone-700">Cor da linha</p>
                      <div className="flex gap-2" role="radiogroup" aria-label="Cor">
                        {custom.colors.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            role="radio"
                            aria-checked={customColor === c.id}
                            aria-label={c.label}
                            title={c.label}
                            onClick={() => setCustomColor(c.id)}
                            className={`h-10 w-10 rounded-full border-2 transition ${customColor === c.id ? "border-emerald-700 ring-2 ring-emerald-700/25 ring-offset-2 ring-offset-page" : "border-stone-300"}`}
                            style={{ background: c.hex }}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-[11px] text-stone-500">{(custom.colors.find((c) => c.id === customColor) || custom.colors[0]).label}</p>
                    </div>
                  </div>
                  <p className="flex items-start gap-1.5 text-[11px] text-stone-500">
                    <Clock className="mt-px h-3 w-3 shrink-0" /> Itens personalizados levam 2 dias úteis a mais e não podem ser trocados.
                  </p>
                </div>
              )}
            </div>
          )}

          {soldOut ? (
            <p className="mt-4 rounded-full border border-stone-300 py-4 text-center text-sm font-semibold text-stone-500">
              Produto esgotado no momento
            </p>
          ) : (
            <button
              disabled={needsText}
              onClick={() => {
                onAdd(product, qty, customOn ? { custom: customText.trim(), customStyle: { font: customFont, color: customColor } } : {});
                onClose();
              }}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-emerald-900 py-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {needsText ? "Digite o nome para continuar" : `Adicionar ao Carrinho · ${formatBRL(unitPrice * qty)}`}
            </button>
          )}
          {custom && wantsCustom && !soldOut && (
            <button type="button" onClick={() => setWantsCustom(false)} className="mt-2 text-center text-xs font-semibold text-stone-500 hover:text-stone-800">
              Comprar sem personalização
            </button>
          )}
          <button
            onClick={() => onToggleFav(product.id)}
            className="mt-2 flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold text-stone-600 transition hover:text-rose-600"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-rose-600 text-rose-600" : ""}`} />
            {isFav ? "Nos seus favoritos" : "Adicionar aos favoritos"}
          </button>
        </div>
      </div>
    </div>
  );
}
