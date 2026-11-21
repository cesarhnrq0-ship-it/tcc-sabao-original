import React, { useEffect, useMemo, useRef, useState } from "react";
import { PixQR, StatusBadge } from "../ui";
import { Leaf, Package, ShoppingBag, Sparkles, Trash2, Users, X } from "../../lib/icones";
import { PUBLIC_SITE_URL, formatBRL } from "../../lib/util";

/* ============================================================================
 * MODO APRESENTAÇÃO (TCC)
 * Tela cheia com o QR Code da loja: a banca compra pelo celular e cada pedido
 * aparece aqui na hora, com aviso e som. Também prepara e limpa os exemplos.
 * ========================================================================== */

/** Som curto de "novo pedido", gerado no navegador (sem arquivo de áudio) */
export const tocarAviso = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [[880, 0], [1318.5, 0.13]].forEach(([freq, t]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.4);
    });
    setTimeout(() => ctx.close(), 900);
  } catch { /* navegador sem áudio: só o aviso visual */ }
};

/** Chama onNovo para cada pedido que chegar depois que o painel abriu (os que já existiam não contam) */
export function useNovosPedidos(orders, onNovo) {
  const conhecidos = useRef(null);
  const chamar = useRef(onNovo);
  chamar.current = onNovo;
  useEffect(() => {
    const ids = new Set(orders.map((o) => o.id));
    if (conhecidos.current === null) { conhecidos.current = ids; return; }
    const novos = orders.filter((o) => !conhecidos.current.has(o.id) && !o.demo);
    conhecidos.current = ids;
    novos.forEach((o) => chamar.current(o));
  }, [orders]);
}

/** Tela cheia da apresentação */
export function TelaApresentacao({ pessoasAgora = null, orders, onClose, onLoadDemo, onClearDemo, demoCount, som, setSom }) {
  const [desde] = useState(() => Date.now());
  const [destaque, setDestaque] = useState(null);
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);

  // Pedidos feitos depois que a tela abriu: são os da banca
  const aoVivo = useMemo(
    () => orders.filter((o) => !o.demo && new Date(o.createdAt).getTime() >= desde).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, desde]
  );
  const total = aoVivo.reduce((a, o) => a + o.total, 0);
  const unidades = aoVivo.reduce((a, o) => a + o.items.reduce((s, i) => s + i.qty, 0), 0);

  useNovosPedidos(orders, (o) => {
    setDestaque(o);
    if (som) tocarAviso();
  });
  useEffect(() => {
    if (!destaque) return;
    const t = setTimeout(() => setDestaque(null), 5000);
    return () => clearTimeout(t);
  }, [destaque]);
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const endereco = PUBLIC_SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Modo apresentação">
    <div className="vidro">
      <div className="vidro-fundo" aria-hidden="true" />
      <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
        {/* Topo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2.5 rounded-2xl bg-surface vidro-borda px-3 py-2 text-sm font-semibold text-stone-950">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-destaque text-destaque-fg"><Leaf className="h-4 w-4" /></span>
            Farmaura <span className="font-normal text-stone-500">· Ao vivo</span>
            <span className="ml-1 h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSom((v) => !v)} aria-pressed={som}
              className={`rounded-full px-4 py-2 text-xs font-semibold vidro-borda transition ${som ? "bg-white/15 text-stone-950" : "bg-white/5 text-stone-600"}`}>
              Som {som ? "ligado" : "desligado"}
            </button>
            <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-stone-800 vidro-borda transition hover:bg-white/10">
              <X className="h-3.5 w-3.5" /> Fechar (Esc)
            </button>
          </div>
        </div>

        <div className="grid flex-1 items-stretch gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* QR Code */}
          <section className="flex flex-col items-center justify-center rounded-[2rem] bg-surface vidro-borda p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Faça um pedido agora</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-950 sm:text-4xl">Aponte a câmera do celular</h1>
            <div className="mt-6 rounded-3xl bg-white p-3 vidro-brilho">
              <PixQR payload={PUBLIC_SITE_URL} size={260} label={`QR Code da loja: ${endereco}`} />
            </div>
            <p className="mt-4 break-all font-mono text-sm text-stone-700">{endereco}</p>
            <ol className="mt-6 grid w-full max-w-md gap-2 text-left text-sm text-stone-700 sm:grid-cols-3">
              {["Escolha um produto", "Finalize no carrinho", "Veja chegar aqui"].map((t, i) => (
                <li key={t} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 vidro-borda">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destaque text-xs font-bold text-destaque-fg">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </section>

          {/* Pedidos ao vivo */}
          <section className="flex flex-col rounded-[2rem] bg-surface vidro-borda p-6 sm:p-8" aria-live="polite">
            <div className={`grid gap-3 ${pessoasAgora !== null ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
              {[
                ...(pessoasAgora !== null ? [{ label: "Pessoas no site agora", value: pessoasAgora, icon: Users, sufixo: false }] : []),
                { label: "Pedidos", value: aoVivo.length, icon: Package },
                { label: "Faturamento", value: formatBRL(total), icon: ShoppingBag },
                { label: "Itens", value: unidades, icon: Sparkles },
              ].map(({ label, value, icon: Icon, sufixo = true }) => (
                <div key={label} className="rounded-2xl bg-white/5 p-4 vidro-borda">
                  <Icon className="h-4 w-4 text-[rgb(var(--destaque))]" />
                  <p className="mt-2 truncate text-2xl font-bold tabular-nums text-stone-950 sm:text-3xl">{value}</p>
                  <p className="text-[11px] text-stone-500">{sufixo ? `${label} nesta apresentação` : label}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-6 text-sm font-semibold text-stone-950">Chegando agora</h2>
            {aoVivo.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <span className="relative flex h-12 w-12 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/30" />
                  <Package className="relative h-6 w-6 text-emerald-700" />
                </span>
                <p className="mt-4 text-sm text-stone-600">Esperando o primeiro pedido…</p>
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {aoVivo.slice(0, 6).map((o) => (
                  <li key={o.id} className="page-in flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 vidro-borda">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-800">
                      {o.customer.name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-stone-950">{o.customer.name}</span>
                      <span className="block truncate text-xs text-stone-500">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-bold tabular-nums text-stone-950">{formatBRL(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Preparar e limpar os exemplos */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 text-xs">
              <span className="mr-auto text-stone-500">Dados de exemplo: {demoCount} {demoCount === 1 ? "cadastro" : "cadastros"}</span>
              <button onClick={onLoadDemo} className="rounded-full bg-white/5 px-3 py-1.5 font-semibold text-stone-800 vidro-borda transition hover:bg-white/10">
                Carregar exemplos
              </button>
              {confirmarLimpar ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-stone-600">Apagar os exemplos?</span>
                  <button onClick={() => { onClearDemo(); setConfirmarLimpar(false); }} className="rounded-full bg-rose-100 px-3 py-1.5 font-semibold text-rose-700">Apagar</button>
                  <button onClick={() => setConfirmarLimpar(false)} className="rounded-full px-2 py-1.5 font-semibold text-stone-600">Cancelar</button>
                </span>
              ) : (
                <button onClick={() => setConfirmarLimpar(true)} disabled={!demoCount} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 font-semibold text-stone-800 vidro-borda transition hover:bg-white/10 disabled:opacity-40">
                  <Trash2 className="h-3.5 w-3.5" /> Limpar exemplos
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Aviso grande de novo pedido */}
      {destaque && (
        <div className="pointer-events-none fixed inset-x-0 top-6 z-[61] flex justify-center px-4">
          <div className="page-in flex items-center gap-4 rounded-3xl bg-destaque px-6 py-4 text-destaque-fg shadow-2xl vidro-brilho">
            <ShoppingBag className="h-8 w-8" />
            <div>
              <p className="text-lg font-extrabold">Novo pedido!</p>
              <p className="text-sm font-medium">{destaque.customer.name.split(" ")[0]} · {formatBRL(destaque.total)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
