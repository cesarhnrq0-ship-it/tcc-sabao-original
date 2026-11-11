import React, { useState } from "react";
import { Field } from "../ui";
import { useCloud, useStore } from "../../lib/contextos";
import { ArrowLeft, Eye, EyeOff, Lock } from "../../lib/icones";
import { authMessage, isTeamEmail } from "../../lib/nuvem";
import { conferirSenha } from "../../lib/seguranca";

/** Tela de login do Painel Admin */

export function AdminLogin({ onLogin, onBack }) {
  const cloud = useCloud();
  if (cloud.provider === "firebase" && !cloud.noAuth) return <FirebaseAdminLogin onLogin={onLogin} onBack={onBack} />;
  return <PasswordAdminLogin onLogin={onLogin} onBack={onBack} />;
}

/** Entrada da equipe com a conta do Firebase (e-mail e senha) */
export function FirebaseAdminLogin({ onLogin, onBack }) {
  const cloud = useCloud();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!isTeamEmail(email.trim())) return setError("Esse e-mail não faz parte da equipe Farmaura.");
    if (!cloud.auth) return setError("Conectando ao banco de dados… tente em alguns segundos.");
    setBusy(true);
    try {
      await cloud.auth.signIn(email.trim(), password);
      setError("");
      onLogin();
    } catch (err) {
      setError(authMessage(err));
    }
    setBusy(false);
  };
  return (
    <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-[2rem] border border-stone-200 bg-surface p-8 shadow-xl shadow-black/5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900 text-white">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-center font-serif text-3xl text-stone-900">Painel Admin</h1>
        <p className="mt-2 text-center text-sm text-stone-500">Entre com o e-mail e a senha da equipe cadastrados no Firebase.</p>
        <form onSubmit={submit} className="mt-8 space-y-3" noValidate>
          <Field label="E-mail da equipe" type="email" value={email} onChange={(v) => { setEmail(v); setError(""); }} placeholder="farmaurainc@gmail.com" />
          <Field label="Senha" type="password" value={password} onChange={(v) => { setPassword(v); setError(""); }} />
          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
            <Lock className="h-4 w-4" /> {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <button onClick={onBack} className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a loja
        </button>
      </div>
    </main>
  );
}

/** Entrada com a senha do painel (link do Claude e modo local) */
export function PasswordAdminLogin({ onLogin, onBack }) {
  const { settings } = useStore();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    if (await conferirSenha(password, settings)) {
      setError("");
      onLogin();
      return;
    }
    setAttempts((n) => n + 1);
    setError(attempts >= 2 ? "Senha incorreta de novo. Confira maiúsculas e minúsculas." : "Senha incorreta. Tente novamente.");
    setPassword("");
  };

  return (
    <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-[2rem] border border-stone-200 bg-surface p-8 shadow-xl shadow-black/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900 text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-center font-serif text-3xl text-stone-900">Painel Admin</h1>
          <p className="mt-2 text-center text-sm text-stone-500">Área restrita da equipe Farmaura. Digite a senha para continuar.</p>
          <form onSubmit={submit} className="mt-8 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-700">Senha</span>
              <div className="relative">
                <input
                  id="admin-senha"
                  type={show ? "text" : "password"}
                  value={password}
                  autoFocus
                  autoComplete="current-password"
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`w-full rounded-xl border bg-page px-4 py-3 pr-11 text-sm outline-none transition focus:ring-2 ${
                    error ? "border-rose-400 focus:ring-rose-500/15" : "border-stone-300 focus:border-emerald-700 focus:ring-emerald-700/15"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  aria-label={show ? "Esconder senha" : "Mostrar senha"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
            </label>
            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 py-3.5 text-sm font-semibold text-white transition hover:brightness-110">
              <Lock className="h-4 w-4" /> Entrar
            </button>
          </form>
          <button onClick={onBack} className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a loja
          </button>
        </div>
      </div>
    </main>
  );
}
