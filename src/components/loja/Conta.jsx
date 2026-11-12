import React, { useEffect, useState } from "react";
import { Field, StatusBadge } from "../ui";
import { BRAZIL_STATES, ORDER_STATUS } from "../../data/catalogo";
import { useCloud } from "../../lib/contextos";
import { Database, Heart, LogOut, Mail, MapPin, PenLine, Phone, X } from "../../lib/icones";
import { authMessage } from "../../lib/nuvem";
import { EMPTY_PROFILE, formatBRL, formatDateTime, maskCEP, maskPhone, validateProfile } from "../../lib/util";

export function AccountPanel({ open, onClose, profile, onSave, orders, donations, notify }) {
  const cloud = useCloud();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  // Firebase: conta com e-mail e senha para entrar de qualquer aparelho
  const fb = cloud.provider === "firebase" && cloud.status === "online";
  const needsPassword = fb && cloud.isAnonymous && !cloud.noAuth;
  const [mode, setMode] = useState("cadastro"); // "cadastro" | "entrar"
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [login, setLogin] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");

  const doLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setSaving(true);
    try {
      await cloud.auth.signIn(login.email.trim(), login.password);
      setLogin({ email: "", password: "" });
      setMode("cadastro");
      notify("Você entrou na sua conta");
    } catch (err) {
      setAuthError(authMessage(err));
    }
    setSaving(false);
  };
  const forgot = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login.email.trim())) return setAuthError("Digite seu e-mail acima para receber o link.");
    try {
      await cloud.auth.resetPassword(login.email.trim());
      notify("Enviamos um link para criar uma nova senha no seu e-mail.");
    } catch (err) {
      setAuthError(authMessage(err));
    }
  };
  /** Visitante que já tem cadastro (feito no checkout) cria a senha da conta */
  const createPassword = async (e) => {
    e.preventDefault();
    if (pw.password.length < 6) return setAuthError("A senha precisa ter pelo menos 6 caracteres.");
    if (pw.password !== pw.confirm) return setAuthError("As senhas não são iguais.");
    setSaving(true);
    try {
      await cloud.auth.signUp(profile.email, pw.password);
      setPw({ password: "", confirm: "" });
      setAuthError("");
      notify("Senha criada! Agora você entra na sua conta de qualquer aparelho.");
    } catch (err) {
      setAuthError(authMessage(err));
    }
    setSaving(false);
  };

  useEffect(() => {
    if (!open) return;
    setEditing(!profile);
    setAuthError("");
    setErrors({});
    setForm(profile ? { ...EMPTY_PROFILE, ...profile, ...(profile.address || {}) } : EMPTY_PROFILE);
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const submit = async (e) => {
    e.preventDefault();
    const er = validateProfile(form);
    if (needsPassword && !profile) {
      if (pw.password.length < 6) er.password = "A senha precisa ter pelo menos 6 caracteres.";
      else if (pw.password !== pw.confirm) er.confirm = "As senhas não são iguais.";
    }
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    if (needsPassword && !profile) {
      try {
        await cloud.auth.signUp(form.email.trim().toLowerCase(), pw.password);
        setPw({ password: "", confirm: "" });
      } catch (err) {
        setSaving(false);
        setAuthError(authMessage(err));
        return;
      }
    }
    const ok = await onSave({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      newsletter: !!form.newsletter,
      address: {
        zip: form.zip, street: form.street.trim(), number: form.number.trim(),
        district: form.district.trim(), city: form.city.trim(), state: form.state,
      },
    });
    setSaving(false);
    if (ok) {
      setEditing(false);
      notify(profile ? "Cadastro atualizado" : "Cadastro feito! Seus dados já aparecem no checkout.");
    }
  };

  if (!open) return null;
  const first = profile ? profile.name.split(" ")[0] : "";
  const myOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const myDonations = [...donations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Minha conta">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-page shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <h2 className="font-serif text-2xl text-stone-900">{profile ? `Olá, ${first}` : "Criar cadastro"}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-stone-200" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <p className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs ${cloud.status === "online" ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>
            <Database className="mt-px h-4 w-4 shrink-0" />
            {cloud.status === "online"
              ? cloud.noAuth
                ? "Seus dados ficam salvos no banco de dados da Farmaura, ligados a este aparelho."
                : "Seus dados ficam salvos no banco de dados da Farmaura, ligados à sua conta. Você vê seus pedidos de qualquer aparelho."
              : cloud.status === "connecting"
                ? "Conectando ao banco de dados…"
                : "Seus dados ficam salvos só neste navegador."}
          </p>

          {needsPassword && !profile && (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1" role="tablist">
              {[{ id: "cadastro", label: "Criar conta" }, { id: "entrar", label: "Já tenho conta" }].map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={mode === t.id}
                  onClick={() => { setMode(t.id); setAuthError(""); }}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${mode === t.id ? "bg-surface text-emerald-800 shadow-sm" : "text-stone-500"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {needsPassword && !profile && mode === "entrar" ? (
            <form onSubmit={doLogin} className="space-y-4" noValidate>
              <Field label="E-mail" type="email" value={login.email} onChange={(v) => { setLogin((l) => ({ ...l, email: v })); setAuthError(""); }} placeholder="maria@email.com" />
              <Field label="Senha" type="password" value={login.password} onChange={(v) => { setLogin((l) => ({ ...l, password: v })); setAuthError(""); }} />
              {authError && <p className="text-xs font-medium text-rose-600">{authError}</p>}
              <button disabled={saving} className="w-full rounded-full bg-emerald-900 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                {saving ? "Entrando…" : "Entrar"}
              </button>
              <button type="button" onClick={forgot} className="w-full text-center text-xs font-semibold text-stone-500 hover:text-stone-800">
                Esqueci minha senha
              </button>
            </form>
          ) : editing || !profile ? (
            <form onSubmit={submit} className="space-y-4" noValidate>
              {!profile && (
                <p className="text-sm text-stone-600">Cadastre-se uma vez e seus dados entram sozinhos no checkout.</p>
              )}
              <Field label="Nome completo" value={form.name} onChange={(v) => set("name", v)} error={errors.name} placeholder="Maria da Silva" maxLength={60} />
              <Field label="E-mail" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} placeholder="maria@email.com" />
              <Field label="Telefone / WhatsApp" inputMode="tel" value={form.phone} onChange={(v) => set("phone", maskPhone(v))} error={errors.phone} placeholder="(11) 99999-9999" />
              <fieldset className="space-y-3">
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">Endereço (opcional)</legend>
                <Field label="CEP" inputMode="numeric" value={form.zip} onChange={(v) => set("zip", maskCEP(v))} error={errors.zip} placeholder="00000-000" />
                <div className="grid grid-cols-3 gap-3">
                  <Field className="col-span-2" label="Rua" value={form.street} onChange={(v) => set("street", v)} placeholder="Rua das Flores" />
                  <Field label="Número" value={form.number} onChange={(v) => set("number", v)} placeholder="123" />
                </div>
                <Field label="Bairro" value={form.district} onChange={(v) => set("district", v)} placeholder="Centro" />
                <div className="grid grid-cols-3 gap-3">
                  <Field className="col-span-2" label="Cidade" value={form.city} onChange={(v) => set("city", v)} placeholder="São Paulo" />
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-stone-700">Estado</span>
                    <select
                      id="conta-uf"
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-page px-3 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    >
                      <option value="">UF</option>
                      {BRAZIL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
              </fieldset>
              {needsPassword && !profile && (
                <fieldset className="grid grid-cols-2 gap-3">
                  <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">Senha da conta</legend>
                  <Field label="Senha" type="password" value={pw.password} onChange={(v) => { setPw((p) => ({ ...p, password: v })); setErrors((x) => ({ ...x, password: undefined })); }} error={errors.password} />
                  <Field label="Repita a senha" type="password" value={pw.confirm} onChange={(v) => { setPw((p) => ({ ...p, confirm: v })); setErrors((x) => ({ ...x, confirm: undefined })); }} error={errors.confirm} />
                </fieldset>
              )}
              {authError && <p className="text-xs font-medium text-rose-600">{authError}</p>}
              <label className="flex cursor-pointer items-center gap-3 text-sm text-stone-700">
                <input id="conta-novidades" type="checkbox" checked={!!form.newsletter} onChange={(e) => set("newsletter", e.target.checked)} className="h-4 w-4 accent-emerald-700" />
                Quero receber novidades e cupons por e-mail
              </label>
              <div className="flex gap-2">
                {profile && (
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-full border border-stone-300 py-3.5 text-sm font-semibold text-stone-700">
                    Cancelar
                  </button>
                )}
                <button disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-900 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                  {saving ? "Salvando…" : profile ? "Salvar alterações" : "Criar cadastro"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="rounded-2xl border border-stone-200 bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                      {profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold text-stone-900">{profile.name}</p>
                      {/* Cadastro salvo por uma versão antiga pode não ter data: mostrava "Invalid Date" */}
                      {profile.createdAt && !isNaN(new Date(profile.createdAt)) && (
                        <p className="text-xs text-stone-500">Cliente desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-500">
                    <PenLine className="h-3.5 w-3.5" /> Editar
                  </button>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-stone-700">
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-stone-400" /> {profile.email}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-stone-400" /> {profile.phone}</p>
                  {profile.address && profile.address.street && (
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                      {profile.address.street}, {profile.address.number} · {profile.address.city}/{profile.address.state}
                    </p>
                  )}
                  {profile.newsletter && <p className="text-xs text-emerald-700">Inscrito para receber novidades</p>}
                </div>
              </div>

              {needsPassword && (
                <form onSubmit={createPassword} className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4" noValidate>
                  <p className="text-sm font-semibold text-stone-900">Crie uma senha para entrar de outro aparelho</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Senha" type="password" value={pw.password} onChange={(v) => { setPw((p) => ({ ...p, password: v })); setAuthError(""); }} />
                    <Field label="Repita a senha" type="password" value={pw.confirm} onChange={(v) => { setPw((p) => ({ ...p, confirm: v })); setAuthError(""); }} />
                  </div>
                  {authError && <p className="text-xs font-medium text-rose-600">{authError}</p>}
                  <button disabled={saving} className="w-full rounded-full bg-emerald-900 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                    Criar senha
                  </button>
                </form>
              )}

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Meus pedidos</p>
                {myOrders.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Você ainda não fez nenhum pedido.</p>
                ) : (
                  <ul className="space-y-2">
                    {myOrders.map((o) => (
                      <li key={o.id} className="rounded-2xl border border-stone-200 bg-surface p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-mono text-xs font-bold text-emerald-800">{o.id}</p>
                          <StatusBadge status={o.status} />
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-1" aria-label={`Etapa: ${o.status}`}>
                          {Object.keys(ORDER_STATUS).map((st, i) => (
                            <span key={st} className={`h-1.5 rounded-full ${i <= Object.keys(ORDER_STATUS).indexOf(o.status) ? "bg-emerald-700" : "bg-stone-200"}`} />
                          ))}
                        </div>
                        <p className="mt-1 flex justify-between text-[10px] text-stone-400"><span>Recebido</span><span>Entregue</span></p>
                        <p className="mt-2 text-xs text-stone-600">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
                        <p className="mt-2 flex justify-between text-sm">
                          <span className="text-stone-500">{formatDateTime(o.createdAt)}</span>
                          <b className="tabular-nums text-stone-900">{formatBRL(o.total)}</b>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {fb && !cloud.isAnonymous && cloud.auth && (
                <button
                  onClick={async () => { await cloud.auth.signOut(); notify("Você saiu da sua conta"); onClose(); }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 py-3 text-sm font-semibold text-stone-700 hover:border-stone-500"
                >
                  <LogOut className="h-4 w-4" /> Sair da conta
                </button>
              )}

              {myDonations.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Minhas doações</p>
                  <ul className="space-y-2">
                    {myDonations.map((d) => (
                      <li key={d.id} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-surface p-4 text-sm">
                        <span className="flex items-center gap-2 text-stone-700"><Heart className="h-4 w-4 text-rose-500" /> {formatDateTime(d.createdAt)}</span>
                        <b className="tabular-nums text-stone-900">{formatBRL(d.amount)}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
