import React, { useState } from "react";
import { Field } from "../ui";
import { useCloud } from "../../lib/contextos";
import { ArrowLeft, Lock } from "../../lib/icones";
import { authMessage, isTeamEmail } from "../../lib/nuvem";

/** Tela de login do Painel Admin: só a conta da equipe no Firebase (e-mail e senha) */
export function AdminLogin({ onLogin, onBack }) {
  const cloud = useCloud();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
