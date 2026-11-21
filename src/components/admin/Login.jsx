import React, { useState } from "react";
import { useCloud } from "../../lib/contextos";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, Lock, Mail, MessageCircle, Package, Sparkles } from "../../lib/icones";
import { authMessage, isTeamEmail } from "../../lib/nuvem";

/** Campo com ícone, no estilo vidro */
function CampoVidro({ id, label, icon: Icon, type = "text", value, onChange, autoComplete, placeholder, children }) {
  return (
    <label htmlFor={id} className="block">
      <span className="sr-only">{label}</span>
      <span className="flex items-center gap-3 border-b border-white/15 pb-2.5 transition focus-within:border-[rgb(var(--destaque))]">
        <Icon className="h-4 w-4 shrink-0 text-stone-500" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-500"
        />
        {children}
      </span>
    </label>
  );
}

/** Tela de login do Painel Admin: só a conta da equipe no Firebase (e-mail e senha) */
export function AdminLogin({ onLogin, onBack }) {
  const cloud = useCloud();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const change = (set) => (v) => { set(v); setError(""); setInfo(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (!isTeamEmail(email.trim())) return setError("Esse e-mail não faz parte da equipe Farmaura.");
    if (!cloud.auth) return setError("Sem conexão com o banco de dados. Tente de novo em alguns segundos.");
    setBusy(true);
    try {
      const cred = await cloud.auth.signIn(email.trim(), password);
      // As regras do banco só aceitam a equipe com o e-mail confirmado
      if (!cred.user.emailVerified) {
        await cloud.auth.sendVerification(cred.user);
        await cloud.auth.signOut();
        setError("Confirme o e-mail da equipe: enviamos um link para a caixa de entrada. Depois, entre de novo.");
        setBusy(false);
        return;
      }
      setError("");
      onLogin();
    } catch (err) {
      setError(authMessage(err));
    }
    setBusy(false);
  };

  const forgot = async () => {
    if (!isTeamEmail(email.trim())) return setError("Digite acima o e-mail da equipe para receber o link.");
    if (!cloud.auth) return setError("Sem conexão com o banco de dados. Tente de novo em alguns segundos.");
    try {
      await cloud.auth.resetPassword(email.trim());
      setInfo("Enviamos um link para criar uma senha nova. Confira a caixa de entrada.");
    } catch (err) {
      setError(authMessage(err));
    }
  };

  return (
    <div className="vidro flex flex-col px-4 py-5 sm:px-6">
      <div className="vidro-fundo" aria-hidden="true" />

      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2.5 rounded-2xl bg-surface vidro-borda px-3 py-2 text-sm font-semibold text-stone-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-destaque text-destaque-fg"><Leaf className="h-4 w-4" /></span>
          Farmaura <span className="font-normal text-stone-500">· Painel</span>
        </span>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full bg-surface vidro-borda px-4 py-2 text-xs font-semibold text-stone-800 transition hover:text-stone-950">
          Ver a loja <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <main className="flex flex-1 items-center justify-center py-10">
        <div className="grid w-full max-w-3xl overflow-hidden rounded-[2rem] bg-surface vidro-borda md:grid-cols-2">
          {/* Formulário */}
          <form onSubmit={submit} className="flex flex-col justify-center gap-6 p-8 sm:p-10" noValidate>
            <div>
              <h1 className="text-2xl font-bold text-stone-950">Entrar</h1>
              <p className="mt-1 text-xs text-stone-500">Conta da equipe cadastrada no Firebase.</p>
            </div>
            <CampoVidro id="login-email" label="E-mail da equipe" icon={Mail} type="email" value={email} onChange={change(setEmail)} autoComplete="username" placeholder="E-mail da equipe" />
            <CampoVidro id="login-senha" label="Senha" icon={Lock} type={show ? "text" : "password"} value={password} onChange={change(setPassword)} autoComplete="current-password" placeholder="Senha">
              <button type="button" onClick={() => setShow((v) => !v)} className="text-stone-500 transition hover:text-stone-900" aria-label={show ? "Esconder senha" : "Mostrar senha"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </CampoVidro>
            {error && <p role="alert" className="text-xs font-medium text-rose-700">{error}</p>}
            {info && <p role="status" className="text-xs font-medium text-emerald-700">{info}</p>}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-destaque py-3 text-sm font-semibold text-destaque-fg btn-glow transition hover:brightness-105 disabled:opacity-60">
              <Lock className="h-4 w-4" /> {busy ? "Entrando…" : "Entrar"}
            </button>
            <button type="button" onClick={forgot} className="self-center text-xs font-medium text-stone-500 underline-offset-4 transition hover:text-stone-900 hover:underline">
              Esqueci a senha
            </button>
          </form>

          {/* Boas-vindas */}
          <div className="relative flex flex-col justify-center gap-5 p-8 sm:p-10 md:[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)] md:pl-16"
            style={{ background: "linear-gradient(135deg, rgb(var(--destaque) / .16), rgb(16 185 129 / .08) 55%, rgb(255 255 255 / .03))" }}>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-stone-950">Olá,<br />equipe!</h2>
            <p className="max-w-xs text-sm text-stone-700">Pedidos, estoque, chat e a aparência da loja num lugar só.</p>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-emerald-700" /> Pedidos e estoque em tempo real</li>
              <li className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 text-emerald-700" /> Chat com os clientes</li>
              <li className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-emerald-700" /> Cores, textos e seções da loja</li>
            </ul>
            <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-1.5 rounded-full vidro-borda bg-white/5 px-4 py-2 text-xs font-semibold text-stone-800 transition hover:bg-white/10">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a loja
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
