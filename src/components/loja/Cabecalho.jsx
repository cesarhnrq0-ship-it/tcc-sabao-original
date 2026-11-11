import React, { useEffect, useState } from "react";
import { Logo } from "../ui";
import { autoAnnouncement } from "../../data/loja";
import { useStore } from "../../lib/contextos";
import { Gift, LayoutDashboard, Leaf, Menu, Moon, Pause, Play, Recycle, ShieldCheck, ShoppingBag, Sparkles, Store, Sun, Truck, User, X } from "../../lib/icones";

/** Cabeçalho com navegação, carrinho e alternância Loja/Admin */
/** Pausa/retoma todos os letreiros do site (acessibilidade: conteúdo em movimento precisa poder parar) */
function BotaoPausarLetreiro() {
  const [pausado, setPausado] = useState(() => { try { return localStorage.getItem("farmaura_letreiro_pausado") === "1"; } catch { return false; } });
  useEffect(() => {
    document.documentElement.classList.toggle("letreiro-pausado", pausado);
    try { localStorage.setItem("farmaura_letreiro_pausado", pausado ? "1" : "0"); } catch { /* ignora */ }
  }, [pausado]);
  return (
    <button
      onClick={() => setPausado((p) => !p)}
      aria-pressed={pausado}
      aria-label={pausado ? "Retomar letreiros" : "Pausar letreiros"}
      title={pausado ? "Retomar letreiros" : "Pausar letreiros"}
      className="botao-pausar absolute inset-y-0 right-0 flex w-9 items-center justify-center bg-banner text-emerald-50/80 transition hover:text-white"
    >
      {pausado ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
    </button>
  );
}

const AVISO_ICONES = [Truck, Leaf, Gift, Recycle, ShieldCheck, Sparkles];

export function Header({ view, setView, cartCount, onOpenCart, onNavigate, theme, onToggleTheme, activeSection, cartBump, onOpenAccount, hasProfile }) {
  const { settings, appearance } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { id: "inicio", label: "Início" },
    { id: "catalogo-sabonete", label: "Sabonete em Pó" },
    { id: "catalogo-protetor", label: "Protetor Solar" },
    { id: "catalogo-acessorios", label: "Acessórios" },
    { id: "rastrear", label: "Rastrear" },
    { id: "duvidas", label: "Dúvidas" },
    { id: "doar", label: "Doar" },
    { id: "contato", label: "Contato" },
  ].filter((l) => l.id !== "doar" || settings.donationsEnabled);

  const avisos = appearance.avisos.map((t) => (t.trim() ? t.trim() : settings.announcement || autoAnnouncement(settings))).filter(Boolean);

  const go = (id) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-page/80 backdrop-blur-xl">
      {/* Barra de anúncio — textos editáveis em Painel > Aparência (vazio = frete e PIX automáticos) */}
      {appearance.letreiros.avisos && avisos.length > 0 && (
        <div className="letreiro-topo palette-light marquee-wrap relative overflow-hidden bg-banner py-2 pr-9 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-50 sm:text-xs">
          <p className="sr-only">{avisos.join(". ")}</p>
          <div className="marquee" aria-hidden="true">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {avisos.map((t, i) => {
                  const Icon = AVISO_ICONES[i % AVISO_ICONES.length];
                  return (
                    <span key={i} className="flex items-center gap-2 px-6">
                      <Icon className="h-3.5 w-3.5 text-destaque" /> {t}
                      <span className="ml-6 h-1 w-1 rounded-full bg-destaque/60" />
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          <BotaoPausarLetreiro />
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <button onClick={() => go("inicio")} aria-label="Ir para o início">
          <Logo />
        </button>

        {/* Navegação desktop (somente no modo loja) */}
        {view === "store" && (
          <nav className="hidden items-center gap-5 xl:flex">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                aria-current={activeSection === l.id ? "true" : undefined}
                className={`relative whitespace-nowrap py-1 text-sm font-medium transition hover:text-emerald-800 ${
                  activeSection === l.id ? "text-emerald-800" : "text-stone-600"
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-emerald-700 transition-all duration-300 ${
                    activeSection === l.id ? "w-full" : "w-0"
                  }`}
                />
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-0.5 sm:gap-3">
          {/* Alternância Modo Loja / Painel Admin */}
          <div className="flex rounded-full bg-stone-200/70 p-1 text-xs font-semibold">
            <button
              onClick={() => setView("store")}
              aria-label="Modo Loja"
              title="Modo Loja"
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 sm:px-3 transition ${
                view === "store" ? "bg-surface text-emerald-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span className="hidden whitespace-nowrap sm:inline xl:hidden 2xl:inline">Modo Loja</span>
            </button>
            <button
              onClick={() => setView("admin")}
              aria-label="Painel Admin"
              title="Painel Admin"
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 sm:px-3 transition ${
                view === "admin" ? "bg-ink text-ink-fg shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden whitespace-nowrap sm:inline xl:hidden 2xl:inline">Painel Admin</span>
            </button>
          </div>

          {/* Alternância de tema claro / escuro */}
          <button
            onClick={onToggleTheme}
            className="rounded-full p-2 sm:p-2.5 text-stone-800 transition hover:bg-stone-200/70"
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Minha conta / cadastro */}
          <button
            onClick={onOpenAccount}
            className="relative rounded-full p-2 sm:p-2.5 text-stone-800 transition hover:bg-stone-200/70"
            aria-label={hasProfile ? "Minha conta" : "Criar cadastro"}
            title={hasProfile ? "Minha conta" : "Criar cadastro"}
          >
            <User className="h-5 w-5" />
            {hasProfile && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-page" />}
          </button>

          {/* Carrinho com contador dinâmico */}
          <button
            onClick={onOpenCart}
            className={`relative inline-flex items-center gap-2 rounded-full bg-emerald-900 p-2 text-white shadow-md shadow-emerald-900/25 transition hover:brightness-110 sm:p-2.5 lg:px-4 ${cartBump ? "cart-bump" : ""}`}
            aria-label={`Abrir carrinho (${cartCount} itens)`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden text-sm font-semibold lg:inline">Sacola</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destaque px-1 text-[10px] font-bold text-destaque-fg ring-2 ring-page lg:static lg:ring-0">
                {cartCount}
              </span>
            )}
          </button>

          {/* Menu mobile */}
          {view === "store" && (
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-full p-2 sm:p-2.5 text-stone-800 hover:bg-stone-200/70 xl:hidden"
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {mobileOpen && view === "store" && (
        <nav className="border-t border-stone-200 bg-page px-4 pb-4 xl:hidden">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="block w-full border-b border-stone-200/60 py-3 text-left text-sm font-medium text-stone-700"
            >
              {l.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
