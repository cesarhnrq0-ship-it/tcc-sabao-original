import React, { useEffect, useState } from "react";
import { ChatInput, ChatMessages } from "../loja/Chat";
import { ConfirmInline, CopyButton, Field, KpiCard, NumField, QRCodeSvg, SafeImage, Stars, StatusBadge, Switch } from "../ui";
import { CUSTOMIZATION, ORDER_STATUS, customStyleText } from "../../data/catalogo";
import { DEMO_PEOPLE } from "../../data/exemplos";
import { MOCK_ORDERS, autoAnnouncement, couponLabel, couponValueText } from "../../data/loja";
import { useCloud, useStore } from "../../lib/contextos";
import { CheckCircle2, ChevronRight, Clock, Copy, FileText, Gift, Heart, Inbox, Lock, MessageCircle, PenLine, Plus, QrCode, RotateCcw, Star, StickyNote, Tag, Trash2, Truck, Users, X } from "../../lib/icones";
import { FIREBASE_ADMINS } from "../../lib/nuvem";
import { conferirSenha, hashSenha } from "../../lib/seguranca";
import { REGIOES, defaultFreteRegioes } from "../../lib/frete";
import { PUBLIC_SITE_URL, CHAT_QUICK_REPLIES, DONATION_STATUS, EMPTY_COUPON, REVIEW_STATUS, chatTime, chatUnread, downloadQR, fmtAvg, formatBRL, formatDateTime, numText, orderGiftFee, parseNum, pixText, productUrl, round2 } from "../../lib/util";

/** Painel: mensagens do formulário de contato e inscritos na newsletter */
export function MessagesPanel({ messages, newsletter, onUpdate, onDelete, notify }) {
  const [confirmDel, setConfirmDel] = useState(null);
  const list = [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const subs = [...newsletter].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const copyEmails = async () => {
    const text = [...new Set(subs.map((s) => s.email))].join(", ");
    try {
      await navigator.clipboard.writeText(text);
      notify(`${subs.length} e-mails copiados`);
    } catch {
      notify("O navegador bloqueou a cópia.", "error");
    }
  };
  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-surface">
        <div className="border-b border-stone-200 p-5">
          <h2 className="text-lg font-semibold text-stone-900">Mensagens do contato</h2>
          <p className="text-xs text-stone-500">{list.filter((m) => !m.read).length} não lidas · {list.length} no total</p>
        </div>
        {list.length === 0 ? (
          <div className="p-12 text-center text-sm text-stone-500">
            <Inbox className="mx-auto mb-3 h-8 w-8 text-stone-300" />
            Nenhuma mensagem ainda. Elas chegam pelo formulário “Fale com a gente”.
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {list.map((m) => (
              <li key={m.id} className={`p-5 ${m.read ? "" : "bg-emerald-50/50"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-stone-900">
                      {!m.read && <span className="h-2 w-2 rounded-full bg-emerald-600" aria-label="Não lida" />}
                      {m.name}
                    </p>
                    <p className="select-all text-xs text-stone-500">{m.email} · {formatDateTime(m.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onUpdate(m, { read: !m.read })} className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 hover:border-stone-500">
                      {m.read ? "Marcar como não lida" : "Marcar como lida"}
                    </button>
                    {confirmDel === m.id ? (
                      <ConfirmInline question="Excluir?" confirmLabel="Excluir" onConfirm={() => { onDelete(m); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
                    ) : (
                      <button onClick={() => setConfirmDel(m.id)} className="rounded-full p-1.5 text-stone-400 hover:text-rose-600" aria-label="Excluir mensagem">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-700">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Newsletter</h2>
            <p className="text-xs text-stone-500">{subs.length} inscritos</p>
          </div>
          {subs.length > 0 && (
            <button onClick={copyEmails} className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-500">
              <Copy className="h-3.5 w-3.5" /> Copiar e-mails
            </button>
          )}
        </div>
        {subs.length === 0 ? (
          <p className="p-8 text-center text-sm text-stone-500">Ninguém se inscreveu ainda.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {subs.map((s, i) => (
              <li key={`${s.email}-${i}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="min-w-0 truncate select-all text-stone-800">{s.email}</span>
                <span className="shrink-0 text-xs text-stone-500">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Aba "Chat" do Painel Admin (lado da equipe) */
export function ChatAdminPanel({ chats, onReply, onRead, onDelete, notify }) {
  const list = [...chats]
    .filter((c) => Array.isArray(c.mensagens) && c.mensagens.length)
    .sort((a, b) => String(b.ultimaEm || "").localeCompare(String(a.ultimaEm || "")));
  const [selected, setSelected] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const current = list.find((c) => c.uid === selected) || list[0] || null;
  const unreadHere = chatUnread(current, "cliente");
  const convoRef = React.useRef(null);

  // Abrir a conversa marca as mensagens do cliente como lidas
  useEffect(() => {
    if (current && unreadHere > 0) onRead(current.uid);
  }, [current && current.uid, unreadHere]);

  const pick = (uid) => {
    setSelected(uid);
    setConfirmDel(false);
    if (window.innerWidth < 1024 && convoRef.current) setTimeout(() => convoRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  if (!list.length) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-stone-300 bg-surface p-12 text-center text-sm text-stone-500">
        <MessageCircle className="mx-auto mb-3 h-8 w-8 text-stone-300" />
        Nenhuma conversa ainda. Quando um cliente escrever no balão de chat da loja, a conversa aparece aqui na hora.
      </div>
    );
  }

  return (
    <div className="mt-6 grid items-start gap-4 lg:grid-cols-[320px_1fr]">
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-surface">
        <p className="border-b border-stone-200 px-5 py-4 text-sm font-semibold text-stone-900">Conversas · {list.length}</p>
        <ul className="max-h-[560px] divide-y divide-stone-100 overflow-y-auto">
          {list.map((c) => {
            const last = c.mensagens[c.mensagens.length - 1];
            const n = chatUnread(c, "cliente");
            const active = current && current.uid === c.uid;
            return (
              <li key={c.uid}>
                <button
                  onClick={() => pick(c.uid)}
                  className={`flex w-full items-start gap-3 px-5 py-3.5 text-left transition ${active ? "bg-emerald-50" : "hover:bg-stone-50"}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    {(c.name || "?").split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${n ? "font-bold text-stone-900" : "font-semibold text-stone-800"}`}>{c.name || "Visitante"}</span>
                      <span className="shrink-0 text-[10px] text-stone-400">{last ? chatTime(last.at) : ""}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className={`truncate text-xs ${n ? "text-stone-800" : "text-stone-500"}`}>
                        {last && last.from === "equipe" ? "Você: " : ""}{last ? last.text : ""}
                      </span>
                      {n > 0 && <span className="ml-auto flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">{n}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {current && (
        <section ref={convoRef} className="flex h-[620px] scroll-mt-40 flex-col overflow-hidden rounded-3xl border border-stone-200 bg-page">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-surface px-5 py-3.5">
            <div className="min-w-0">
              <p className="font-semibold text-stone-900">{current.name || "Visitante"}</p>
              <p className="select-all text-xs text-stone-500">{current.email || "sem e-mail"}</p>
            </div>
            {confirmDel ? (
              <ConfirmInline
                question="Apagar esta conversa?"
                confirmLabel="Apagar"
                onConfirm={() => { onDelete(current.uid); setConfirmDel(false); setSelected(null); }}
                onCancel={() => setConfirmDel(false)}
              />
            ) : (
              <button onClick={() => setConfirmDel(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-rose-600">
                <Trash2 className="h-3.5 w-3.5" /> Apagar conversa
              </button>
            )}
          </div>
          <ChatMessages messages={current.mensagens} me="equipe" />
          <div className="flex gap-2 overflow-x-auto border-t border-stone-200 bg-surface px-3 pt-3">
            {CHAT_QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => onReply(current.uid, q)}
                className="shrink-0 rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800"
              >
                {q.length > 34 ? q.slice(0, 34) + "…" : q}
              </button>
            ))}
          </div>
          <ChatInput key={current.uid} onSend={(t) => onReply(current.uid, t)} placeholder={`Responder ${((current.name || "cliente").split(" ")[0])}`} id="chat-equipe" />
        </section>
      )}
    </div>
  );
}

export function ReviewsAdminPanel({ reviews, onModerate, onDelete }) {
  const { allProducts } = useStore();
  const [filter, setFilter] = useState("pendente");
  const [confirmDel, setConfirmDel] = useState(null);
  const counts = { pendente: 0, aprovada: 0, rejeitada: 0 };
  reviews.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
  const list = [...reviews]
    .filter((r) => filter === "todas" || r.status === filter)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const approved = reviews.filter((r) => r.status === "aprovada");
  const avg = approved.length ? approved.reduce((a, r) => a + r.stars, 0) / approved.length : 0;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Clock} label="Aguardando moderação" value={counts.pendente} sub="Ainda não aparecem na loja" tone="bg-amber-50 text-amber-700" />
        <KpiCard icon={Star} label="Publicadas" value={counts.aprovada} sub={approved.length ? `Média geral ${fmtAvg(avg)} de 5` : "Nenhuma publicada ainda"} tone="bg-emerald-50 text-emerald-800" />
        <KpiCard icon={X} label="Rejeitadas" value={counts.rejeitada} sub="Não aparecem na loja" tone="bg-stone-100 text-stone-600" />
      </div>
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-surface">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Moderação de avaliações</h2>
            <p className="text-xs text-stone-500">Só as avaliações publicadas entram na nota dos produtos.</p>
          </div>
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-stone-100 p-1">
            {[["pendente", "Aguardando"], ["aprovada", "Publicadas"], ["rejeitada", "Rejeitadas"], ["todas", "Todas"]].map(([id, l]) => (
              <button key={id} onClick={() => setFilter(id)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === id ? "bg-surface text-emerald-800 shadow-sm" : "text-stone-500"}`}>
                {l}{id !== "todas" && counts[id] ? ` (${counts[id]})` : ""}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <div className="p-12 text-center text-sm text-stone-500">
            <Star className="mx-auto mb-3 h-8 w-8 text-stone-300" />
            {reviews.length ? "Nenhuma avaliação neste filtro." : "Nenhuma avaliação ainda. Elas chegam pela página de cada produto."}
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {list.map((r) => {
              const p = allProducts.find((x) => x.id === r.productId);
              return (
                <li key={r.id} className="flex flex-col gap-3 p-5 md:flex-row">
                  <div className="flex min-w-0 flex-1 gap-3">
                    {p && <SafeImage src={p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-800">{p ? p.name : r.productId}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Stars rating={r.stars} size="h-3.5 w-3.5" />
                        <span className="text-sm font-semibold text-stone-900">{r.name}</span>
                        <span className="text-xs text-stone-400">{formatDateTime(r.createdAt)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${REVIEW_STATUS[r.status].color}`}>{REVIEW_STATUS[r.status].label}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-stone-700">{r.text}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 md:justify-end">
                    {r.status !== "aprovada" && (
                      <button onClick={() => onModerate(r, "aprovada")} className="inline-flex items-center gap-1 rounded-full bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Publicar
                      </button>
                    )}
                    {r.status !== "rejeitada" && (
                      <button onClick={() => onModerate(r, "rejeitada")} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-500">
                        {r.status === "aprovada" ? "Despublicar" : "Rejeitar"}
                      </button>
                    )}
                    {confirmDel === r.id ? (
                      <ConfirmInline question="Excluir de vez?" confirmLabel="Excluir" onConfirm={() => { onDelete(r); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
                    ) : (
                      <button onClick={() => setConfirmDel(r.id)} className="rounded-full p-1.5 text-stone-400 hover:text-rose-600" aria-label="Excluir avaliação">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Histórico de entradas e saídas do estoque */
export function StockMovements({ movements }) {
  const { allProducts } = useStore();
  const list = [...movements].sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 40);
  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-stone-200 bg-surface">
      <div className="border-b border-stone-200 p-5">
        <h2 className="text-lg font-semibold text-stone-900">Movimentações de estoque</h2>
        <p className="text-xs text-stone-500">Entradas, saídas manuais e baixas por venda · últimas {list.length}</p>
      </div>
      {list.length === 0 ? (
        <p className="p-10 text-center text-sm text-stone-500">Nenhuma movimentação registrada ainda. Use os botões − e + na tabela acima ou finalize um pedido.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Data</th>
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Motivo</th>
                <th className="px-5 py-3 text-right font-semibold">Quantidade</th>
                <th className="px-5 py-3 text-right font-semibold">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {list.map((m, i) => {
                const p = allProducts.find((x) => x.id === m.productId);
                return (
                  <tr key={`${m.at}-${i}`}>
                    <td className="whitespace-nowrap px-5 py-2.5 text-xs text-stone-500">{formatDateTime(m.at)}</td>
                    <td className="px-5 py-2.5 font-medium text-stone-900">{p ? p.name : m.productId}</td>
                    <td className="px-5 py-2.5 text-xs text-stone-600">{m.motivo}</td>
                    <td className={`px-5 py-2.5 text-right font-bold tabular-nums ${m.delta > 0 ? "text-emerald-700" : "text-rose-600"}`}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-stone-700">{m.saldo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Folha com os QR Codes de todos os produtos (para imprimir e colar nas embalagens) */
export function QrSheetModal({ onClose, notify }) {
  const { products } = useStore();
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="QR Codes dos produtos">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-page shadow-2xl sm:rounded-[2rem]">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-page/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="font-serif text-xl text-stone-900">QR Codes do site e dos produtos</p>
            <p className="text-xs text-stone-500">O primeiro abre a loja; os outros abrem a página de cada produto no site publicado.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:brightness-110">
              <FileText className="h-3.5 w-3.5" /> Imprimir
            </button>
            <button onClick={onClose} className="rounded-full p-2 text-stone-600 hover:bg-stone-200" aria-label="Fechar"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="print-area grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
          {/* QR Code do site inteiro, para cartaz, banner do estande ou slide */}
          <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-700 bg-white p-4 text-center text-[#1c1917] sm:flex-row sm:gap-5 sm:text-left">
            <QRCodeSvg text={PUBLIC_SITE_URL} size={150} label="QR Code do site da Farmaura" />
            <div className="mt-2 sm:mt-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#047857]">Site da loja</p>
              <p className="font-serif text-xl">Farmaura</p>
              <p className="mt-1 break-all text-[11px] text-[#57534e]">{PUBLIC_SITE_URL}</p>
              <button onClick={() => downloadQR(PUBLIC_SITE_URL, "qrcode-farmaura.png", notify)} className="no-print mt-2 text-[11px] font-semibold text-emerald-800 hover:underline">Baixar PNG</button>
            </div>
          </div>
          {products.map((p) => (
            <div key={p.id} className="flex flex-col items-center rounded-2xl border border-stone-200 bg-white p-4 text-center text-[#1c1917]">
              <QRCodeSvg text={productUrl(p.id)} size={132} label={`QR Code de ${p.name}`} />
              <p className="mt-2 text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-[#57534e]">{formatBRL(p.price)}</p>
              <button onClick={() => downloadQR(productUrl(p.id), `qrcode-${p.id}.png`, notify)} className="no-print mt-2 text-[11px] font-semibold text-emerald-800 hover:underline">Baixar PNG</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Modal com todos os detalhes do pedido */
export function OrderDetail({ order, onClose, onUpdateStatus, onDelete, onUpdateOrder, notify }) {
  const { allProducts } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [note, setNote] = useState(order.note || "");
  const steps = Object.keys(ORDER_STATUS);
  const current = steps.indexOf(order.status);
  const next = steps[current + 1];
  const address = `${order.address.street}, ${order.address.number} — ${order.address.district}, ${order.address.city}/${order.address.state} · CEP ${order.address.zip}`;
  const giftFee = orderGiftFee(order);
  const noteChanged = note.trim() !== (order.note || "");
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Pedido ${order.id}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-page shadow-2xl sm:rounded-[2rem]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stone-200 bg-page/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="font-mono text-lg font-bold text-emerald-800">{order.id}</p>
            <p className="text-xs text-stone-500">{formatDateTime(order.createdAt)} · {order.payment}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="rounded-full p-2 text-stone-600 hover:bg-stone-200" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Andamento */}
          <div className="rounded-2xl border border-stone-200 bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-900">Andamento</p>
              {next && (
                <button
                  onClick={() => onUpdateStatus(order.id, next)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                >
                  Marcar como {next} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {steps.map((st, idx) => (
                <button key={st} onClick={() => onUpdateStatus(order.id, st)} className="group flex flex-col items-center gap-2 text-center" aria-label={`Definir status ${st}`}>
                  <span className={`h-1.5 w-full rounded-full transition ${idx <= current ? "bg-emerald-700" : "bg-stone-200 group-hover:bg-stone-300"}`} />
                  <span className={`text-[11px] font-semibold leading-tight ${idx <= current ? "text-emerald-800" : "text-stone-400 group-hover:text-stone-600"}`}>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {order.payment === "PIX" && order.status === "Recebido" && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <QrCode className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Confira no extrato do banco um PIX de <b>{formatBRL(order.total)}</b> com o identificador <b className="font-mono">{order.id.replace("-", "")}</b>.
                Se o pagamento caiu, marque como Em preparação.
              </p>
            </div>
          )}

          {/* Cartão de presente */}
          {order.gift && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
                <Gift className="h-4 w-4" /> Embalagem para presente · escrever no cartão
              </p>
              {order.gift.message ? (
                <blockquote className="mt-3 rounded-xl bg-surface p-4 font-serif text-lg italic leading-snug text-stone-900 shadow-sm">
                  “{order.gift.message}”
                </blockquote>
              ) : (
                <p className="mt-3 text-sm text-rose-700">O cliente não escreveu mensagem. Enviar o cartão em branco.</p>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-surface p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Cliente</p>
              <p className="mt-2 font-semibold text-stone-900">{order.customer.name}</p>
              <p className="select-all text-sm text-stone-600">{order.customer.email}</p>
              <p className="select-all text-sm text-stone-600">{order.customer.phone}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={order.customer.email} label="E-mail" notify={notify} />
                <CopyButton text={order.customer.phone} label="Telefone" notify={notify} />
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-surface p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Entrega</p>
              <p className="mt-2 select-all text-sm leading-relaxed text-stone-700">{address}</p>
              <div className="mt-3"><CopyButton text={address} label="Copiar endereço" notify={notify} /></div>
            </div>
          </div>

          {/* Itens */}
          <div className="rounded-2xl border border-stone-200 bg-surface">
            <p className="border-b border-stone-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-500">Itens</p>
            <ul className="divide-y divide-stone-100">
              {order.items.map((i) => {
                const p = allProducts.find((x) => x.id === i.id);
                return (
                  <li key={i.lineId || i.id} className="flex items-center gap-4 px-5 py-3">
                    {p && <SafeImage src={p.image} alt={i.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900">{i.qty}× {i.name}</p>
                      <p className="text-xs text-stone-500">{i.variant}</p>
                      {i.custom && (
                        <p className="mt-1 inline-flex flex-wrap items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
                          <PenLine className="h-3 w-3" /> Personalizar com “{i.custom}”
                          {customStyleText(i) && <span className="font-normal">· {customStyleText(i)}</span>}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-stone-900">{formatBRL(i.price * i.qty)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-1.5 border-t border-stone-200 px-5 py-4 text-sm tabular-nums">
              <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatBRL(order.subtotal)}</span></div>
              <div className="flex justify-between text-stone-600"><span>Frete</span><span>{order.shipping ? formatBRL(order.shipping) : "Grátis"}</span></div>
              {giftFee > 0 && <div className="flex justify-between text-stone-600"><span>Embalagem para presente</span><span>{formatBRL(giftFee)}</span></div>}
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Descontos{order.coupon ? ` (cupom ${order.coupon})` : ""}</span><span>- {formatBRL(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold text-stone-900"><span>Total</span><span>{formatBRL(order.total)}</span></div>
            </div>
          </div>

          {/* Nota interna */}
          <div className="rounded-2xl border border-stone-200 bg-surface p-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              <StickyNote className="h-4 w-4" /> Nota interna
            </p>
            <p className="mt-1 text-xs text-stone-500">Só a equipe vê. Use para código de rastreio, combinados com o cliente etc.</p>
            <textarea
              id={`nota-${order.id}`}
              rows={3}
              value={note}
              maxLength={300}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex.: Enviado pelos Correios, rastreio BR123456789BR"
              className="mt-3 w-full rounded-xl border border-stone-300 bg-page px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                disabled={!noteChanged}
                onClick={() => { onUpdateOrder(order.id, { note: note.trim() }); notify("Nota salva"); }}
                className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
              >
                Salvar nota
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            {confirmDelete ? (
              <ConfirmInline question="Excluir este pedido?" confirmLabel="Excluir" onConfirm={() => onDelete(order.id)} onCancel={() => setConfirmDelete(false)} />
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-rose-600">
                <Trash2 className="h-3.5 w-3.5" /> Excluir pedido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Gráfico de barras: faturamento por dia */
export function RevenueChart({ days }) {
  const max = Math.max(1, ...days.map((d) => d.value));
  const nice = Math.ceil(max / 100) * 100;
  return (
    <div>
      <div className="relative h-48">
        {[1, 0.5, 0].map((t) => (
          <div key={t} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${t * 100}%` }}>
            <span className="w-14 shrink-0 -translate-y-1/2 text-right text-[10px] tabular-nums text-stone-400">{formatBRL(nice * t).replace(",00", "")}</span>
            <span className="h-px flex-1 -translate-y-1/2 bg-stone-200" />
          </div>
        ))}
        <div className={`absolute inset-y-0 left-16 right-0 flex items-end ${days.length > 14 ? "gap-0.5" : "gap-2"}`}>
          {days.map((d) => (
            <div key={d.key} className="group relative flex h-full flex-1 items-end">
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${d.isToday ? "bg-emerald-700" : "bg-emerald-300"}`}
                style={{ height: `${(d.value / nice) * 100}%`, minHeight: d.value ? 4 : 0 }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1c1917] px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                {formatBRL(d.value)} · {d.count} {d.count === 1 ? "pedido" : "pedidos"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={`ml-16 mt-2 flex ${days.length > 14 ? "gap-0.5" : "gap-2"}`}>
        {days.map((d) => (
          <span key={d.key} className={`min-w-0 flex-1 overflow-visible whitespace-nowrap text-center text-[10px] ${d.isToday ? "font-bold text-stone-900" : "text-stone-500"}`}>{d.showLabel === false ? "" : d.label}</span>
        ))}
      </div>
    </div>
  );
}

/** Editor de produto: preço, promoção, estoque, selo, visibilidade e personalização */
export function ProductEditor({ product, onClose, onSave, onSaveCustom, onReset, notify }) {
  const { customizationAll, data } = useStore();
  const base = CUSTOMIZATION[product.id] ? customizationAll[product.id] : null;
  const [f, setF] = useState({
    name: product.name,
    tagline: product.tagline,
    price: numText(product.price),
    oldPrice: numText(product.oldPrice),
    stock: String(product.stock),
    badge: product.badge,
    bestSeller: !!product.bestSeller,
    active: product.active,
    customEnabled: base ? base.enabled : false,
    customFee: base ? numText(base.fee) : "",
    customMax: base ? String(base.max) : "",
  });
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const set = (k, v) => { setF((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const edited = !!data.products[product.id] || !!data.customization[product.id];
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const price = parseNum(f.price);
  const oldPrice = f.oldPrice.trim() ? parseNum(f.oldPrice) : null;
  const off = oldPrice && price && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

  const save = (e) => {
    e.preventDefault();
    const er = {};
    const stock = parseInt(f.stock, 10);
    if (!f.name.trim()) er.name = "Digite o nome do produto.";
    if (!(price > 0)) er.price = "Digite um preço maior que zero.";
    if (oldPrice !== null && !(oldPrice > price)) er.oldPrice = "O preço antigo precisa ser maior que o preço atual.";
    if (!Number.isInteger(stock) || stock < 0) er.stock = "Digite um número inteiro (0 ou mais).";
    let fee = 0, max = 0;
    if (base) {
      fee = parseNum(f.customFee);
      max = parseInt(f.customMax, 10);
      if (!(fee >= 0)) er.customFee = "Digite uma taxa válida.";
      if (!(max >= 3 && max <= 24)) er.customMax = "Use entre 3 e 24 caracteres.";
    }
    setErrors(er);
    if (Object.keys(er).length) return;
    onSave(product.id, {
      name: f.name.trim(),
      tagline: f.tagline.trim(),
      price: round2(price),
      oldPrice: oldPrice === null ? null : round2(oldPrice),
      stock,
      badge: f.badge.trim() || product.badge,
      bestSeller: f.bestSeller,
      active: f.active,
    });
    if (base) onSaveCustom(product.id, { enabled: f.customEnabled, fee: round2(fee), max });
    notify(`${f.name.trim()} atualizado`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Editar ${product.name}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={save} className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-page shadow-2xl sm:rounded-[2rem]" noValidate>
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-stone-200 bg-page/95 px-6 py-4 backdrop-blur">
          <SafeImage src={product.image} alt={product.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Editar produto</p>
            <p className="truncate font-serif text-xl text-stone-900">{product.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-stone-600 hover:bg-stone-200" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Visibilidade */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-surface p-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">Mostrar na loja</p>
              <p className="text-xs text-stone-500">Desligado, o produto some do catálogo, mas continua nos pedidos antigos.</p>
            </div>
            <Switch id="edit-ativo" checked={f.active} onChange={(v) => set("active", v)} label="Mostrar na loja" />
          </div>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">Informações</legend>
            <Field label="Nome" value={f.name} onChange={(v) => set("name", v)} error={errors.name} maxLength={40} />
            <Field label="Selo do card" value={f.badge} onChange={(v) => set("badge", v)} maxLength={18} placeholder="Ex.: Lançamento" />
            <Field label="Frase curta" value={f.tagline} onChange={(v) => set("tagline", v)} maxLength={80} className="sm:col-span-2" />
            <label className="flex cursor-pointer items-center gap-3 text-sm text-stone-700 sm:col-span-2">
              <input id="edit-mais-vendido" type="checkbox" checked={f.bestSeller} onChange={(e) => set("bestSeller", e.target.checked)} className="h-4 w-4 accent-emerald-700" />
              Destacar o selo em verde (mais vendido)
            </label>
          </fieldset>

          <fieldset className="grid gap-3 sm:grid-cols-3">
            <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">Preço e estoque</legend>
            <NumField id="edit-preco" label="Preço" prefix="R$" value={f.price} onChange={(v) => set("price", v)} error={errors.price} />
            <NumField
              id="edit-preco-antigo"
              label="Preço antigo (promoção)"
              prefix="R$"
              value={f.oldPrice}
              onChange={(v) => set("oldPrice", v)}
              error={errors.oldPrice}
              placeholder="Sem promoção"
              hint={off ? `Mostra -${off}% no card` : "Deixe vazio para tirar a promoção"}
            />
            <div>
              <NumField id="edit-estoque" label="Estoque" suffix="un." value={f.stock} onChange={(v) => set("stock", v.replace(/\D/g, ""))} error={errors.stock} />
              <div className="mt-1.5 flex gap-1.5">
                {[10, 50].map((n) => (
                  <button key={n} type="button" onClick={() => set("stock", String((parseInt(f.stock, 10) || 0) + n))} className="rounded-full border border-stone-300 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600 hover:border-stone-500">
                    +{n}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>

          {base && (
            <fieldset className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <legend className="sr-only">Personalização</legend>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-stone-900"><PenLine className="h-4 w-4 text-amber-700" /> Personalização com nome</p>
                  <p className="text-xs text-stone-500">{base.label}</p>
                </div>
                <Switch id="edit-personalizacao" checked={f.customEnabled} onChange={(v) => set("customEnabled", v)} label="Permitir personalização" />
              </div>
              {f.customEnabled && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <NumField id="edit-taxa" label="Taxa da personalização" prefix="R$" value={f.customFee} onChange={(v) => set("customFee", v)} error={errors.customFee} />
                  <NumField id="edit-max" label="Limite de caracteres" suffix="letras" value={f.customMax} onChange={(v) => set("customMax", v.replace(/\D/g, ""))} error={errors.customMax} />
                </div>
              )}
            </fieldset>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-page/95 px-6 py-4 backdrop-blur">
          <div>
            {edited && (confirmReset ? (
              <ConfirmInline
                question="Voltar aos valores originais?"
                confirmLabel="Restaurar"
                onConfirm={() => { onReset(product.id); notify(`${product.name} voltou ao padrão`); onClose(); }}
                onCancel={() => setConfirmReset(false)}
              />
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800">
                <RotateCcw className="h-3.5 w-3.5" /> Restaurar padrão
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-500">Cancelar</button>
            <button className="rounded-full bg-emerald-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">Salvar alterações</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function CouponsPanel({ onSave, onDelete, notify, orders }) {
  const { coupons } = useStore();
  const [form, setForm] = useState(EMPTY_COUPON);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [confirmDel, setConfirmDel] = useState(null);
  const set = (k, v) => { setForm((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const startEdit = (c) => {
    setEditing(c.code);
    setErrors({});
    setForm({ code: c.code, type: c.type, value: numText(c.value), minOrder: c.minOrder ? numText(c.minOrder) : "", label: c.label || "", active: c.active });
  };
  const cancel = () => { setEditing(null); setForm(EMPTY_COUPON); setErrors({}); };

  const submit = (e) => {
    e.preventDefault();
    const code = form.code.trim().toUpperCase();
    const value = parseNum(form.value);
    const minOrder = form.minOrder.trim() ? parseNum(form.minOrder) : 0;
    const er = {};
    if (!/^[A-Z0-9]{3,15}$/.test(code)) er.code = "Use de 3 a 15 letras ou números, sem espaços.";
    else if (coupons.some((c) => c.code === code && c.code !== editing)) er.code = "Já existe um cupom com esse código.";
    if (!(value > 0)) er.value = "Digite um valor maior que zero.";
    else if (form.type === "percent" && value > 90) er.value = "O desconto máximo é 90%.";
    if (!(minOrder >= 0)) er.minOrder = "Digite um valor válido.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const old = coupons.find((c) => c.code === editing);
    onSave({ code, type: form.type, value: round2(value), minOrder: round2(minOrder), label: form.label.trim(), active: form.active, uses: old ? old.uses : 0 }, editing);
    notify(editing ? `Cupom ${code} atualizado` : `Cupom ${code} criado`);
    cancel();
  };

  const revenueBy = (code) => orders.filter((o) => o.coupon === code).reduce((a, o) => a + o.total, 0);

  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-stone-200 bg-surface p-6 lg:sticky lg:top-40" noValidate>
        <div>
          <h2 className="text-lg font-semibold text-stone-900">{editing ? `Editar ${editing}` : "Novo cupom"}</h2>
          <p className="text-xs text-stone-500">O cliente digita o código no carrinho.</p>
        </div>
        <Field label="Código" value={form.code} onChange={(v) => set("code", v.toUpperCase().replace(/\s/g, ""))} error={errors.code} placeholder="Ex.: NATAL25" maxLength={15} />
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-stone-700">Tipo de desconto</span>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
            {[{ id: "percent", label: "Porcentagem (%)" }, { id: "fixed", label: "Valor fixo (R$)" }].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => set("type", t.id)}
                className={`rounded-lg py-2 text-xs font-semibold transition ${form.type === t.id ? "bg-surface text-emerald-800 shadow-sm" : "text-stone-500"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumField
            id="cupom-valor"
            label="Desconto"
            prefix={form.type === "fixed" ? "R$" : undefined}
            suffix={form.type === "percent" ? "%" : undefined}
            value={form.value}
            onChange={(v) => set("value", v)}
            error={errors.value}
          />
          <NumField id="cupom-minimo" label="Pedido mínimo" prefix="R$" value={form.minOrder} onChange={(v) => set("minOrder", v)} error={errors.minOrder} placeholder="Sem mínimo" />
        </div>
        <Field label="Descrição para o cliente (opcional)" value={form.label} onChange={(v) => set("label", v)} maxLength={40} placeholder="Ex.: Presente de Natal" />
        <div className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
          <span className="text-sm font-medium text-stone-700">Cupom ativo</span>
          <Switch id="cupom-ativo" checked={form.active} onChange={(v) => set("active", v)} label="Cupom ativo" />
        </div>
        <div className="flex gap-2">
          {editing && <button type="button" onClick={cancel} className="flex-1 rounded-full border border-stone-300 py-3 text-sm font-semibold text-stone-700">Cancelar</button>}
          <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-900 py-3 text-sm font-semibold text-white transition hover:brightness-110">
            {editing ? "Salvar cupom" : <><Plus className="h-4 w-4" /> Criar cupom</>}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {coupons.length === 0 && (
          <div className="rounded-3xl border border-dashed border-stone-300 p-12 text-center text-sm text-stone-500">
            <Tag className="mx-auto mb-3 h-8 w-8 text-stone-300" />
            Nenhum cupom ainda. Crie o primeiro no formulário.
          </div>
        )}
        {coupons.map((c) => (
          <div key={c.code} className={`rounded-2xl border bg-surface p-5 transition ${editing === c.code ? "border-emerald-700 ring-2 ring-emerald-700/15" : "border-stone-200"} ${c.active ? "" : "opacity-70"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.active ? "bg-emerald-900 text-white" : "bg-stone-200 text-stone-500"}`}>
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-lg font-bold tracking-wider text-stone-900">{c.code}</p>
                  <p className="text-xs text-stone-500">{couponLabel(c)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${c.active ? "text-emerald-700" : "text-stone-500"}`}>{c.active ? "Ativo" : "Pausado"}</span>
                <Switch id={`cupom-${c.code}`} checked={c.active} onChange={(v) => { onSave({ ...c, active: v }, c.code); notify(`${c.code} ${v ? "ativado" : "pausado"}`); }} label={`Ativar ${c.code}`} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              {[
                { l: "Desconto", v: couponValueText(c) },
                { l: "Pedido mínimo", v: c.minOrder ? formatBRL(c.minOrder) : "Nenhum" },
                { l: "Usos", v: c.uses || 0 },
                { l: "Vendas com ele", v: formatBRL(revenueBy(c.code)) },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-stone-50 px-2 py-2">
                  <p className="text-sm font-bold tabular-nums text-stone-900">{s.v}</p>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              {confirmDel === c.code ? (
                <ConfirmInline
                  question={`Excluir ${c.code}?`}
                  confirmLabel="Excluir"
                  onConfirm={() => { onDelete(c.code); setConfirmDel(null); if (editing === c.code) cancel(); notify(`Cupom ${c.code} excluído`); }}
                  onCancel={() => setConfirmDel(null)}
                />
              ) : (
                <>
                  <button onClick={() => setConfirmDel(c.code)} className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" /> Excluir
                  </button>
                  <button onClick={() => startEdit(c)} className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-500">
                    <PenLine className="h-3.5 w-3.5" /> Editar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Aba de configurações da loja */
export function SettingsPanel({ onSave, onResetStore, onResetOrders, onLoadDemo, onClearDemo, demoCount, notify }) {
  const [demoBusy, setDemoBusy] = useState(false);
  const runDemo = async (fn) => { setDemoBusy(true); try { await fn(); } finally { setDemoBusy(false); } };
  const cloud = useCloud();
  const { settings } = useStore();
  const [f, setF] = useState({
    freeShipping: numText(settings.freeShipping),
    shippingFee: numText(settings.shippingFee),
    pixDiscount: numText(settings.pixDiscount),
    giftFee: numText(settings.giftFee),
    lowStock: String(settings.lowStock),
    announcement: settings.announcement,
    pixKey: settings.pixKey,
    pixName: settings.pixName,
    pixCity: settings.pixCity,
    donationsEnabled: settings.donationsEnabled,
  });
  // Frete por região: começa com a tabela salva ou com o valor único atual
  const [reg, setReg] = useState(() => {
    const t = settings.freteRegioes || defaultFreteRegioes(settings.shippingFee);
    return Object.fromEntries(REGIOES.map((r) => { const x = t[r.id] || { fee: settings.shippingFee, min: 3, max: 8 }; return [r.id, { fee: numText(x.fee), min: String(x.min), max: String(x.max) }]; }));
  });
  const setR = (id, k, v) => setReg((s) => ({ ...s, [id]: { ...s[id], [k]: v } }));
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});
  const [confirm, setConfirm] = useState(null);
  const set = (k, v) => { setF((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const setP = (k, v) => { setPw((s) => ({ ...s, [k]: v })); setPwErrors((e) => ({ ...e, [k]: undefined })); };

  const preview = f.announcement.trim() || autoAnnouncement({
    freeShipping: parseNum(f.freeShipping) || 0,
    pixDiscount: parseNum(f.pixDiscount) || 0,
  });

  const saveRules = (e) => {
    e.preventDefault();
    const v = {
      freeShipping: parseNum(f.freeShipping),
      shippingFee: parseNum(f.shippingFee),
      pixDiscount: parseNum(f.pixDiscount),
      giftFee: parseNum(f.giftFee),
      lowStock: parseInt(f.lowStock, 10),
    };
    const er = {};
    if (!(v.freeShipping >= 0)) er.freeShipping = "Digite um valor válido.";
    if (!(v.shippingFee >= 0)) er.shippingFee = "Digite um valor válido.";
    if (!(v.pixDiscount >= 0 && v.pixDiscount <= 50)) er.pixDiscount = "Use entre 0 e 50%.";
    if (!(v.giftFee >= 0)) er.giftFee = "Digite um valor válido.";
    if (!(v.lowStock >= 0)) er.lowStock = "Digite um número inteiro.";
    if (!f.pixKey.trim()) er.pixKey = "Digite a chave PIX que vai receber os pagamentos.";
    else if (/\s/.test(f.pixKey.trim())) er.pixKey = "A chave PIX não pode ter espaços.";
    if (!pixText(f.pixName, 25)) er.pixName = "Digite o nome do recebedor.";
    if (!pixText(f.pixCity, 15)) er.pixCity = "Digite a cidade.";
    const freteRegioes = {};
    REGIOES.forEach((r) => {
      const fee = parseNum(reg[r.id].fee), min = parseInt(reg[r.id].min, 10), max = parseInt(reg[r.id].max, 10);
      if (!(fee >= 0) || !(min >= 0) || !(max >= min)) er.freteRegioes = `Confira a linha "${r.label}": valor e prazo (o máximo não pode ser menor que o mínimo).`;
      freteRegioes[r.id] = { fee: round2(fee), min, max };
    });
    setErrors(er);
    if (Object.keys(er).length) return;
    onSave({
      freteRegioes,
      freeShipping: round2(v.freeShipping),
      shippingFee: round2(v.shippingFee),
      pixDiscount: round2(v.pixDiscount),
      giftFee: round2(v.giftFee),
      lowStock: v.lowStock,
      announcement: f.announcement.trim(),
      pixKey: f.pixKey.trim(),
      pixName: pixText(f.pixName, 25),
      pixCity: pixText(f.pixCity, 15),
      donationsEnabled: f.donationsEnabled,
    });
    notify("Configurações salvas. A loja já está usando os novos valores.");
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const er = {};
    if (!(await conferirSenha(pw.current, settings))) er.current = "A senha atual está errada.";
    if (pw.next.length < 6) er.next = "Use pelo menos 6 caracteres.";
    if (pw.next !== pw.confirm) er.confirm = "As senhas não são iguais.";
    setPwErrors(er);
    if (Object.keys(er).length) return;
    // Guarda só o resumo; o campo antigo em texto é apagado
    onSave({ adminPasswordHash: await hashSenha(pw.next), adminPassword: undefined });
    setPw({ current: "", next: "", confirm: "" });
    notify("Senha do painel alterada");
  };

  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
      <form onSubmit={saveRules} className="space-y-6 rounded-3xl border border-stone-200 bg-surface p-6" noValidate>
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Regras da loja</h2>
          <p className="text-xs text-stone-500">Valem para o carrinho, o checkout e os textos do site.</p>
        </div>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">Frete</legend>
          <NumField id="cfg-frete-gratis" label="Frete grátis a partir de" prefix="R$" value={f.freeShipping} onChange={(v) => set("freeShipping", v)} error={errors.freeShipping} />
          <NumField id="cfg-frete" label="Frete sem CEP informado" prefix="R$" value={f.shippingFee} onChange={(v) => set("shippingFee", v)} error={errors.shippingFee} hint="Usado antes do cliente digitar o CEP" />
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-semibold text-stone-700">Valor e prazo por região (o cliente vê ao digitar o CEP)</p>
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500">
                  <tr><th className="px-3 py-2 font-semibold">Região</th><th className="px-2 py-2 font-semibold">Frete (R$)</th><th className="px-2 py-2 font-semibold">Prazo (dias úteis)</th></tr>
                </thead>
                <tbody>
                  {REGIOES.map((r) => (
                    <tr key={r.id} className="border-t border-stone-200">
                      <th scope="row" className="px-3 py-2 font-medium text-stone-700">{r.label}</th>
                      <td className="px-2 py-1.5">
                        <input aria-label={`Frete ${r.label}`} inputMode="decimal" value={reg[r.id].fee} onChange={(e) => setR(r.id, "fee", e.target.value)} className="w-20 rounded-lg border border-stone-300 bg-page px-2 py-1.5 outline-none focus:border-emerald-700" />
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="inline-flex items-center gap-1">
                          <input aria-label={`Prazo mínimo ${r.label}`} inputMode="numeric" value={reg[r.id].min} onChange={(e) => setR(r.id, "min", e.target.value.replace(/D/g, ""))} className="w-12 rounded-lg border border-stone-300 bg-page px-2 py-1.5 outline-none focus:border-emerald-700" />
                          a
                          <input aria-label={`Prazo máximo ${r.label}`} inputMode="numeric" value={reg[r.id].max} onChange={(e) => setR(r.id, "max", e.target.value.replace(/D/g, ""))} className="w-12 rounded-lg border border-stone-300 bg-page px-2 py-1.5 outline-none focus:border-emerald-700" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.freteRegioes && <p className="mt-1.5 text-xs text-rose-700">{errors.freteRegioes}</p>}
          </div>
        </fieldset>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">Pagamento e extras</legend>
          <NumField id="cfg-pix" label="Desconto no PIX" suffix="%" value={f.pixDiscount} onChange={(v) => set("pixDiscount", v)} error={errors.pixDiscount} />
          <NumField id="cfg-presente" label="Embalagem para presente" prefix="R$" value={f.giftFee} onChange={(v) => set("giftFee", v)} error={errors.giftFee} />
          <NumField id="cfg-estoque" label="Alerta de estoque baixo" suffix="un." value={f.lowStock} onChange={(v) => set("lowStock", v.replace(/\D/g, ""))} error={errors.lowStock} hint="Avisa no painel e mostra “últimas unidades” na loja" />
        </fieldset>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">Recebimento via PIX</legend>
          <Field label="Chave PIX" value={f.pixKey} onChange={(v) => set("pixKey", v)} error={errors.pixKey} maxLength={77} className="sm:col-span-2" />
          <Field label="Nome do recebedor" value={f.pixName} onChange={(v) => set("pixName", v)} error={errors.pixName} maxLength={25} />
          <Field label="Cidade" value={f.pixCity} onChange={(v) => set("pixCity", v)} error={errors.pixCity} maxLength={15} />
          <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 px-4 py-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium text-stone-700">Mostrar a seção “Doar” na loja</p>
              <p className="text-[11px] text-stone-500">Doações usam a mesma chave PIX, sem frete.</p>
            </div>
            <Switch id="cfg-doacoes" checked={f.donationsEnabled} onChange={(v) => set("donationsEnabled", v)} label="Mostrar a seção Doar" />
          </div>
          <p className="text-[11px] text-stone-500 sm:col-span-2">
            O cliente que escolhe PIX recebe um QR Code e o código copia e cola com o valor do pedido. Confira no extrato do banco antes de mudar o pedido para “Em Processamento”.
          </p>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">Aviso no topo do site</legend>
          <Field label="Texto do aviso" value={f.announcement} onChange={(v) => set("announcement", v)} maxLength={90} placeholder="Vazio = texto automático com frete e PIX" />
          <div className="palette-light mt-3 rounded-xl bg-emerald-950 px-4 py-2 text-center text-xs text-emerald-50">
            <Truck className="mr-1.5 inline h-3.5 w-3.5" /> {preview}
          </div>
        </fieldset>
        <button className="w-full rounded-full bg-emerald-900 py-3.5 text-sm font-semibold text-white transition hover:brightness-110">Salvar regras</button>
      </form>

      <div className="space-y-6">
        {cloud.provider === "firebase" && !cloud.noAuth ? (
          <div className="space-y-2 rounded-3xl border border-stone-200 bg-surface p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900"><Lock className="h-5 w-5 text-emerald-700" /> Acesso da equipe</h2>
            <p className="text-sm text-stone-600">
              No site publicado, a equipe entra com a conta do Firebase. Para trocar a senha ou incluir alguém,
              use o console do Firebase (Authentication) e a lista de e-mails da equipe no código e nas regras.
            </p>
            <p className="text-xs text-stone-500">Equipe hoje: {FIREBASE_ADMINS.join(", ")}</p>
          </div>
        ) : (
        <form onSubmit={savePassword} className="space-y-3 rounded-3xl border border-stone-200 bg-surface p-6" noValidate>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900"><Lock className="h-5 w-5 text-emerald-700" /> Senha do painel</h2>
            <p className="text-xs text-stone-500">A nova senha vale a partir do próximo login neste navegador.</p>
          </div>
          <Field label="Senha atual" type="password" value={pw.current} onChange={(v) => setP("current", v)} error={pwErrors.current} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nova senha" type="password" value={pw.next} onChange={(v) => setP("next", v)} error={pwErrors.next} />
            <Field label="Repita a nova senha" type="password" value={pw.confirm} onChange={(v) => setP("confirm", v)} error={pwErrors.confirm} />
          </div>
          <button className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-ink-fg transition hover:opacity-90">Alterar senha</button>
        </form>
        )}

        <div className="space-y-4 rounded-3xl border border-rose-200 bg-surface p-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Dados de demonstração</h2>
            <p className="text-xs text-stone-500">Útil para reapresentar o projeto do zero.</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">Cadastros de exemplo</p>
              <p className="text-xs text-stone-500">
                {demoCount
                  ? `${demoCount} clientes de exemplo carregados, com pedidos, mensagens e doações. Não mexem no estoque.`
                  : `${DEMO_PEOPLE.length} clientes com pedidos dos últimos 3 meses, mensagens e doações. Não mexem no estoque.`}
              </p>
            </div>
            {demoBusy ? (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-700" /> Gravando…</span>
            ) : demoCount ? (
              confirm === "demo" ? (
                <ConfirmInline question="Apagar todos os exemplos?" confirmLabel="Apagar" onConfirm={() => { setConfirm(null); runDemo(onClearDemo); }} onCancel={() => setConfirm(null)} />
              ) : (
                <button onClick={() => setConfirm("demo")} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:border-stone-500">Apagar exemplos</button>
              )
            ) : (
              <button onClick={() => runDemo(onLoadDemo)} className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:brightness-110">Carregar exemplos</button>
            )}
          </div>
          {cloud.status !== "online" && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">Restaurar pedidos de exemplo</p>
              <p className="text-xs text-stone-500">Apaga os pedidos atuais e volta aos {MOCK_ORDERS.length} de exemplo.</p>
            </div>
            {confirm === "orders" ? (
              <ConfirmInline question="Tem certeza?" confirmLabel="Restaurar" onConfirm={() => { onResetOrders(); setConfirm(null); }} onCancel={() => setConfirm(null)} />
            ) : (
              <button onClick={() => setConfirm("orders")} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:border-stone-500">Restaurar pedidos</button>
            )}
          </div>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">Restaurar a loja</p>
              <p className="text-xs text-stone-500">Preços, estoque, cupons, regras e senha voltam ao padrão.</p>
            </div>
            {confirm === "store" ? (
              <ConfirmInline question="Desfazer todas as alterações?" confirmLabel="Restaurar" onConfirm={() => { onResetStore(); setConfirm(null); }} onCancel={() => setConfirm(null)} />
            ) : (
              <button onClick={() => setConfirm("store")} className="rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Restaurar loja</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DonationsPanel({ donations, onUpdate, onDelete, notify }) {
  const [filter, setFilter] = useState("Todas");
  const [confirmDel, setConfirmDel] = useState(null);
  const received = donations.filter((d) => d.status === "Recebida");
  const waiting = donations.filter((d) => d.status === "Aguardando");
  const list = [...donations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((d) => filter === "Todas" || d.status === filter);
  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Heart} label="Doações recebidas" value={formatBRL(received.reduce((a, d) => a + d.amount, 0))} sub={`${received.length} confirmadas`} tone="bg-rose-50 text-rose-700" />
        <KpiCard icon={Clock} label="Aguardando conferência" value={formatBRL(waiting.reduce((a, d) => a + d.amount, 0))} sub={`${waiting.length} para conferir no extrato`} tone="bg-amber-50 text-amber-700" />
        <KpiCard icon={Users} label="Apoiadores" value={new Set(donations.map((d) => (d.name || "anônimo").toLowerCase())).size} sub="Nomes diferentes (anônimos contam como 1)" tone="bg-emerald-50 text-emerald-800" />
      </div>
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-surface">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Doações</h2>
            <p className="text-xs text-stone-500">Confira no extrato o PIX com o identificador da doação (ex.: DO1001) e marque como recebida.</p>
          </div>
          <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
            {["Todas", "Aguardando", "Recebida"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === f ? "bg-surface text-emerald-800 shadow-sm" : "text-stone-500"}`}
              >
                {f === "Recebida" ? "Recebidas" : f}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <div className="p-12 text-center text-sm text-stone-500">
            <Heart className="mx-auto mb-3 h-8 w-8 text-stone-300" />
            {donations.length === 0 ? "Nenhuma doação ainda. Elas aparecem aqui quando alguém usa a seção “Doar” da loja." : "Nenhuma doação com esse filtro."}
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {list.map((d) => (
              <li key={d.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                    <Heart className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900">
                      {d.name || "Anônimo"} <span className="ml-1 font-mono text-xs font-bold text-emerald-800">{d.id.replace("-", "")}</span>
                    </p>
                    <p className="text-xs text-stone-500">{formatDateTime(d.createdAt)}</p>
                    {d.message && <p className="mt-1 font-serif text-sm italic text-stone-700">“{d.message}”</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <p className="text-lg font-bold tabular-nums text-stone-900">{formatBRL(d.amount)}</p>
                  {d.status === "Aguardando" ? (
                    <button
                      onClick={() => { onUpdate(d.id, { status: "Recebida" }); notify(`Doação ${d.id} marcada como recebida`); }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Marcar recebida
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdate(d.id, { status: "Aguardando" })}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${DONATION_STATUS.Recebida.color}`}
                      title="Voltar para aguardando"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${DONATION_STATUS.Recebida.dot}`} /> Recebida
                    </button>
                  )}
                  {confirmDel === d.id ? (
                    <ConfirmInline question="Excluir?" confirmLabel="Excluir" onConfirm={() => { onDelete(d.id); setConfirmDel(null); notify(`Doação ${d.id} excluída`); }} onCancel={() => setConfirmDel(null)} />
                  ) : (
                    <button onClick={() => setConfirmDel(d.id)} className="rounded-full p-2 text-stone-400 hover:text-rose-600" aria-label={`Excluir doação ${d.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
