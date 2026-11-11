import React, { useEffect, useRef, useState } from "react";
import { Field, SafeImage, Switch } from "../ui";
import { useStore } from "../../lib/contextos";
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2, Copy, Eye, FileText, Plus, RotateCcw, Sparkles, Trash2, Type } from "../../lib/icones";
import {
  DEFAULT_APPEARANCE, FONTES_TEXTO, FONTES_TITULO, SECOES, TEMAS_PRONTOS, applyAppearance, normalizeAppearance,
} from "../../lib/aparencia";
import { formatBRL } from "../../lib/util";

/* ============================================================================
 * PAINEL ADMIN > APARÊNCIA
 * A equipe muda cores, fontes, textos e a ordem das seções sem mexer no código.
 * As mudanças aparecem na hora (prévia); só valem para os clientes ao salvar.
 * ========================================================================== */

const ABAS = [
  { id: "estilo", label: "Cores e estilo" },
  { id: "topo", label: "Topo e banner" },
  { id: "secoes", label: "Seções da página" },
  { id: "textos", label: "Textos" },
  { id: "contato", label: "Contato" },
  { id: "backup", label: "Backup" },
];

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function AparenciaPanel({ onSave, onPreview, notify }) {
  const { appearance: salvo, products } = useStore();
  const [d, setD] = useState(salvo);
  const [aba, setAba] = useState("estilo");
  const mudou = !igual(d, salvo);
  const salvoRef = useRef(salvo);
  salvoRef.current = salvo;

  // Se outra pessoa da equipe salvar enquanto o painel está aberto, e aqui não há mudanças, acompanha
  const ultimoSalvo = useRef(salvo);
  useEffect(() => {
    setD((cur) => (igual(cur, ultimoSalvo.current) ? salvo : cur));
    ultimoSalvo.current = salvo;
  }, [salvo]);
  // Prévia ao vivo: aplica o rascunho no site inteiro (inclusive neste painel)
  useEffect(() => { applyAppearance(d); }, [d]);
  // Ao sair do painel sem salvar, volta para o que está salvo
  useEffect(() => () => applyAppearance(salvoRef.current), []);
  // Aviso ao fechar a aba do navegador com mudanças não salvas
  useEffect(() => {
    if (!mudou) return undefined;
    const h = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [mudou]);

  const set = (path, value) => setD((cur) => {
    const next = JSON.parse(JSON.stringify(cur));
    const keys = path.split(".");
    let o = next;
    keys.slice(0, -1).forEach((k) => { o = o[k]; });
    o[keys[keys.length - 1]] = value;
    return next;
  });

  const salvar = () => { onSave(d); notify("Aparência salva. Os clientes já veem a nova versão."); };
  const salvarEVer = () => { if (mudou) onSave(d); onPreview(); };
  const descartar = () => { setD(salvo); notify("Alterações descartadas"); };

  return (
    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_360px]">
      <div className="min-w-0 rounded-3xl border border-stone-200 bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Aparência da loja</h2>
            <p className="text-xs text-stone-500">Mude o visual sem mexer no código. A prévia aparece na hora; os clientes só veem depois de salvar.</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${mudou ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800"}`} role="status">
            {mudou ? "Alterações não salvas" : "Tudo salvo"}
          </span>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-stone-200 px-3 py-2" role="tablist" aria-label="Partes da aparência">
          {ABAS.map((a) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={aba === a.id}
              onClick={() => setAba(a.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${aba === a.id ? "bg-emerald-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="space-y-6 p-5 sm:p-6" role="tabpanel">
          {aba === "estilo" && <AbaEstilo d={d} set={set} setD={setD} />}
          {aba === "topo" && <AbaTopo d={d} set={set} setD={setD} products={products} />}
          {aba === "secoes" && <AbaSecoes d={d} set={set} />}
          {aba === "textos" && <AbaTextos d={d} set={set} />}
          {aba === "contato" && <AbaContato d={d} set={set} />}
          {aba === "backup" && <AbaBackup d={d} setD={setD} notify={notify} />}
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 rounded-b-3xl border-t border-stone-200 bg-surface/95 p-4 backdrop-blur">
          <button onClick={salvar} disabled={!mudou} className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50">
            Salvar alterações
          </button>
          <button onClick={salvarEVer} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:border-stone-500">
            <Eye className="h-4 w-4" /> {mudou ? "Salvar e ver na loja" : "Ver na loja"}
          </button>
          {mudou && (
            <button onClick={descartar} className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold text-stone-500 hover:text-rose-700">
              <RotateCcw className="h-4 w-4" /> Descartar
            </button>
          )}
        </div>
      </div>

      <Previa d={d} products={products} />
    </div>
  );
}

/* ---------- Prévia: miniatura do topo, de um card e dos botões ---------- */
function Previa({ d, products }) {
  const p = products.find((x) => x.id === d.hero.produtoId) || products.find((x) => x.bestSeller) || products[0];
  return (
    <aside className="space-y-3 xl:sticky xl:top-28" aria-label="Prévia">
      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Prévia ao vivo</p>
      <div className="palette-light grain relative isolate overflow-hidden rounded-[1.75rem] bg-banner p-5 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-destaque/30 blur-2xl" />
        {d.hero.selo.trim() && <p className="inline-flex rounded-full bg-destaque px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destaque-fg">{d.hero.selo === "auto" ? "Novo" : d.hero.selo}</p>}
        <p className="mt-3 font-serif text-2xl leading-tight">
          {d.hero.titulo} {d.hero.destaque && <em className="text-gradient">{d.hero.destaque}</em>}
        </p>
        <p className="mt-2 line-clamp-2 text-xs text-white/70">{d.hero.subtitulo}</p>
        <span className="mt-4 inline-flex rounded-full bg-destaque px-4 py-2 text-xs font-bold text-destaque-fg">{d.hero.botao || "Comprar agora"}</span>
      </div>
      {p && (
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-surface p-2">
          <SafeImage src={p.image} alt="" className={`w-full rounded-[1.1rem] object-cover ${d.formatoFoto === "retrato" ? "aspect-[4/5]" : d.formatoFoto === "paisagem" ? "aspect-[4/3]" : "aspect-square"}`} />
          <div className="p-3">
            <p className="font-serif text-xl text-stone-900">{p.name}</p>
            <p className="text-xs text-emerald-800">{p.variant}</p>
            <div className="mt-3 flex items-center justify-between">
              <b className="text-lg text-stone-900">{formatBRL(p.price)}</b>
              <span className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-bold text-white">Adicionar</span>
            </div>
          </div>
        </div>
      )}
      <p className="text-[11px] text-stone-500">Dica: use o botão de lua/sol no topo para conferir o tema escuro.</p>
    </aside>
  );
}

/* ---------- Peças das abas ---------- */
const Bloco = ({ titulo, dica, children }) => (
  <section className="space-y-3">
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">{titulo}</h3>
      {dica && <p className="mt-0.5 text-xs text-stone-500">{dica}</p>}
    </div>
    {children}
  </section>
);

const Opcoes = ({ value, onChange, options, name }) => (
  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
    {options.map(([v, l]) => (
      <button key={v} role="radio" aria-checked={value === v} onClick={() => onChange(v)}
        className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${value === v ? "border-emerald-900 bg-emerald-900 text-white" : "border-stone-300 text-stone-700 hover:border-stone-500"}`}>
        {l}
      </button>
    ))}
  </div>
);

function Cor({ label, value, onChange, dica }) {
  const [txt, setTxt] = useState(value);
  useEffect(() => setTxt(value), [value]);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200 p-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-11 shrink-0 cursor-pointer rounded-xl border border-stone-300 bg-transparent p-0.5" aria-label={label} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-stone-900">{label}</span>
        {dica && <span className="block text-[11px] text-stone-500">{dica}</span>}
      </span>
      <input
        value={txt}
        onChange={(e) => { setTxt(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value.toLowerCase()); }}
        className="w-24 rounded-lg border border-stone-300 bg-page px-2 py-1.5 font-mono text-xs uppercase outline-none focus:border-emerald-700"
        aria-label={`${label} em hexadecimal`}
        maxLength={7}
      />
    </div>
  );
}

function AbaEstilo({ d, set, setD }) {
  return (
    <>
      <Bloco titulo="Temas prontos" dica="Um clique troca as quatro cores. Depois dá para ajustar cada uma.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TEMAS_PRONTOS.map((t) => {
            const ativo = ["principal", "destaque", "banner", "fundo"].every((k) => d.cores[k].toLowerCase() === t[k]);
            return (
              <button key={t.id} onClick={() => setD((cur) => ({ ...cur, cores: { principal: t.principal, destaque: t.destaque, banner: t.banner, fundo: t.fundo } }))}
                aria-pressed={ativo}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${ativo ? "border-emerald-700 ring-2 ring-emerald-700/20" : "border-stone-200 hover:border-stone-400"}`}>
                <span className="flex -space-x-1.5">
                  {[t.banner, t.principal, t.destaque].map((c) => <span key={c} className="h-7 w-7 rounded-full ring-2 ring-surface" style={{ background: c }} />)}
                </span>
                <span className="text-sm font-semibold text-stone-800">{t.nome}</span>
                {ativo && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-700" />}
              </button>
            );
          })}
        </div>
      </Bloco>

      <Bloco titulo="Cores">
        <div className="grid gap-2 sm:grid-cols-2">
          <Cor label="Principal" dica="Botões, links e detalhes" value={d.cores.principal} onChange={(v) => set("cores.principal", v)} />
          <Cor label="Destaque" dica="Botão do topo, selos e faixa" value={d.cores.destaque} onChange={(v) => set("cores.destaque", v)} />
          <Cor label="Banner escuro" dica="Fundo do topo e da barra de avisos" value={d.cores.banner} onChange={(v) => set("cores.banner", v)} />
          <Cor label="Fundo da página" dica="Só no tema claro" value={d.cores.fundo} onChange={(v) => set("cores.fundo", v)} />
        </div>
      </Bloco>

      <Bloco titulo="Fontes">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-700"><Type className="h-3.5 w-3.5" /> Títulos</span>
            <select value={d.fontes.titulo} onChange={(e) => set("fontes.titulo", e.target.value)} className="w-full rounded-xl border border-stone-300 bg-page px-3 py-3 text-sm outline-none focus:border-emerald-700">
              {FONTES_TITULO.map((f) => <option key={f}>{f}</option>)}
            </select>
            <span className="mt-2 block font-serif text-2xl text-stone-900">A ciência da pele</span>
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-700"><Type className="h-3.5 w-3.5" /> Textos</span>
            <select value={d.fontes.texto} onChange={(e) => set("fontes.texto", e.target.value)} className="w-full rounded-xl border border-stone-300 bg-page px-3 py-3 text-sm outline-none focus:border-emerald-700">
              {FONTES_TEXTO.map((f) => <option key={f}>{f}</option>)}
            </select>
            <span className="mt-2 block text-sm text-stone-600">Sabonete em pó que vira espuma cremosa.</span>
          </label>
        </div>
      </Bloco>

      <div className="grid gap-6 sm:grid-cols-2">
        <Bloco titulo="Cantos">
          <Opcoes name="Cantos" value={d.cantos} onChange={(v) => set("cantos", v)} options={[["arredondado", "Bem arredondados"], ["medio", "Médios"], ["reto", "Retos"]]} />
        </Bloco>
        <Bloco titulo="Foto dos produtos">
          <Opcoes name="Formato da foto" value={d.formatoFoto} onChange={(v) => set("formatoFoto", v)} options={[["quadrado", "Quadrada"], ["retrato", "Em pé"], ["paisagem", "Deitada"]]} />
        </Bloco>
        <Bloco titulo="Tema para quem chega" dica="Quem já escolheu no botão de lua/sol continua com a escolha.">
          <Opcoes name="Tema padrão" value={d.temaPadrao} onChange={(v) => set("temaPadrao", v)} options={[["sistema", "Igual ao celular"], ["claro", "Claro"], ["escuro", "Escuro"]]} />
        </Bloco>
        <Bloco titulo="Movimento">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 px-4 py-3">
            <span className="text-sm text-stone-700">Animações (letreiro, brilhos, entradas)</span>
            <Switch id="ap-animacoes" checked={d.animacoes} onChange={(v) => set("animacoes", v)} label="Animações" />
          </div>
        </Bloco>
      </div>
    </>
  );
}

/** Lista de textos com adicionar, remover e reordenar */
function ListaTextos({ itens, onChange, max, placeholder, vazioAuto }) {
  const mover = (i, dir) => { const n = [...itens]; const j = i + dir; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="space-y-2">
      {itens.map((t, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={t}
            onChange={(e) => { const n = [...itens]; n[i] = e.target.value; onChange(n); }}
            placeholder={vazioAuto ? "Vazio = frete grátis e PIX automáticos" : placeholder}
            maxLength={90}
            aria-label={`Item ${i + 1}`}
            className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-page px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
          />
          <button onClick={() => mover(i, -1)} disabled={i === 0} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-30" aria-label={`Subir item ${i + 1}`}><ArrowUp className="h-4 w-4" /></button>
          <button onClick={() => mover(i, 1)} disabled={i === itens.length - 1} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-30" aria-label={`Descer item ${i + 1}`}><ArrowDown className="h-4 w-4" /></button>
          <button onClick={() => onChange(itens.filter((_, j) => j !== i))} className="rounded-lg p-2 text-stone-500 hover:bg-rose-50 hover:text-rose-700" aria-label={`Remover item ${i + 1}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      {itens.length < max && (
        <button onClick={() => onChange([...itens, ""])} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-stone-300 px-4 py-2 text-xs font-semibold text-stone-600 hover:border-emerald-700 hover:text-emerald-800">
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </button>
      )}
    </div>
  );
}

/** Liga/desliga cada letreiro e faixa, e escolhe se passam ou ficam parados */
function BlocoLetreiros({ d, set, setD }) {
  const L = d.letreiros;
  const faixaOn = (d.secoes.find((s) => s.id === "beneficios") || {}).on !== false;
  const setFaixa = (v) => set("secoes", d.secoes.map((s) => (s.id === "beneficios" ? { ...s, on: v } : s)));
  const limpo = !L.banner && !faixaOn && !L.movimento;
  const itens = [
    { id: "ap-l-avisos", t: "Barra de avisos no topo", dica: "Faixa fina acima do menu, em todas as páginas", on: L.avisos, set: (v) => set("letreiros.avisos", v) },
    { id: "ap-l-banner", t: "Letreiro grande do banner", dica: "Frases grandes passando no fim do banner", on: L.banner, set: (v) => set("letreiros.banner", v) },
    { id: "ap-l-faixa", t: "Faixa colorida de benefícios", dica: "Logo abaixo do banner", on: faixaOn, set: setFaixa },
    { id: "ap-l-mov", t: "Letreiros em movimento", dica: "Desligado = textos parados e centralizados", on: L.movimento, set: (v) => set("letreiros.movimento", v) },
  ];
  return (
    <Bloco titulo="Letreiros e faixas" dica="Achou muita informação? Desligue o que não quiser ou use o visual limpo.">
      <div className="grid gap-2 sm:grid-cols-2">
        {itens.map((x) => (
          <div key={x.id} className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 px-4 py-3">
            <span><span className="block text-sm font-medium text-stone-800">{x.t}</span><span className="block text-[11px] text-stone-500">{x.dica}</span></span>
            <Switch id={x.id} checked={x.on} onChange={x.set} label={x.t} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setD((cur) => ({ ...cur, letreiros: { ...cur.letreiros, banner: false, movimento: false }, secoes: cur.secoes.map((s) => (s.id === "beneficios" ? { ...s, on: false } : s)) }))}
          disabled={limpo}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-ink-fg hover:opacity-90 disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" /> Visual limpo (só o aviso do topo, parado)
        </button>
        <button
          onClick={() => setD((cur) => ({ ...cur, letreiros: { avisos: true, banner: true, movimento: true }, secoes: cur.secoes.map((s) => (s.id === "beneficios" ? { ...s, on: true } : s)) }))}
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-xs font-semibold text-stone-700 hover:border-stone-500"
        >
          Ligar todos os letreiros
        </button>
      </div>
    </Bloco>
  );
}

function AbaTopo({ d, set, setD, products }) {
  const h = d.hero;
  const seloModo = h.selo === "auto" ? "auto" : h.selo.trim() ? "texto" : "nenhum";
  return (
    <>
      <BlocoLetreiros d={d} set={set} setD={setD} />
      <Bloco titulo="Textos da barra de avisos" dica="Passam no topo de todas as páginas (quando a barra está ligada).">
        <ListaTextos itens={d.avisos} onChange={(v) => set("avisos", v)} max={8} vazioAuto />
      </Bloco>
      <Bloco titulo="Banner principal">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Título" value={h.titulo} onChange={(v) => set("hero.titulo", v)} maxLength={80} className="sm:col-span-2" />
          <Field label="Palavra em destaque (colorida)" value={h.destaque} onChange={(v) => set("hero.destaque", v)} maxLength={30} />
          <Field label="Texto do botão" value={h.botao} onChange={(v) => set("hero.botao", v)} maxLength={30} />
          <Field label="Letreiro do banner (frases separadas por ·)" value={h.letreiro} onChange={(v) => set("hero.letreiro", v)} maxLength={200} className="sm:col-span-2" placeholder="Vazio = sem letreiro" />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-stone-700">Subtítulo</span>
            <textarea rows={3} value={h.subtitulo} onChange={(e) => set("hero.subtitulo", e.target.value)} maxLength={300}
              className="w-full rounded-xl border border-stone-300 bg-page px-4 py-3 text-sm outline-none focus:border-emerald-700" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-stone-700">Produto em destaque</span>
            <select value={h.produtoId} onChange={(e) => set("hero.produtoId", e.target.value)} className="w-full rounded-xl border border-stone-300 bg-page px-3 py-3 text-sm outline-none focus:border-emerald-700">
              <option value="">Automático (mais vendido em estoque)</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-stone-700">Selo acima do título</span>
            <Opcoes name="Selo" value={seloModo} onChange={(v) => set("hero.selo", v === "auto" ? "auto" : v === "texto" ? "Novidade" : "")} options={[["auto", "Lançamento"], ["texto", "Texto livre"], ["nenhum", "Nenhum"]]} />
          </div>
          {seloModo === "texto" && <Field label="Texto do selo" value={h.selo} onChange={(v) => set("hero.selo", v)} maxLength={40} className="sm:col-span-2" />}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 px-4 py-3">
            <span className="text-sm text-stone-700">Selo giratório de desconto</span>
            <Switch id="ap-desconto" checked={h.mostrarDesconto} onChange={(v) => set("hero.mostrarDesconto", v)} label="Selo de desconto" />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 px-4 py-3">
            <span className="text-sm text-stone-700">Números (vegano, plástico…)</span>
            <Switch id="ap-numeros" checked={h.mostrarNumeros} onChange={(v) => set("hero.mostrarNumeros", v)} label="Números" />
          </div>
        </div>
      </Bloco>
      <Bloco titulo="Faixa de benefícios" dica="Frases curtas que passam na faixa colorida abaixo do banner.">
        <ListaTextos itens={d.beneficios} onChange={(v) => set("beneficios", v)} max={10} placeholder="Ex.: Fórmulas veganas" />
      </Bloco>
    </>
  );
}

function AbaSecoes({ d, set }) {
  const label = Object.fromEntries(SECOES.map((s) => [s.id, s.label]));
  const mover = (i, dir) => { const n = [...d.secoes]; const j = i + dir; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; set("secoes", n); };
  return (
    <Bloco titulo="Ordem e seções visíveis" dica="Use as setas para mudar a ordem e o botão para esconder uma seção. O rodapé fica sempre no fim.">
      <ol className="space-y-2">
        {d.secoes.map((s, i) => (
          <li key={s.id} className={`flex items-center gap-2 rounded-2xl border p-3 ${s.on ? "border-stone-200 bg-surface" : "border-dashed border-stone-300 bg-stone-50 opacity-70"}`}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">{i + 1}</span>
            <span className="min-w-0 flex-1 text-sm font-medium text-stone-800">{label[s.id]}</span>
            <button onClick={() => mover(i, -1)} disabled={i === 0} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-30" aria-label={`Subir ${label[s.id]}`}><ArrowUp className="h-4 w-4" /></button>
            <button onClick={() => mover(i, 1)} disabled={i === d.secoes.length - 1} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-30" aria-label={`Descer ${label[s.id]}`}><ArrowDown className="h-4 w-4" /></button>
            <Switch id={`sec-${s.id}`} checked={s.on} onChange={(v) => set("secoes", d.secoes.map((x) => (x.id === s.id ? { ...x, on: v } : x)))} label={`Mostrar ${label[s.id]}`} />
          </li>
        ))}
      </ol>
      <p className="text-[11px] text-stone-500">A seção Doação também depende de Configurações &gt; “Mostrar a seção Doar”. “Vistos recentemente” só aparece para quem já abriu 2 produtos ou mais.</p>
    </Bloco>
  );
}

function AbaTextos({ d, set }) {
  return (
    <>
      <Bloco titulo="Sobre a marca">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Título" value={d.sobre.titulo} onChange={(v) => set("sobre.titulo", v)} maxLength={80} />
          <Field label="Parte em destaque" value={d.sobre.destaque} onChange={(v) => set("sobre.destaque", v)} maxLength={40} />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-stone-700">Texto</span>
            <textarea rows={5} value={d.sobre.texto} onChange={(e) => set("sobre.texto", e.target.value)} maxLength={600}
              className="w-full rounded-xl border border-stone-300 bg-page px-4 py-3 text-sm outline-none focus:border-emerald-700" />
          </label>
        </div>
      </Bloco>
      <Bloco titulo="Chamada da newsletter (rodapé)">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Começo" value={d.newsletter.titulo} onChange={(v) => set("newsletter.titulo", v)} maxLength={40} />
          <Field label="Destaque" value={d.newsletter.destaque} onChange={(v) => set("newsletter.destaque", v)} maxLength={30} />
          <Field label="Fim" value={d.newsletter.fim} onChange={(v) => set("newsletter.fim", v)} maxLength={40} />
          <Field label="Texto menor" value={d.newsletter.texto} onChange={(v) => set("newsletter.texto", v)} maxLength={140} className="sm:col-span-3" />
        </div>
      </Bloco>
    </>
  );
}

function AbaContato({ d, set }) {
  const c = d.contato;
  return (
    <Bloco titulo="Contato e redes" dica="Aparece na seção Contato, no rodapé e no botão de WhatsApp da página do produto. Deixe vazio para esconder.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="E-mail" type="email" value={c.email} onChange={(v) => set("contato.email", v)} maxLength={80} />
        <Field label="Telefone (como aparece no site)" value={c.telefone} onChange={(v) => set("contato.telefone", v)} maxLength={30} />
        <Field label="WhatsApp (só números, com 55 e DDD)" inputMode="numeric" value={c.whatsapp} onChange={(v) => set("contato.whatsapp", v.replace(/\D/g, ""))} maxLength={15} placeholder="5511999999999" />
        <Field label="Instagram (@usuario ou link)" value={c.instagram} onChange={(v) => set("contato.instagram", v)} maxLength={80} placeholder="@farmaura" />
        <Field label="Endereço" value={c.endereco} onChange={(v) => set("contato.endereco", v)} maxLength={120} className="sm:col-span-2" />
      </div>
    </Bloco>
  );
}

function AbaBackup({ d, setD, notify }) {
  const inputRef = useRef(null);
  const exportar = () => {
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `farmaura-aparencia-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const importar = async (file) => {
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      setD(normalizeAppearance(json));
      notify("Aparência carregada. Confira a prévia e clique em Salvar.");
    } catch {
      notify("Esse arquivo não é um backup de aparência válido.", "error");
    }
  };
  const copiar = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(d)); notify("Configuração copiada"); } catch { notify("Não foi possível copiar", "error"); }
  };
  return (
    <>
      <Bloco titulo="Guardar e trazer de volta" dica="Baixe um arquivo com toda a aparência antes de grandes mudanças. Dá para carregar de novo depois.">
        <div className="flex flex-wrap gap-2">
          <button onClick={exportar} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ink-fg hover:opacity-90"><FileText className="h-4 w-4" /> Baixar backup (.json)</button>
          <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:border-stone-500"><ArrowRight className="h-4 w-4" /> Carregar backup</button>
          <button onClick={copiar} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:border-stone-500"><Copy className="h-4 w-4" /> Copiar</button>
          <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { importar(e.target.files[0]); e.target.value = ""; }} />
        </div>
      </Bloco>
      <Bloco titulo="Voltar ao original" dica="Volta cores, fontes, textos e seções para o visual padrão da Farmaura (ainda precisa salvar).">
        <button onClick={() => { setD(DEFAULT_APPEARANCE); notify("Visual padrão carregado na prévia. Clique em Salvar para aplicar."); }} className="inline-flex items-center gap-2 rounded-full border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50">
          <Sparkles className="h-4 w-4" /> Restaurar visual padrão
        </button>
      </Bloco>
    </>
  );
}
