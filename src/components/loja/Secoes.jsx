import React, { useEffect, useState } from "react";
import { Field, Logo, PixPayment, QRCodeSvg, SafeImage, StatusBadge } from "../ui";
import { ORDER_STATUS, QUIZ, recommend } from "../../data/catalogo";
import { IMAGES } from "../../data/imagens";
import { useCloud, useStore } from "../../lib/contextos";
import { Instagram, ArrowLeft, CheckCircle2, ChevronDown, FlaskConical, Gift, Heart, HelpCircle, Leaf, Mail, MapPin, MessageCircle, Package, Phone, QrCode, Recycle, RotateCcw, Search, ShieldCheck, Truck } from "../../lib/icones";
import { safeUrl, whatsappUrl } from "../../lib/aparencia";
import { PUBLIC_SITE_URL, downloadQR, DONATION_PRESETS, buildFaq, formatBRL, formatDateTime, normalize, pixText, round2 } from "../../lib/util";

export function DonationSection({ onDonate, notify }) {
  const { settings } = useStore();
  const [preset, setPreset] = useState(20);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [donation, setDonation] = useState(null);
  const cardRef = React.useRef(null);
  // Leva o QR Code para a tela (no celular ele fica abaixo do texto)
  useEffect(() => {
    if (donation && cardRef.current) cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [donation]);

  const amount = custom.trim() ? parseFloat(custom.replace(/\./g, "").replace(",", ".")) : preset;

  const submit = async (e) => {
    e.preventDefault();
    if (!(amount >= 1)) return setError("Digite um valor a partir de R$ 1,00.");
    if (amount > 10000) return setError("Para valores acima de R$ 10.000, fale com a gente pelo contato.");
    setError("");
    const d = await onDonate({ amount: round2(amount), name: name.trim(), message: message.trim() });
    if (d) setDonation(d);
  };

  const reset = () => {
    setDonation(null);
    setCustom("");
    setMessage("");
  };

  return (
    <section id="doar" className="scroll-mt-28 border-y border-stone-200 bg-gradient-to-br from-emerald-50 via-page to-amber-50">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8">
        <div className="lg:sticky lg:top-40">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Catálogo · Doação</p>
          <h2 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
            Apoie o projeto <em className="text-emerald-800">Farmaura</em>
          </h2>
          <p className="mt-4 max-w-md text-stone-600">
            Gostou da ideia e quer ajudar a Farmaura a crescer? Você escolhe quanto quer doar e paga direto no PIX.
            Não precisa comprar nada, não tem frete e não pedimos endereço.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-stone-700">
            {[
              { icon: Heart, t: "Você escolhe o valor, a partir de R$ 1" },
              { icon: QrCode, t: "Paga na hora com QR Code ou PIX Copia e Cola" },
              { icon: Truck, t: "Sem frete e sem taxa extra" },
              { icon: ShieldCheck, t: "Só pedimos o seu nome se você quiser" },
            ].map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-emerald-800 shadow-sm ring-1 ring-stone-200">
                  <Icon className="h-4 w-4" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div ref={cardRef} className="scroll-mt-32 rounded-[2rem] border border-stone-200 bg-surface p-6 shadow-xl shadow-black/5 sm:p-8">
          {donation ? (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
                <Heart className="h-8 w-8 fill-rose-500 text-rose-500" />
              </div>
              <h3 className="mt-4 font-serif text-3xl text-stone-900">
                Obrigado{donation.name ? `, ${donation.name.split(" ")[0]}` : ""}!
              </h3>
              <p className="mt-2 text-sm text-stone-600">Falta só pagar o PIX de <b>{formatBRL(donation.amount)}</b> no app do seu banco.</p>
              <PixPayment
                order={{ id: donation.id, total: donation.amount }}
                notify={notify}
                title="Doação via PIX"
                note="A doação vai direto para a conta da Farmaura. Muito obrigado pelo apoio!"
              />
              <button onClick={reset} className="mt-5 text-sm font-semibold text-emerald-800 hover:underline">
                Fazer outra doação
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5" noValidate>
              <div>
                <p className="text-sm font-semibold text-stone-900">Quanto você quer doar?</p>
                <div className="mt-3 grid grid-cols-4 gap-2" role="radiogroup" aria-label="Valor sugerido">
                  {DONATION_PRESETS.map((v) => {
                    const on = !custom.trim() && preset === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => { setPreset(v); setCustom(""); setError(""); }}
                        className={`rounded-2xl border py-3 text-sm font-bold tabular-nums transition ${
                          on ? "border-emerald-700 bg-emerald-900 text-white shadow-md" : "border-stone-300 text-stone-800 hover:border-stone-500"
                        }`}
                      >
                        R$ {v}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-stone-700">Ou digite outro valor</span>
                <div className={`flex items-center rounded-xl border bg-page transition focus-within:ring-2 ${
                  error ? "border-rose-400 focus-within:ring-rose-500/15" : custom.trim() ? "border-emerald-700 focus-within:ring-emerald-700/15" : "border-stone-300 focus-within:border-emerald-700 focus-within:ring-emerald-700/15"
                }`}>
                  <span className="pl-4 text-sm font-semibold text-stone-500">R$</span>
                  <input
                    id="doacao-valor"
                    inputMode="decimal"
                    value={custom}
                    onChange={(e) => { setCustom(e.target.value.replace(/[^\d.,]/g, "")); setError(""); }}
                    placeholder="0,00"
                    className="w-full bg-transparent px-3 py-3 text-lg font-bold tabular-nums text-stone-900 outline-none placeholder:font-normal placeholder:text-stone-400"
                  />
                </div>
                {error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
              </label>
              <Field label="Seu nome (opcional)" name="doacao-nome" autoComplete="name" value={name} onChange={setName} maxLength={40} placeholder="Deixe vazio para doar anonimamente" />
              <label className="block">
                <span className="mb-1.5 flex justify-between text-xs font-semibold text-stone-700">
                  Recado (opcional) <span className="font-normal tabular-nums text-stone-500">{message.length}/140</span>
                </span>
                <textarea
                  id="doacao-recado"
                  rows={2}
                  maxLength={140}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Deixe uma mensagem de apoio"
                  className="w-full rounded-xl border border-stone-300 bg-page px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <div className="rounded-2xl bg-stone-50 p-4 text-sm">
                <div className="flex justify-between text-stone-600"><span>Doação</span><span className="tabular-nums">{amount >= 1 ? formatBRL(amount) : "—"}</span></div>
                <div className="flex justify-between text-stone-600"><span>Frete</span><span className="font-semibold text-emerald-700">Sem frete</span></div>
                <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-stone-900">
                  <span>Total</span><span className="tabular-nums">{amount >= 1 ? formatBRL(amount) : "—"}</span>
                </div>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:brightness-110">
                <Heart className="h-4 w-4" /> {amount >= 1 ? `Doar ${formatBRL(amount)} com PIX` : "Doar com PIX"}
              </button>
              <p className="text-center text-[11px] text-stone-500">
                Recebedor: {pixText(settings.pixName, 25)} · o QR Code aparece na próxima tela
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function QuizSection({ onOpenPage, onAdd }) {
  const { products, customization } = useStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const done = step >= QUIZ.length;
  const results = done ? recommend(answers, products, customization) : [];
  const pick = (qid, oid) => { setAnswers((a) => ({ ...a, [qid]: oid })); setStep((s) => s + 1); };
  const restart = () => { setAnswers({}); setStep(0); };

  return (
    <section id="quiz" className="scroll-mt-28 bg-page">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Quiz</p>
          <h2 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Descubra o produto ideal</h2>
          <p className="mt-3 text-stone-600">Três perguntas rápidas e a gente indica o que combina com você.</p>
        </div>
        <div data-reveal className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-stone-200 bg-surface p-6 shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-700/10 sm:p-8">
          <div className="flex gap-2" aria-hidden="true">
            {QUIZ.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition ${i < step ? "bg-emerald-700" : "bg-stone-200"}`} />)}
          </div>
          {!done ? (
            <div key={step} className="page-in mt-6">
              <p className="text-xs font-semibold text-stone-500">Pergunta {step + 1} de {QUIZ.length}</p>
              <h3 className="mt-1 font-serif text-2xl text-stone-900">{QUIZ[step].q}</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {QUIZ[step].opts.map((o) => {
                  const Icon = o.icon;
                  return (
                    <button
                      key={o.id}
                      onClick={() => pick(QUIZ[step].id, o.id)}
                      className="flex items-center gap-3 rounded-2xl border border-stone-300 p-4 text-left text-sm font-semibold text-stone-800 transition hover:-translate-y-0.5 hover:border-emerald-700 hover:bg-emerald-50"
                    >
                      {Icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"><Icon className="h-5 w-5" /></span>}
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800">
                  <ArrowLeft className="h-3.5 w-3.5" /> Voltar
                </button>
              )}
            </div>
          ) : (
            <div className="page-in mt-6">
              <h3 className="font-serif text-2xl text-stone-900">{results.length ? "Recomendados para você" : "Nenhum produto combinou com tudo"}</h3>
              {results.length ? (
                <div className="mt-5 space-y-3">
                  {results.map(({ p, why }, i) => (
                    <div key={p.id} className="flex flex-col gap-4 rounded-2xl border border-stone-200 p-4 sm:flex-row sm:items-center">
                      <SafeImage src={p.image} alt={p.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{i === 0 ? "Melhor escolha" : "Também combina"}</p>
                        <p className="font-semibold text-stone-900">{p.name} · {formatBRL(p.price)}</p>
                        <p className="text-xs text-stone-500">Porque {why.join(", ")}.</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onOpenPage(p.id)} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:border-stone-500">Ver produto</button>
                        <button onClick={() => onAdd(p)} className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:brightness-110">Adicionar</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-600">Tente outra combinação de respostas ou veja o catálogo completo.</p>
              )}
              <button onClick={restart} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:underline">
                <RotateCcw className="h-4 w-4" /> Refazer o quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * SUSTENTABILIDADE (só fatos dos próprios produtos, sem certificações)
 * ------------------------------------------------------------------------- */
export function SustainabilitySection() {
  const cards = [
    {
      icon: Package,
      title: "Embalagens",
      items: [
        "O Refil de 100 g serve para reabastecer em casa, sem precisar de um kit novo a cada compra.",
        "O Kit Viagem tem sachês de dose única: você leva e usa só o que precisa.",
        "A embalagem para presente só é usada quando você escolhe no checkout.",
      ],
    },
    {
      icon: Leaf,
      title: "Formato em pó",
      items: [
        "O sabonete Wayfarer é em pó e concentrado: a fórmula não leva água.",
        "Por isso a embalagem é menor e mais leve para transportar.",
        "Sem líquido, ele não vaza na mala nem na mochila.",
      ],
    },
    {
      icon: Recycle,
      title: "Descarte adequado",
      items: [
        "Embalagem do refil e sachês: esvazie, limpe e confira o símbolo de reciclagem impresso para separar.",
        "Caixa do Kit Viagem: separe com o papel e o papelão.",
        "Frasco do Aura Vital: descarte vazio, conferindo o símbolo de reciclagem.",
      ],
    },
    {
      icon: Heart,
      title: "Cuidados no dia a dia",
      items: [
        "Use cerca de meia colher de chá por banho: a dose certa evita desperdício.",
        "Feche bem a embalagem para o pó não empedrar com a umidade.",
        "Reutilize a eco bag e a toalha de microfibra no lugar de itens descartáveis.",
      ],
    },
  ];
  return (
    <section id="sustentabilidade" className="scroll-mt-28 border-y border-stone-200 bg-gradient-to-b from-emerald-50/70 to-page">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Sustentabilidade</p>
          <h2 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Menos embalagem, mais cuidado</h2>
          <p className="mt-4 text-stone-600">Como os produtos da Farmaura foram pensados para gerar menos resíduo, e o que fazer com cada embalagem depois do uso.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, title, items }) => (
            <article key={title} data-reveal className="card-lift rounded-[1.5rem] border border-stone-200 bg-surface p-6 hover:border-emerald-700/40 hover:shadow-xl hover:shadow-emerald-900/10">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900 text-white"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-4 font-serif text-xl text-stone-900">{title}</h3>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-stone-600">
                {items.map((t) => <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {t}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Seção Sobre Nós */
export function AboutSection() {
  const { sobre } = useStore().appearance;
  return (
    <section id="sobre" className="palette-light scroll-mt-28 bg-emerald-950 text-emerald-50">
      <div data-reveal className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-[2rem]">
          <SafeImage src={IMAGES.about} alt="Ingredientes naturais da Farmaura" className="aspect-[4/3] w-full object-cover" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Sobre Nós</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl">
            {sobre.titulo}{sobre.destaque && <> <em className="text-amber-200">{sobre.destaque}</em>.</>}
          </h2>
          {sobre.texto && <p className="mt-6 whitespace-pre-line leading-relaxed text-emerald-100/80">{sobre.texto}</p>}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: FlaskConical, t: "Pesquisa", d: "Ativos validados em laboratório" },
              { icon: Leaf, t: "Natureza", d: "Extratos botânicos brasileiros" },
              { icon: Recycle, t: "Futuro", d: "Meta lixo zero até 2030" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Icon className="h-5 w-5 text-emerald-300" />
                <p className="mt-3 font-semibold text-white">{t}</p>
                <p className="text-xs text-emerald-100/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Seção de Contato (formulário simulado) */
/** E-mail, WhatsApp, endereço e Instagram (Painel > Aparência > Contato) */
function ContactLinks({ contato }) {
  const wa = whatsappUrl(contato.whatsapp, "Olá, Farmaura! Vim pelo site.");
  const ig = safeUrl(contato.instagram);
  const items = [
    contato.email && { icon: Mail, l: contato.email, href: `mailto:${contato.email}` },
    contato.telefone && { icon: Phone, l: `${contato.telefone}${wa ? " · WhatsApp" : ""}`, href: wa || `tel:${contato.telefone.replace(/\D/g, "")}` },
    contato.endereco && { icon: MapPin, l: contato.endereco, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contato.endereco)}` },
    ig && { icon: Instagram, l: "Instagram", href: ig },
  ].filter(Boolean);
  return (
    <ul className="mt-8 space-y-3">
      {items.map(({ icon: Icon, l, href }) => (
        <li key={l}>
          <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group inline-flex items-center gap-3 text-stone-700 hover:text-emerald-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-100"><Icon className="h-4 w-4" /></span>
            <span className="text-sm underline-offset-4 group-hover:underline">{l}</span>
          </a>
        </li>
      ))}
      {wa && (
        <li className="pt-2">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-bold text-[#073b1c] shadow-lg shadow-black/10 transition hover:-translate-y-0.5">
            <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
          </a>
        </li>
      )}
    </ul>
  );
}

export function ContactSection({ notify, onSend, profile }) {
  const { contato } = useStore().appearance;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (profile) setForm((f) => (f.name || f.email ? f : { ...f, name: profile.name, email: profile.email }));
  }, [profile]);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return notify("Preencha todos os campos do contato.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return notify("Digite um e-mail válido.", "error");
    setSending(true);
    const ok = await onSend({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim() });
    setSending(false);
    if (!ok) return;
    notify("Mensagem enviada! Responderemos em até 24h.");
    setForm((f) => ({ ...f, message: "" }));
  };
  return (
    <section id="contato" className="scroll-mt-28 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Contato</p>
          <h2 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Fale com a gente</h2>
          <p className="mt-4 max-w-md text-stone-600">
            Dúvidas sobre produtos, pedidos ou parcerias? Nossa equipe de especialistas está pronta para ajudar.
          </p>
          <ContactLinks contato={contato} />
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-[2rem] border border-stone-200 bg-surface p-6 sm:p-8">
          <Field label="Nome" name="contato-nome" autoComplete="name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Seu nome" />
          <Field label="E-mail" name="contato-email" autoComplete="email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="voce@email.com" />
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-stone-700">Mensagem</span>
            <textarea
              id="contato-mensagem"
              name="contato-mensagem"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-stone-300 bg-page px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              placeholder="Como podemos ajudar?"
            />
          </label>
          <button disabled={sending} className="w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-ink-fg transition hover:opacity-90 disabled:opacity-60">
            {sending ? "Enviando…" : "Enviar Mensagem"}
          </button>
        </form>
      </div>
    </section>
  );
}

/** Rastreamento de pedido pelo número + e-mail */
export function OrderTracker({ orders }) {
  const cloud = useCloud();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const steps = Object.keys(ORDER_STATUS);

  const search = (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    const found = orders.find((o) => o.id.toUpperCase() === c && o.customer.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      setResult(null);
      return setError("Não encontramos um pedido com esse número e e-mail. Confira os dados da confirmação.");
    }
    setError("");
    setResult(found);
  };

  const current = result ? steps.indexOf(result.status) : -1;
  return (
    <section id="rastrear" className="scroll-mt-28 border-y border-stone-200 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Rastrear Pedido</p>
          <h2 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Onde está meu pedido?</h2>
          <p className="mt-4 max-w-md text-stone-600">
            Digite o número do pedido e o e-mail usado na compra. O status muda assim que a equipe atualiza o pedido no Painel Admin.
          </p>
          <form onSubmit={search} className="mt-8 space-y-3" noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Número do pedido" name="rastrear-pedido" value={code} onChange={(v) => setCode(v.toUpperCase())} placeholder="FA-10422" />
              <Field label="E-mail da compra" name="rastrear-email" autoComplete="email" type="email" value={email} onChange={setEmail} placeholder="voce@email.com" />
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110">
              <Search className="h-4 w-4" /> Rastrear
            </button>
            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            <p className="text-xs text-stone-500">
              {cloud.status === "online"
                ? "Você encontra o número do pedido na tela de confirmação e em “Minha conta”."
                : <>Para testar: <b className="font-mono">FA-10422</b> com <b>rafael.lima@email.com</b>.</>}
            </p>
          </form>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-page p-6 sm:p-8">
          {!result ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
              <Truck className="h-10 w-10 text-stone-300" />
              <p className="mt-3 text-sm text-stone-500">O andamento da entrega aparece aqui.</p>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-emerald-800">{result.id}</p>
                  <p className="text-xs text-stone-500">Feito em {formatDateTime(result.createdAt)}</p>
                </div>
                <StatusBadge status={result.status} />
              </div>
              <ol className="mt-8 space-y-0">
                {steps.map((st, idx) => {
                  const done = idx <= current;
                  const notes = {
                    Recebido: "Pedido recebido, aguardando a confirmação do pagamento",
                    "Em preparação": "Pagamento confirmado, separando e embalando os produtos",
                    "Pronto para entrega": `Embalado e pronto para seguir para ${result.address.city}/${result.address.state}`,
                    Entregue: "Pedido entregue",
                  };
                  return (
                    <li key={st} className="relative flex gap-4 pb-6 last:pb-0">
                      {idx < steps.length - 1 && (
                        <span className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${idx < current ? "bg-emerald-700" : "bg-stone-200"}`} />
                      )}
                      <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        done ? "bg-emerald-700 text-white" : "border-2 border-stone-300 bg-surface text-stone-400"
                      }`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </span>
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${done ? "text-stone-900" : "text-stone-400"}`}>{st}</p>
                        <p className="text-xs text-stone-500">{notes[st]}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-6 space-y-1 border-t border-stone-200 pt-4 text-sm text-stone-700">
                {result.items.map((i) => (
                  <p key={i.lineId || i.id}>{i.qty}× {i.name}{i.custom ? ` · “${i.custom}”` : ""}</p>
                ))}
                <p className="pt-2 font-bold text-stone-900">Total {formatBRL(result.total)} · {result.payment}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ onOpenChat, onContact }) {
  const { settings } = useStore();
  const [q, setQ] = useState("");
  const FAQ = buildFaq(settings).filter((f) => !q.trim() || normalize(f.q + " " + f.a).includes(normalize(q.trim())));
  const [open, setOpen] = useState(0);
  return (
    <section id="duvidas" className="scroll-mt-28 mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Central de atendimento</p>
        <h2 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Como podemos ajudar?</h2>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: MessageCircle, t: "Assistente e chat", d: "Respostas na hora e equipe ao vivo", go: onOpenChat },
          { icon: Truck, t: "Acompanhar pedido", d: "Número e e-mail da compra", go: () => document.getElementById("rastrear")?.scrollIntoView({ behavior: "smooth" }) },
          { icon: Mail, t: "Formulário de contato", d: "Respondemos em até 24h", go: onContact },
        ].map(({ icon: Icon, t, d, go }) => (
          <button key={t} onClick={go} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-lg hover:shadow-black/5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon className="h-5 w-5" /></span>
            <span><span className="block text-sm font-semibold text-stone-900">{t}</span><span className="block text-xs text-stone-500">{d}</span></span>
          </button>
        ))}
      </div>
      <div className="relative mt-8">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          id="busca-duvidas"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(0); }}
          placeholder="Buscar nas dúvidas: frete, PIX, troca, refil..."
          className="w-full rounded-full border border-stone-300 bg-surface py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
        />
      </div>
      {FAQ.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          Nenhuma dúvida encontrada. <button onClick={onOpenChat} className="font-semibold text-emerald-800 hover:underline">Pergunte ao assistente</button>.
        </p>
      )}
      <div className={`mt-6 divide-y divide-stone-200 rounded-[2rem] border border-stone-200 bg-surface ${FAQ.length ? "" : "hidden"}`}>
        {FAQ.map((f, idx) => {
          const isOpen = open === idx;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-stone-900 sm:text-base">
                  <HelpCircle className="h-5 w-5 shrink-0 text-emerald-700" /> {f.q}
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-stone-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 pl-14 text-sm leading-relaxed text-stone-600">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Rodapé */
export function Footer({ notify, onNavigate, onSubscribe }) {
  const { settings, appearance } = useStore();
  const { contato, newsletter } = appearance;
  const ig = safeUrl(contato.instagram);
  const wa = whatsappUrl(contato.whatsapp);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify("Digite um e-mail válido.", "error");
    const ok = await onSubscribe(email.trim().toLowerCase());
    if (!ok) return;
    setJoined(true);
    setEmail("");
    notify("Inscrição registrada na lista da Farmaura");
  };
  return (
    <footer className="palette-light bg-stone-950 text-stone-400">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grain relative isolate grid items-center gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-banner via-[#11402e] to-banner p-7 ring-1 ring-white/10 sm:p-10 md:grid-cols-2">
          <div className="orb pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-destaque/25 blur-3xl" />
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-destaque px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-destaque-fg"><Gift className="h-3.5 w-3.5" /> Cupom de boas-vindas</p>
            <p className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">{newsletter.titulo} {newsletter.destaque && <span className="text-gradient">{newsletter.destaque}</span>} {newsletter.fim}</p>
            {newsletter.texto && <p className="mt-2 text-sm text-white/60">{newsletter.texto}</p>}
          </div>
          {joined ? (
            <p className="flex items-center gap-2 rounded-2xl bg-white/5 p-4 text-sm text-emerald-300">
              <CheckCircle2 className="h-5 w-5" /> Você está na lista. Use o cupom <b className="text-white">BEMVINDO10</b>.
            </p>
          ) : (
            <form onSubmit={subscribe} className="flex flex-col gap-2 sm:flex-row" noValidate>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white outline-none placeholder:text-stone-500 focus:border-emerald-400"
              />
              <button className="btn-glow shine rounded-full bg-destaque px-7 py-3.5 text-sm font-bold text-destaque-fg transition hover:-translate-y-0.5">
                Quero o cupom
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed">
            Dermocosméticos veganos e concentrados, com menos plástico. Wayfarer for Men e Aura Vital.
          </p>
          <p className="flex items-center gap-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Compra 100% segura
          </p>
          {/* QR Code do site: aponte a câmera do celular para abrir a loja */}
          <div className="flex max-w-xs items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <QRCodeSvg text={PUBLIC_SITE_URL} size={88} label="QR Code do site da Farmaura" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Leve a loja no celular</p>
              <p className="mt-0.5 text-[11px] leading-snug text-stone-400">Aponte a câmera para o código e abra o site.</p>
              <button onClick={() => downloadQR(PUBLIC_SITE_URL, "qrcode-farmaura.png", notify)} className="mt-1.5 text-[11px] font-semibold text-emerald-300 underline-offset-2 hover:underline">
                Baixar QR Code
              </button>
            </div>
          </div>
        </div>
        <nav className="space-y-3 text-sm" aria-label="Loja">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">Loja</p>
          {[["catalogo-sabonete", "Sabonete em Pó"], ["catalogo-protetor", "Protetor Solar"], ["catalogo-acessorios", "Acessórios"], ["quiz", "Quiz de produtos"], ["sustentabilidade", "Sustentabilidade"], ["doar", "Faça uma doação"], ["sobre", "Sobre a Farmaura"]].filter(([id]) => id !== "doar" || settings.donationsEnabled).map(([id, l]) => (
            <button key={id} onClick={() => onNavigate(id)} className="block transition hover:text-white">{l}</button>
          ))}
        </nav>
        <nav className="space-y-3 text-sm" aria-label="Ajuda">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">Ajuda</p>
          {[["rastrear", "Rastrear pedido"], ["duvidas", "Dúvidas frequentes"], ["contato", "Fale conosco"]].map(([id, l]) => (
            <button key={id} onClick={() => onNavigate(id)} className="block transition hover:text-white">{l}</button>
          ))}
        </nav>
        <div className="space-y-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">Contato</p>
          {contato.email && <a href={`mailto:${contato.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4 shrink-0 text-emerald-400" /> {contato.email}</a>}
          {contato.telefone && <a href={wa || `tel:${contato.telefone.replace(/\D/g, "")}`} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4 shrink-0 text-emerald-400" /> {contato.telefone}{wa ? " · WhatsApp" : ""}</a>}
          {contato.endereco && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-emerald-400" /> {contato.endereco}</p>}
          {ig && <a href={ig} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white"><Instagram className="h-4 w-4 shrink-0 text-emerald-400" /> Instagram</a>}
          <div className="flex flex-wrap gap-2 pt-2">
            {["PIX", "Cartão", "Boleto"].map((m) => (
              <span key={m} className="rounded-md border border-white/15 px-2 py-1 text-[11px] font-semibold text-stone-300">{m}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 pr-20 text-xs sm:px-6 sm:pr-20 lg:px-8">
          © {new Date().getFullYear()} Farmaura Dermocosméticos · Projeto acadêmico (TCC) · Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
