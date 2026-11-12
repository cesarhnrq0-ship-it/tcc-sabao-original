import React, { useMemo, useState } from "react";
import { ORDER_STATUS, fontById } from "../data/catalogo";
import { useReviews, useStore } from "../lib/contextos";
import { CheckCircle2, ChevronDown, Clock, Copy, Leaf, Minus, Plus, QrCode, Star, X } from "../lib/icones";
import { buildPixPayload, copyText, fmtAvg, formatBRL, pixText, qrMatrix } from "../lib/util";

/* ============================================================================
 * 3. COMPONENTES DE INTERFACE
 * ========================================================================== */

/** Imagem com fallback elegante caso a URL externa falhe */
export function SafeImage({ src, alt, className = "", fallbackIcon: Icon = Leaf }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-emerald-100 via-stone-100 to-amber-50 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Icon className="h-12 w-12 text-emerald-700/40" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}

/** Avaliação em estrelas */
export function Stars({ rating, size = "h-4 w-4" }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Avaliação ${rating} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}`}
        />
      ))}
    </div>
  );
}

/** Logo da marca */
export function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${light ? "bg-white/10" : "bg-emerald-900"}`}>
        <Leaf className={`h-5 w-5 ${light ? "text-emerald-300" : "text-white"}`} />
      </div>
      <span className={`font-serif text-2xl tracking-tight ${light ? "text-white" : "text-stone-900 max-[409px]:sr-only"}`}>
        Farm<span className="italic text-emerald-700">aura</span>
      </span>
    </div>
  );
}

/** QR Code do PIX (desenhado em SVG, sempre preto no branco para o banco conseguir ler) */
export function PixQR({ payload, size = 196 }) {
  const qr = useMemo(() => {
    if (typeof window.qrcode !== "function") return null;
    try {
      const q = window.qrcode(0, "M");
      q.addData(payload);
      q.make();
      const n = q.getModuleCount();
      let d = "";
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
      return { n, d };
    } catch {
      return null;
    }
  }, [payload]);
  if (!qr) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[#d6d3d1] bg-white p-4 text-center text-xs text-[#57534e]" style={{ width: size, height: size }}>
        Não foi possível desenhar o QR Code. Use o código copia e cola abaixo.
      </div>
    );
  }
  return (
    <svg viewBox={`-3 -3 ${qr.n + 6} ${qr.n + 6}`} width={size} height={size} shapeRendering="crispEdges" role="img" aria-label="QR Code para pagar com PIX" className="rounded-xl">
      <rect x="-3" y="-3" width={qr.n + 6} height={qr.n + 6} fill="#ffffff" />
      <path d={qr.d} fill="#000000" />
    </svg>
  );
}

/** Bloco de pagamento PIX mostrado depois que o pedido é feito */
export function PixPayment({ order, notify, title = "Pague com PIX", note }) {
  const { settings } = useStore();
  const payload = buildPixPayload({
    key: settings.pixKey,
    name: settings.pixName,
    city: settings.pixCity,
    amount: order.total,
    txid: order.id,
  });
  return (
    <div className="palette-light mt-6 w-full shrink-0 overflow-hidden rounded-2xl border border-emerald-200 bg-white text-left text-[#292524]">
      <div className="flex items-center justify-between gap-3 bg-emerald-900 px-5 py-3 text-white">
        <p className="flex items-center gap-2 text-sm font-semibold"><QrCode className="h-4 w-4" /> {title}</p>
        <p className="text-lg font-bold tabular-nums">{formatBRL(order.total)}</p>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex justify-center">
          <PixQR payload={payload} />
        </div>
        <ol className="space-y-1 text-xs text-[#57534e]">
          <li><b className="text-[#1c1917]">1.</b> Abra o app do seu banco e entre na área PIX.</li>
          <li><b className="text-[#1c1917]">2.</b> Escolha “Ler QR Code” ou “PIX Copia e Cola”.</li>
          <li><b className="text-[#1c1917]">3.</b> Confira o valor de {formatBRL(order.total)} e confirme.</li>
        </ol>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-[#44403c]">PIX Copia e Cola</p>
          <textarea
            id={`pix-copia-cola-${order.id}`}
            readOnly
            rows={3}
            value={payload}
            onFocus={(e) => e.target.select()}
            className="w-full resize-none rounded-xl border border-[#d6d3d1] bg-[#fafaf9] p-3 font-mono text-[11px] leading-relaxed text-[#292524] outline-none"
          />
          <button
            type="button"
            onClick={() => copyText(payload, notify, `pix-copia-cola-${order.id}`)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Copy className="h-4 w-4" /> Copiar código PIX
          </button>
        </div>
        <div className="rounded-xl bg-[#f5f5f4] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#78716c]">Ou pague pela chave</p>
          <div className="mt-1 flex items-center gap-2">
            <input
              id={`pix-chave-${order.id}`}
              readOnly
              value={settings.pixKey}
              onFocus={(e) => e.target.select()}
              className="min-w-0 flex-1 bg-transparent font-mono text-xs text-[#1c1917] outline-none"
            />
            <button
              type="button"
              onClick={() => copyText(settings.pixKey, notify, `pix-chave-${order.id}`)}
              className="shrink-0 rounded-full border border-[#d6d3d1] px-3 py-1 text-[11px] font-semibold text-[#44403c] hover:border-[#78716c]"
            >
              Copiar chave
            </button>
          </div>
          <p className="mt-1 text-[11px] text-[#78716c]">Recebedor: {pixText(settings.pixName, 25)} · Identificador: {order.id.replace("-", "")}</p>
        </div>
        <p className="flex items-start gap-1.5 text-[11px] text-[#78716c]">
          <Clock className="mt-px h-3 w-3 shrink-0" /> {note || "Assim que o pagamento cair, nossa equipe confirma o pedido e você acompanha o andamento em “Rastrear”."}
        </p>
      </div>
    </div>
  );
}

/** Linha de nota usada nos cards e no detalhe */
export function RatingLine({ productId, big = false }) {
  const { stats } = useReviews();
  const s = stats[productId];
  if (!s) return <p className={`text-xs ${big ? "" : ""} text-stone-500`}>Sem avaliações ainda</p>;
  return (
    <div className="flex items-center gap-2">
      <Stars rating={s.avg} size={big ? "h-5 w-5" : "h-4 w-4"} />
      <span className="text-xs text-stone-500">
        <b className="text-stone-800">{fmtAvg(s.avg)}</b> ({s.count} {s.count === 1 ? "avaliação" : "avaliações"})
      </span>
    </div>
  );
}

/** Seletor de estrelas (teclado: setas, Tab) */
export function StarInput({ value, onChange }) {
  const labels = ["Ruim", "Regular", "Bom", "Muito bom", "Excelente"];
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Sua nota">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"} — ${labels[n - 1]}`}
          onClick={() => onChange(n)}
          className="rounded-md p-1 transition hover:scale-110"
        >
          <Star className={`h-7 w-7 ${n <= value ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-300"}`} />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-stone-600">{value ? labels[value - 1] : "Escolha uma nota"}</span>
    </div>
  );
}

export function QRCodeSvg({ text, size = 168, label }) {
  const qr = useMemo(() => qrMatrix(text), [text]);
  if (!qr) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[#d6d3d1] bg-white p-3 text-center text-[11px] text-[#57534e]" style={{ width: size, height: size }}>
        QR Code indisponível sem internet
      </div>
    );
  }
  const d = qr.cells.map(([c, r]) => `M${c} ${r}h1v1h-1z`).join("");
  return (
    <svg viewBox={`-3 -3 ${qr.n + 6} ${qr.n + 6}`} width={size} height={size} shapeRendering="crispEdges" role="img" aria-label={label || "QR Code"} className="rounded-xl">
      <rect x="-3" y="-3" width={qr.n + 6} height={qr.n + 6} fill="#ffffff" />
      <path d={d} fill="#000000" />
    </svg>
  );
}

/** Prévia da personalização sobre o material do produto */
export function CustomPreview({ custom, text, font, color, small = false }) {
  const c = custom.colors.find((x) => x.id === color) || custom.colors[0];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl shadow-inner ${small ? "h-14" : "h-32"}`}
      style={{ background: custom.surface }}
      aria-label={`Prévia: ${text || "Seu nome"}`}
    >
      <span className="pointer-events-none absolute inset-2 rounded-lg border border-dashed" style={{ borderColor: custom.stitch }} />
      <span
        className={`relative max-w-full truncate px-5 leading-none ${small ? "text-lg" : "text-4xl"} ${text ? "" : "opacity-50"}`}
        style={{ ...fontById(font).style, color: c.hex, textShadow: custom.shadow }}
      >
        {text || "Seu nome"}
      </span>
      {!small && (
        <span className="absolute bottom-2.5 right-3.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: custom.stitch }}>
          Prévia · {custom.material}
        </span>
      )}
    </div>
  );
}

/** Controle de quantidade reutilizável */
export function QtyControl({ qty, onChange, min = 1, max = 20 }) {
  return (
    <div className="flex items-center rounded-full border border-stone-300 bg-surface">
      <button
        onClick={() => onChange(Math.max(min, qty - 1))}
        className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-30"
        disabled={qty <= min}
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-semibold">{qty}</span>
      <button
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-30"
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Campo de formulário reutilizável com mensagem de erro */
// "name" e "autoComplete" são opcionais, mas sem eles o navegador não oferece
// o preenchimento automático (nome, e-mail, endereço) nos formulários.
export function Field({ label, value, onChange, error, type = "text", placeholder, className = "", inputMode, maxLength, name, autoComplete, id }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-stone-700">{label}</span>
      <input
        type={type}
        id={id || name}
        name={name}
        autoComplete={autoComplete}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-page px-4 py-3 text-sm outline-none transition focus:ring-2 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
            : "border-stone-300 focus:border-emerald-700 focus:ring-emerald-700/15"
        }`}
      />
      {error && <span className="mt-1 block text-[11px] font-medium text-rose-600">{error}</span>}
    </label>
  );
}

/* ============================================================================
 * 4. PAINEL ADMINISTRATIVO
 * ========================================================================== */

/** Card de KPI */
export function KpiCard({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{sub}</p>
    </div>
  );
}

/** Badge de status do pedido */
export function StatusBadge({ status }) {
  // Pedido gravado por uma versão antiga pode ter status fora da lista:
  // sem este padrão o painel inteiro quebrava ao tentar ler a cor.
  const s = ORDER_STATUS[status] || ORDER_STATUS.Recebido;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${s.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {status || "Recebido"}
    </span>
  );
}

/** Seletor de status do pedido */
export function StatusSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-stone-300 bg-surface py-2 pl-3 pr-8 text-xs font-medium text-stone-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
        aria-label="Alterar status do pedido"
      >
        {Object.keys(ORDER_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
    </div>
  );
}

/* ---------- Componentes de formulário do painel ---------- */

/** Interruptor liga/desliga */
export function Switch({ checked, onChange, label, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${checked ? "bg-emerald-700" : "bg-stone-300"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

/** Campo numérico com prefixo (R$) ou sufixo (%, un.) */
export function NumField({ id, label, value, onChange, prefix, suffix, error, hint, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-stone-700">{label}</span>
      <div className={`flex items-center rounded-xl border bg-page transition focus-within:ring-2 ${
        error ? "border-rose-400 focus-within:ring-rose-500/15" : "border-stone-300 focus-within:border-emerald-700 focus-within:ring-emerald-700/15"
      }`}>
        {prefix && <span className="pl-3 text-sm text-stone-500">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm tabular-nums outline-none"
        />
        {suffix && <span className="pr-3 text-sm text-stone-500">{suffix}</span>}
      </div>
      {error ? <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>
        : hint ? <span className="mt-1 block text-[11px] text-stone-500">{hint}</span> : null}
    </label>
  );
}

/** Confirmação em linha (os diálogos do navegador não funcionam aqui) */
export function ConfirmInline({ question, confirmLabel = "Confirmar", onConfirm, onCancel }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2 rounded-full border border-rose-300 bg-rose-50 py-1 pl-3 pr-1 text-xs font-semibold text-rose-700">
      {question}
      <button type="button" onClick={onConfirm} className="rounded-full bg-rose-600 px-3 py-1 text-white">{confirmLabel}</button>
      <button type="button" onClick={onCancel} className="rounded-full px-2 py-1">Cancelar</button>
    </span>
  );
}

/** Indicador de estoque */
export function StockBadge({ stock, low }) {
  if (stock <= 0) return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">Esgotado</span>;
  if (stock <= low) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-amber-800">{stock} un. · baixo</span>;
  return <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-stone-700">{stock} un.</span>;
}

/** Botão de copiar texto (com aviso quando a área de transferência é bloqueada) */
export function CopyButton({ text, label = "Copiar", notify }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copiado");
    } catch {
      notify("Não foi possível copiar. Selecione o texto e copie manualmente.", "error");
    }
  };
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-2.5 py-1 text-[11px] font-semibold text-stone-600 transition hover:border-stone-500 hover:text-stone-900">
      <Copy className="h-3 w-3" /> {label}
    </button>
  );
}

/* ============================================================================
 * 5. NOTIFICAÇÕES (TOAST)
 * ========================================================================== */

export function Toast({ toast, onAction }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div className="toast-in fixed left-1/2 z-[60] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2" style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}>
      <div
        className={`flex items-center gap-3 rounded-full px-5 py-3 text-sm font-medium shadow-2xl ${
          isError ? "bg-rose-600 text-white" : "bg-[#1c1917] text-white ring-1 ring-white/10"
        }`}
      >
        {isError ? <X className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        <span>{toast.message}</span>
        {toast.action && (
          <button onClick={onAction} className="ml-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/25">
            {toast.action}
          </button>
        )}
      </div>
    </div>
  );
}
