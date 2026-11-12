import React, { useEffect, useState } from "react";
import { Field } from "../ui";
import { useCloud, useStore } from "../../lib/contextos";
import { Leaf, MessageCircle, Send, X } from "../../lib/icones";
import { assistantAnswer, buildAssistant, chatTime, chatUnread } from "../../lib/util";

/** Lista de mensagens com rolagem automática para a mais nova */
export function ChatMessages({ messages, me, welcome }) {
  const endRef = React.useRef(null);
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ block: "end" });
  }, [messages.length]);
  return (
    <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4" aria-live="polite">
      {welcome && (
        <div className="flex">
          <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2.5 text-sm text-stone-800 shadow-sm ring-1 ring-stone-200">{welcome}</p>
        </div>
      )}
      {messages.map((m) => {
        const mine = m.from === me;
        return (
          <div key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
              mine ? "rounded-br-md bg-emerald-900 text-white" : "rounded-bl-md bg-surface text-stone-800 ring-1 ring-stone-200"
            }`}>
              {m.from === "assistente" && <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Assistente virtual</p>}
              <p className="whitespace-pre-line break-words">{m.text}</p>
              <p className={`mt-0.5 text-right text-[10px] ${mine ? "text-white/60" : "text-stone-400"}`}>{chatTime(m.at)}</p>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

/** Caixa de digitar (Enter envia, Shift+Enter quebra linha) */
export function ChatInput({ onSend, placeholder = "Escreva sua mensagem", id }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    const ok = await onSend(t);
    setBusy(false);
    if (ok) setText("");
  };
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); send(); }}
      className="flex items-end gap-2 border-t border-stone-200 bg-surface p-3"
    >
      <textarea
        id={id}
        rows={1}
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder={placeholder}
        aria-label="Mensagem"
        className="max-h-28 min-h-[42px] flex-1 resize-none rounded-2xl border border-stone-300 bg-page px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
      />
      <button
        disabled={!text.trim() || busy}
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-emerald-900 text-white transition hover:brightness-110 disabled:opacity-40"
        aria-label="Enviar mensagem"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

/** Balão de chat da loja (lado do cliente) */
export function ChatWidget({ open, setOpen, chat, profile, onSend, onRead }) {
  const cloud = useCloud();
  const { settings, coupons } = useStore();
  const kb = buildAssistant(settings, coupons);
  const [who, setWho] = useState({ name: "", email: "" });
  const [whoError, setWhoError] = useState("");
  const [started, setStarted] = useState(false);
  const [pending, setPending] = useState(null); // mensagem esperando o nome
  const [assist, setAssist] = useState([]);     // conversa com o assistente (só neste aparelho)
  const stored = (chat && chat.mensagens) || [];
  const messages = [...stored, ...assist].sort((a, b) => String(a.at).localeCompare(String(b.at)));
  const unread = chatUnread(chat, "equipe");
  const known = !!(chat || profile || started);
  const firstName = ((chat && chat.name) || (profile && profile.name) || who.name || "").split(" ")[0];

  // Ao abrir a conversa, marca as respostas da equipe como lidas
  useEffect(() => {
    if (open && unread > 0) onRead();
  }, [open, unread]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const stamp = (offset = 0) => new Date(Date.now() + offset).toISOString();
  const bot = (text, offset = 1) => ({ id: `a${Date.now()}${Math.random().toString(36).slice(2, 5)}`, from: "assistente", text, at: stamp(offset) });

  /** Pergunta rápida: o assistente responde na hora (não vai para a equipe) */
  const ask = (k) => {
    setAssist((a) => [...a, { id: `q${Date.now()}`, from: "cliente", text: k.q, at: stamp() }, bot(k.a, 400)]);
  };

  const deliver = async (text, whoNow) => {
    const ok = await onSend(text, {
      name: (chat && chat.name) || (profile && profile.name) || whoNow.name.trim(),
      email: (chat && chat.email) || (profile && profile.email) || whoNow.email.trim(),
    });
    if (!ok) return false;
    const hit = assistantAnswer(text, kb);
    setAssist((a) => [
      ...a,
      bot(hit ? `${hit.a}\n\nSua mensagem também foi enviada para a equipe.` : "Recebemos sua mensagem! Um atendente da equipe vai responder aqui mesmo.", 400),
    ]);
    return true;
  };

  const send = async (text) => {
    if (!known) {
      setPending(text);
      return true;
    }
    return deliver(text, who);
  };

  const start = async (e) => {
    e.preventDefault();
    if (who.name.trim().length < 2) return setWhoError("Digite seu nome.");
    if (who.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(who.email.trim())) return setWhoError("Digite um e-mail válido ou deixe em branco.");
    setWhoError("");
    setStarted(true);
    if (pending) {
      const t = pending;
      setPending(null);
      await deliver(t, who);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden bg-page shadow-2xl ring-1 ring-stone-900/10 max-sm:inset-0 max-sm:pb-[env(safe-area-inset-bottom)] sm:bottom-24 sm:right-5 sm:h-[560px] sm:max-h-[calc(100vh-7rem)] sm:w-[380px] sm:rounded-3xl"
          role="dialog"
          aria-label="Chat com a Farmaura"
        >
          <div className="palette-light flex items-center gap-3 bg-emerald-900 px-4 py-3.5 text-white" style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top, 0px))" }}>
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Leaf className="h-5 w-5" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-900" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Atendimento Farmaura</p>
              <p className="text-xs text-white/70">Assistente virtual + equipe respondendo aqui</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10" aria-label="Fechar chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          {pending ? (
            <form onSubmit={start} className="flex flex-1 flex-col justify-center gap-4 p-6" noValidate>
              <div className="text-center">
                <MessageCircle className="mx-auto h-10 w-10 text-emerald-700" />
                <p className="mt-3 font-serif text-2xl text-stone-900">Antes de enviar</p>
                <p className="mt-1 text-sm text-stone-500">Diga como podemos te chamar para a equipe responder sua mensagem.</p>
              </div>
              <Field label="Seu nome" value={who.name} onChange={(v) => { setWho((w) => ({ ...w, name: v })); setWhoError(""); }} placeholder="Maria" maxLength={40} />
              <Field label="E-mail (opcional)" type="email" value={who.email} onChange={(v) => { setWho((w) => ({ ...w, email: v })); setWhoError(""); }} placeholder="Para respondermos se você sair" />
              {whoError && <p className="text-xs font-medium text-rose-600">{whoError}</p>}
              <button className="rounded-full bg-emerald-900 py-3.5 text-sm font-semibold text-white transition hover:brightness-110">Enviar mensagem</button>
              <button type="button" onClick={() => setPending(null)} className="text-xs font-semibold text-stone-500 hover:text-stone-800">Voltar</button>
            </form>
          ) : (
            <>
              <ChatMessages
                messages={messages}
                me="cliente"
                welcome={`Olá${firstName ? `, ${firstName}` : ""}! Sou o assistente da Farmaura. Escolha uma pergunta abaixo ou escreva a sua: se eu não souber, a equipe responde.`}
              />
              <div className="flex gap-2 overflow-x-auto border-t border-stone-200 bg-surface px-3 pt-3" aria-label="Perguntas rápidas">
                {kb.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => ask(k)}
                    className="shrink-0 rounded-full border border-emerald-700/30 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:border-emerald-700"
                  >
                    {k.q}
                  </button>
                ))}
              </div>
              {cloud.status === "local" && (
                <p className="bg-stone-100 px-4 py-1.5 text-center text-[11px] text-stone-500">Modo local: as mensagens ficam só neste navegador.</p>
              )}
              <ChatInput onSend={send} id="chat-cliente" />
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed z-40 flex h-12 w-12 items-center sm:h-14 sm:w-14 justify-center rounded-full bg-emerald-900 text-white shadow-xl shadow-emerald-900/30 transition hover:scale-105 max-sm:data-[open=true]:hidden"
        data-open={open}
        style={{ right: "max(1.25rem, env(safe-area-inset-right, 0px))", bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
        aria-label={open ? "Fechar chat" : unread ? `Abrir chat (${unread} ${unread === 1 ? "nova mensagem" : "novas mensagens"})` : "Abrir chat com a Farmaura"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white ring-2 ring-page">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
