import React, { useEffect, useState } from "react";
import { Field, PixPayment, QtyControl, SafeImage } from "../ui";
import { BRAZIL_STATES, PAYMENT_METHODS, customStyleText } from "../../data/catalogo";
import { couponLabel } from "../../data/loja";
import { useStore } from "../../lib/contextos";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Gift, LayoutDashboard, PenLine, Plus, QrCode, ShieldCheck, ShoppingBag, Tag, Trash2, Truck, X } from "../../lib/icones";
import { buscarCEP, prazoTexto } from "../../lib/frete";
import { EMPTY_FORM, calcTotals, formatBRL, maskCEP, maskCard, maskExpiry, maskPhone, numBR, onlyDigits, validateCheckout } from "../../lib/util";

export function CartDrawer({ open, onClose, cart, updateQty, removeItem, onPlaceOrder, notify, onAdd, profile }) {
  const [step, setStep] = useState("cart");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const store = useStore();
  const { settings } = store;
  const totals = calcTotals(cart, step === "checkout" ? form.payment : null, coupon, step === "checkout" && form.gift, store, step === "checkout" ? form.state : "");
  const [cepStatus, setCepStatus] = useState({ state: "idle", msg: "" });
  /** Ao completar o CEP, busca o endereço no ViaCEP e preenche rua, bairro, cidade e UF */
  const onCep = async (v) => {
    const masked = maskCEP(v);
    set("zip", masked);
    if (onlyDigits(masked).length !== 8) { setCepStatus({ state: "idle", msg: "" }); return; }
    setCepStatus({ state: "loading", msg: "Buscando endereço…" });
    try {
      const a = await buscarCEP(masked);
      setForm((f) => ({ ...f, street: a.street || f.street, district: a.district || f.district, city: a.city || f.city, state: a.state || f.state }));
      setErrors((er) => ({ ...er, zip: undefined, street: a.street ? undefined : er.street, district: a.district ? undefined : er.district, city: undefined, state: undefined }));
      setCepStatus({ state: "ok", msg: `${a.city} · ${a.state}` });
    } catch (e) {
      setCepStatus({ state: "error", msg: e.message });
    }
  };
  const blocked = cart.filter((i) => i.issue);

  const applyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return setCouponError("Digite um código.");
    const c = store.coupons.find((x) => x.code === code);
    if (!c || !c.active) return setCouponError("Cupom inválido ou expirado.");
    if (totals.subtotal < (c.minOrder || 0)) {
      return setCouponError(`Este cupom vale para compras acima de ${formatBRL(c.minOrder)}.`);
    }
    setCoupon(code);
    setCouponInput("");
    setCouponError("");
    notify(`Cupom ${code} aplicado: ${couponLabel(c)}`);
  };
  const remainingForFreeShipping = Math.max(0, settings.freeShipping - totals.subtotal);
  /** Sugestões de acessórios que ainda não estão no carrinho */
  const suggestions = store.products.filter((p) => p.category === "acessorios" && p.stock > 0 && !store.customization[p.id] && !cart.some((i) => i.id === p.id))
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

  // Ao fechar o drawer depois de um pedido concluído, volta para a etapa inicial
  useEffect(() => {
    if (!open && step === "success") {
      setStep("cart");
      setPlacedOrder(null);
    }
  }, [open, step]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  // Quem tem cadastro já entra no checkout com os dados preenchidos
  useEffect(() => {
    if (step !== "checkout" || !profile) return;
    setForm((f) => {
      if (f.name || f.email) return f;
      const a = profile.address || {};
      return {
        ...f, name: profile.name, email: profile.email, phone: profile.phone,
        zip: a.zip || "", street: a.street || "", number: a.number || "", district: a.district || "", city: a.city || "", state: a.state || "",
      };
    });
  }, [step, profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateCheckout(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    // Simula o tempo de processamento do pagamento
    setTimeout(() => {
      Promise.resolve(onPlaceOrder(form, totals)).then((order) => {
        setSubmitting(false);
        if (!order) return;
        setPlacedOrder(order);
        setForm(EMPTY_FORM);
        setCoupon(null);
        setStep("success");
      });
    }, 600);
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* Painel lateral */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-page shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Carrinho de compras"
      >
        {/* Cabeçalho do drawer */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div className="flex items-center gap-3">
            {step === "checkout" && (
              <button onClick={() => setStep("cart")} className="rounded-full p-1.5 hover:bg-stone-200" aria-label="Voltar">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="font-serif text-2xl text-stone-900">
              {step === "cart" && "Seu Carrinho"}
              {step === "checkout" && "Finalizar Compra"}
              {step === "success" && "Pedido Confirmado"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-stone-200" aria-label="Fechar carrinho">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---------- ETAPA 1: ITENS DO CARRINHO ---------- */}
        {step === "cart" && (
          <>
            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <ShoppingBag className="h-9 w-9 text-emerald-800" />
                </div>
                <p className="mt-5 font-serif text-xl text-stone-900">Seu carrinho está vazio</p>
                <p className="mt-1 text-sm text-stone-500">Descubra nossos produtos e comece seu ritual.</p>
                <button onClick={onClose} className="mt-6 rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white">
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <>
                {/* Barra de progresso do frete grátis */}
                <div className="border-b border-stone-200 bg-surface px-6 py-4">
                  <p className="text-xs text-stone-600">
                    {remainingForFreeShipping > 0 ? (
                      <>Faltam <b className="text-emerald-800">{formatBRL(remainingForFreeShipping)}</b> para o frete grátis!</>
                    ) : (
                      <span className="font-semibold text-emerald-800">🎉 Você ganhou frete grátis!</span>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                      style={{ width: `${settings.freeShipping ? Math.min(100, (totals.subtotal / settings.freeShipping) * 100) : 100}%` }}
                    />
                  </div>
                </div>

                <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  {cart.map((item) => (
                    <li key={item.lineId} className={`flex gap-4 rounded-2xl border bg-surface p-3 ${item.issue ? "border-rose-300" : "border-stone-200"}`}>
                      <SafeImage src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-stone-900">{item.name}</p>
                            <p className="truncate text-xs text-stone-500">{item.variant}</p>
                            {item.custom && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-amber-800">
                                <PenLine className="h-3 w-3 shrink-0" /> “{item.custom}”
                                {customStyleText(item) && <span className="font-normal text-stone-500">· {customStyleText(item)}</span>}
                              </p>
                            )}
                            {item.issue && (
                              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                                <AlertTriangle className="h-3 w-3 shrink-0" /> {item.issue}
                              </p>
                            )}
                          </div>
                          <button onClick={() => removeItem(item.lineId)} className="text-stone-400 hover:text-rose-600" aria-label="Remover item">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <QtyControl qty={item.qty} onChange={(q) => updateQty(item.lineId, q)} max={Math.max(1, Math.min(20, item.stock ?? 20))} />
                          <p className="text-sm font-bold text-stone-900">{formatBRL(item.price * item.qty)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                  {suggestions.length > 0 && (
                    <li className="pt-2">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                        {remainingForFreeShipping > 0 ? "Complete o frete grátis" : "Leve também"}
                      </p>
                      <div className="space-y-2">
                        {suggestions.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-dashed border-stone-300 p-2">
                            <SafeImage src={p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-stone-900">{p.name}</p>
                              <p className="text-xs text-stone-500">{formatBRL(p.price)}</p>
                            </div>
                            <button
                              onClick={() => onAdd(p)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-white transition hover:brightness-110"
                              aria-label={`Adicionar ${p.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </li>
                  )}
                </ul>

                <div className="border-t border-stone-200 bg-surface px-6 py-5">
                  {/* Cupom de desconto */}
                  {coupon ? (
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-700/30 bg-emerald-50 px-3 py-2.5 text-xs">
                      <span className="flex items-center gap-2 font-semibold text-emerald-800">
                        <Tag className="h-3.5 w-3.5" /> {coupon}
                        {totals.couponInfo && <span className="font-normal">· {couponLabel(totals.couponInfo)}</span>}
                      </span>
                      <button onClick={() => setCoupon(null)} className="font-semibold text-stone-500 hover:text-rose-600">
                        Remover
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={applyCoupon} className="mb-4">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                          <input
                            id="cupom"
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                            placeholder="Cupom de desconto"
                            className="w-full rounded-xl border border-stone-300 bg-page py-2.5 pl-8 pr-3 text-xs font-semibold uppercase tracking-wider outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                          />
                        </div>
                        <button className="rounded-xl bg-ink px-4 text-xs font-semibold text-ink-fg transition hover:opacity-90">Aplicar</button>
                      </div>
                      <p className={`mt-1.5 text-[11px] ${couponError ? "font-medium text-rose-600" : "text-stone-500"}`}>
                        {couponError || <>Primeira compra? Use <b className="text-emerald-800">BEMVINDO10</b>.</>}
                      </p>
                    </form>
                  )}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal</span><span>{formatBRL(totals.subtotal)}</span>
                    </div>
                    {totals.couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Cupom {totals.coupon}</span><span>- {formatBRL(totals.couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Frete</span>
                      <span>{totals.shipping === 0 ? <b className="text-emerald-700">Grátis</b> : formatBRL(totals.shipping)}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-base font-bold text-stone-900">
                      <span>Total</span><span>{formatBRL(totals.total)}</span>
                    </div>
                  </div>
                  {coupon && totals.couponIssue && (
                    <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      {totals.couponIssue === "min"
                        ? `O cupom ${coupon} vale acima de ${formatBRL(totals.couponInfo.minOrder)}. Faltam ${formatBRL(totals.couponInfo.minOrder - totals.subtotal)}.`
                        : `O cupom ${coupon} não está mais disponível.`}
                    </p>
                  )}
                  {blocked.length > 0 && (
                    <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                      Ajuste os itens marcados em vermelho para continuar.
                    </p>
                  )}
                  <button
                    onClick={() => setStep("checkout")}
                    disabled={blocked.length > 0}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 py-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Ir para o Checkout <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- ETAPA 2: FORMULÁRIO DE CHECKOUT ---------- */}
        {step === "checkout" && (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden" noValidate>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <fieldset className="space-y-3">
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">1 · Dados Pessoais</legend>
                <Field label="Nome Completo" value={form.name} onChange={(v) => set("name", v)} error={errors.name} placeholder="Maria da Silva" />
                <Field label="E-mail" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} placeholder="maria@email.com" />
                <Field label="Telefone / WhatsApp" inputMode="tel" value={form.phone} onChange={(v) => set("phone", maskPhone(v))} error={errors.phone} placeholder="(11) 99999-9999" />
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">2 · Endereço de Entrega</legend>
                <div>
                  <Field label="CEP" inputMode="numeric" value={form.zip} onChange={onCep} error={errors.zip} placeholder="00000-000" />
                  <p className={`mt-1 text-[11px] ${cepStatus.state === "error" ? "text-rose-700" : "text-stone-500"}`} role="status" aria-live="polite">
                    {cepStatus.msg || "Digite o CEP e a gente preenche o endereço."}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field className="col-span-2" label="Rua" value={form.street} onChange={(v) => set("street", v)} error={errors.street} placeholder="Rua das Flores" />
                  <Field label="Número" value={form.number} onChange={(v) => set("number", v)} error={errors.number} placeholder="123" />
                </div>
                <Field label="Bairro" value={form.district} onChange={(v) => set("district", v)} error={errors.district} placeholder="Centro" />
                <div className="grid grid-cols-3 gap-3">
                  <Field className="col-span-2" label="Cidade" value={form.city} onChange={(v) => set("city", v)} error={errors.city} placeholder="São Paulo" />
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-stone-700">Estado</span>
                    <select
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      className={`w-full rounded-xl border bg-page px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-700/15 ${
                        errors.state ? "border-rose-400" : "border-stone-300 focus:border-emerald-700"
                      }`}
                    >
                      <option value="">UF</option>
                      {BRAZIL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <span className="mt-1 block text-[11px] font-medium text-rose-600">{errors.state}</span>}
                  </label>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">3 · Forma de Pagamento</legend>
                {PAYMENT_METHODS.map(({ id, label, icon: Icon, hint }) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                      form.payment === id ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-700/15" : "border-stone-300 bg-surface hover:border-stone-400"
                    }`}
                  >
                    <input type="radio" name="payment" value={id} checked={form.payment === id} onChange={() => set("payment", id)} className="sr-only" />
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${form.payment === id ? "bg-emerald-900 text-white" : "bg-stone-100 text-stone-600"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-900">{label}</p>
                      <p className="text-xs text-stone-500">{id === "PIX" ? (settings.pixDiscount ? `${numBR(settings.pixDiscount)}% de desconto · aprovação imediata` : "Aprovação imediata") : hint}</p>
                    </div>
                    <span className={`h-4 w-4 rounded-full border-2 ${form.payment === id ? "border-emerald-800 bg-emerald-800 ring-2 ring-white ring-inset" : "border-stone-300"}`} />
                  </label>
                ))}

                {/* Campos extras para cartão (simulação — dados não são armazenados) */}
                {form.payment === "PIX" && (
                  <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
                    <QrCode className="mt-px h-4 w-4 shrink-0" />
                    Ao confirmar, mostramos o QR Code e o código PIX copia e cola com o valor exato do pedido.
                  </p>
                )}
                {form.payment === "Cartão de Crédito" && (
                  <div className="space-y-3 rounded-2xl border border-stone-200 bg-surface p-4">
                    <Field label="Número do Cartão" inputMode="numeric" value={form.cardNumber} onChange={(v) => set("cardNumber", maskCard(v))} error={errors.cardNumber} placeholder="0000 0000 0000 0000" />
                    <Field label="Nome impresso no cartão" value={form.cardName} onChange={(v) => set("cardName", v.toUpperCase())} error={errors.cardName} placeholder="MARIA D SILVA" />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Validade" inputMode="numeric" value={form.cardExpiry} onChange={(v) => set("cardExpiry", maskExpiry(v))} error={errors.cardExpiry} placeholder="MM/AA" />
                      <Field label="CVV" inputMode="numeric" maxLength={4} value={form.cardCvv} onChange={(v) => set("cardCvv", onlyDigits(v).slice(0, 4))} error={errors.cardCvv} placeholder="123" />
                    </div>
                    <p className="flex items-center gap-1.5 text-[11px] text-stone-500">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" /> Ambiente simulado: os dados do cartão não são salvos.
                    </p>
                  </div>
                )}
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">4 · É para presente?</legend>
                <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                  form.gift ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-700/15" : "border-stone-300 bg-surface hover:border-stone-400"
                }`}>
                  <input id="presente" type="checkbox" checked={form.gift} onChange={(e) => set("gift", e.target.checked)} className="h-4 w-4 accent-emerald-700" />
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${form.gift ? "bg-emerald-900 text-white" : "bg-stone-100 text-stone-600"}`}>
                    <Gift className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900">Embalagem para presente</p>
                    <p className="text-xs text-stone-500">Caixa kraft, laço e cartão escrito à mão · + {formatBRL(settings.giftFee)}</p>
                  </div>
                </label>
                {form.gift && (
                  <label className="block">
                    <span className="mb-1.5 flex justify-between text-xs font-semibold text-stone-700">
                      Mensagem do cartão <span className="font-normal tabular-nums text-stone-500">{form.giftMessage.length}/140</span>
                    </span>
                    <textarea
                      id="mensagem-presente"
                      rows={3}
                      maxLength={140}
                      value={form.giftMessage}
                      onChange={(e) => set("giftMessage", e.target.value)}
                      placeholder="Feliz aniversário! Boas aventuras."
                      className="w-full rounded-xl border border-stone-300 bg-page px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    />
                  </label>
                )}
              </fieldset>
            </div>

            {/* Resumo e confirmação */}
            <div className="border-t border-stone-200 bg-surface px-6 py-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({cart.reduce((a, i) => a + i.qty, 0)} itens)</span><span>{formatBRL(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>
                    Frete{form.state && totals.frete?.regiao ? ` · ${totals.frete.regiao.label}` : ""}
                    {form.state && <span className="block text-[11px] text-stone-400">Entrega em {prazoTexto(totals.frete)} após o pagamento</span>}
                  </span>
                  <span>{totals.shipping === 0 ? <b className="text-emerald-700">Grátis</b> : formatBRL(totals.shipping)}</span>
                </div>
                {totals.giftFee > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Embalagem para presente</span><span>{formatBRL(totals.giftFee)}</span>
                  </div>
                )}
                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Cupom {totals.coupon}</span><span>- {formatBRL(totals.couponDiscount)}</span>
                  </div>
                )}
                {totals.pixDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Desconto PIX ({numBR(settings.pixDiscount)}%)</span><span>- {formatBRL(totals.pixDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-base font-bold text-stone-900">
                  <span>Total</span><span>{formatBRL(totals.total)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 py-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Processando pagamento...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Confirmar Pedido · {formatBRL(totals.total)}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ---------- ETAPA 3: SUCESSO ---------- */}
        {step === "success" && placedOrder && (
          <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-700" />
            </div>
            <h3 className="mt-5 font-serif text-3xl text-stone-900">Obrigado, {placedOrder.customer.name.split(" ")[0]}!</h3>
            <p className="mt-2 text-sm text-stone-600">
              Seu pedido <b className="text-emerald-800">{placedOrder.id}</b> foi realizado com sucesso. Enviamos a confirmação para{" "}
              <b>{placedOrder.customer.email}</b>.
            </p>

            {placedOrder.payment === "PIX" && <PixPayment order={placedOrder} notify={notify} />}
            <div className="mt-4 w-full shrink-0 space-y-3 rounded-2xl border border-stone-200 bg-surface p-5 text-left text-sm">
              {placedOrder.items.map((i) => (
                <div key={i.lineId || i.id} className="flex justify-between gap-3 text-stone-700">
                  <span>
                    {i.qty}× {i.name}{i.custom ? ` · “${i.custom}”` : ""}
                    {customStyleText(i) && <span className="block text-xs text-stone-500">{customStyleText(i)}</span>}
                  </span>
                  <span className="shrink-0">{formatBRL(i.price * i.qty)}</span>
                </div>
              ))}
              {placedOrder.gift && (
                <div className="flex justify-between text-stone-700">
                  <span>Embalagem para presente</span><span>{formatBRL(placedOrder.giftFee ?? settings.giftFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-stone-200 pt-3 font-bold text-stone-900">
                <span>Total ({placedOrder.payment})</span><span>{formatBRL(placedOrder.total)}</span>
              </div>
            </div>

            {placedOrder.payment === "Boleto" && (
              <p className="mt-4 w-full rounded-2xl bg-amber-50 p-4 text-left text-xs text-amber-800">
                O boleto (simulado) foi enviado ao seu e-mail e vence em 3 dias úteis.
              </p>
            )}

            <p className="mt-6 flex items-center gap-2 text-xs text-stone-500">
              <LayoutDashboard className="h-3.5 w-3.5" /> Pedido registrado automaticamente no Painel Admin.
            </p>
            <p className="mt-2 flex items-center gap-2 text-xs text-stone-500">
              <Truck className="h-3.5 w-3.5" /> Acompanhe a entrega em “Rastrear” com o número {placedOrder.id}.
            </p>
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-ink py-4 text-sm font-semibold text-ink-fg hover:opacity-90">
              Continuar Comprando
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
