import React, { useEffect, useMemo, useState } from "react";
import { Header } from "./components/loja/Cabecalho";
import { CartDrawer } from "./components/loja/Carrinho";
import { ProductsSection } from "./components/loja/Catalogo";
import { ChatWidget } from "./components/loja/Chat";
import { AccountPanel } from "./components/loja/Conta";
import { BenefitsStrip, CategoryShowcase, Hero } from "./components/loja/Inicio";
import { ProductModal } from "./components/loja/ProdutoModal";
import { ProductPage } from "./components/loja/ProdutoPagina";
import { AboutSection, ContactSection, DonationSection, FaqSection, Footer, OrderTracker, QuizSection, SustainabilitySection } from "./components/loja/Secoes";
import { Toast } from "./components/ui";
import { fixOrder } from "./data/catalogo";
import { buildDemoData } from "./data/exemplos";
import { DEFAULT_STOCK, DEFAULT_STORE, MESSAGES_KEY, MOCK_ORDERS, PROFILE_KEY, addMoves, buildStore, loadJSON, loadStore, normalizeStore, saveJSON, saveStore } from "./data/loja";
import { applyAppearance, normalizeAppearance } from "./lib/aparencia";
import { lerFavoritosDoLink, registrarVisto } from "./lib/recursos";
import { hashSenha } from "./lib/seguranca";
import { CompareBar, RecentlyViewed, SharedFavorites } from "./components/loja/Recursos";
import { CloudContext, NavContext, ReviewsContext, StoreContext } from "./lib/contextos";
import { ArrowUp } from "./lib/icones";
import { CLOUD_COLLECTIONS, FIREBASE_CONFIG, cloudId, connectFirebase, isTeamEmail, writeUserDoc } from "./lib/nuvem";
import { ADMIN_SESSION_KEY, FAVS_KEY, THEME_KEY, loadAdminSession, loadCart, loadDonations, loadFavs, loadOrders, loadTheme, nextDonationId, nextOrderId, onlyDigits, reviewStats, round2, saveCart, saveDonations, saveOrders } from "./lib/util";

// O painel admin só é baixado quando alguém abre "Painel Admin" (a loja fica mais leve)
const AdminDashboard = React.lazy(() => import("./components/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminLogin = React.lazy(() => import("./components/admin/Login").then((m) => ({ default: m.AdminLogin })));
const CarregandoPainel = () => (
  <div className="flex min-h-[60vh] items-center justify-center text-sm font-medium text-stone-500" role="status">Abrindo o painel…</div>
);

/* ============================================================================
 * 6. COMPONENTE PRINCIPAL
 * ========================================================================== */

export function App() {
  const [view, setView] = useState("store"); // "store" | "admin"
  const [cart, setCart] = useState(loadCart);
  const [favs, setFavs] = useState(loadFavs);
  const [storeData, setStoreData] = useState(loadStore);
  const store = useMemo(() => buildStore(storeData), [storeData]);
  const [adminAuthed, setAdminAuthed] = useState(loadAdminSession);
  const [theme, setTheme] = useState(loadTheme);
  const [activeSection, setActiveSection] = useState("inicio");
  const [showTop, setShowTop] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState(loadOrders);
  const [donations, setDonations] = useState(loadDonations);
  const [demoClientsLocal, setDemoClientsLocal] = useState(() => loadJSON("farmaura_demo_clientes_v1", []));
  const [accountOpen, setAccountOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const parseRoute = () => { const m = window.location.hash.match(/^#produto-([\w-]+)$/); return m ? m[1] : null; };
  const [pageId, setPageId] = useState(parseRoute);
  const [reviewsLocal, setReviewsLocal] = useState(() => loadJSON("farmaura_reviews_v1", []));
  const [publicReviews, setPublicReviews] = useState([]);
  const [chatLocal, setChatLocal] = useState(() => loadJSON("farmaura_chat_v1", null));

  /* ---------- Banco de dados ---------- */
  const [cloud, setCloud] = useState(() => {
    if (window.claude && typeof window.claude.use === "function") return { status: "connecting", provider: "claude" };
    if (FIREBASE_CONFIG.apiKey) return { status: "connecting", provider: "firebase" };
    return { status: "local" };
  });
  const [mine, setMine] = useState({});     // documentos da própria pessoa
  const [all, setAll] = useState({});       // coleções inteiras (só a equipe recebe)
  const [configReady, setConfigReady] = useState(false);
  const remoteConfigRef = React.useRef(null);
  const reconcilingRef = React.useRef(false);
  const [profileLocal, setProfileLocal] = useState(() => loadJSON(PROFILE_KEY, null));
  const [messagesLocal, setMessagesLocal] = useState(() => loadJSON(MESSAGES_KEY, { lista: [], newsletter: [] }));
  const online = cloud.status === "online";

  // 1. Conecta: no Claude usa o banco do próprio site; fora dele, o Firebase
  useEffect(() => {
    if (cloud.status !== "connecting") return;
    let alive = true;
    if (cloud.provider === "firebase") {
      connectFirebase((u, err, ctx) => {
        if (!alive) return;
        if (err || !u) {
          console.warn("[banco] Firebase:", err && err.code, err && err.message);
          setCloud({ status: "local" });
          return;
        }
        setCloud({
          status: "online", provider: "firebase", db: ctx.db, auth: u.noAuth ? null : ctx.api, noAuth: !!u.noAuth,
          uid: u.uid, email: u.email, isAnonymous: u.isAnonymous,
          // sem login no Firebase, a equipe entra com a senha do painel
          isAdmin: u.noAuth ? loadAdminSession() : isTeamEmail(u.email),
        });
      }).catch((e) => {
        console.warn("[banco] Firebase não carregou:", e && e.message);
        if (alive) setCloud({ status: "local" });
      });
      return () => { alive = false; };
    }
    (async () => {
      try {
        const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
        if (!db || !user) throw new Error("sem banco");
        const uid = await user.id();
        if (!uid) throw new Error("sem identificação");
        const isAdmin = await user.canEdit().catch(() => false);
        if (alive) setCloud({ status: "online", provider: "claude", db, uid, isAdmin: !!isAdmin });
      } catch {
        if (alive) setCloud({ status: "local" });
      }
    })();
    return () => { alive = false; };
  }, []);

  // 2. Assina os dados (uma vez por conexão)
  useEffect(() => {
    if (!online) return;
    const { db, uid, isAdmin } = cloud;
    const warn = (what) => (e) => console.warn(`[banco] ${what}:`, e && e.code, e && e.message);
    const subs = [];
    setMine({});
    setAll({});
    subs.push(db.doc("loja/avaliacoes").onSnapshot((snap) => {
      setPublicReviews(snap.exists && Array.isArray(snap.data().lista) ? snap.data().lista : []);
    }, warn("avaliações")));
    subs.push(db.doc("loja/config").onSnapshot((snap) => {
      const next = normalizeStore(snap.exists ? snap.data().store : DEFAULT_STORE);
      const json = JSON.stringify(next);
      setConfigReady(true);
      // Ignora entregas que não mudam nada (não apaga uma alteração ainda não gravada)
      if (json === remoteConfigRef.current) return;
      remoteConfigRef.current = json;
      setStoreData(next);
    }, warn("config")));
    CLOUD_COLLECTIONS.forEach((col) => {
      subs.push(db.doc(`${col}/${uid}`).onSnapshot((snap) => {
        setMine((m) => ({ ...m, [col]: snap.exists ? { uid, ...snap.data() } : null }));
      }, warn(col)));
      if (isAdmin) {
        subs.push(db.collection(col).onSnapshot((qs) => {
          setAll((a) => ({ ...a, [col]: qs.docs.map((d) => ({ uid: d.id, ...d.data() })) }));
        }, warn(`${col} (todos)`)));
      }
    });
    return () => subs.forEach((u) => u());
  }, [online, cloud.uid, cloud.isAdmin]);

  // 3. A equipe grava as mudanças da loja (preço, estoque, cupons, regras)
  useEffect(() => {
    if (!online || !cloud.isAdmin || !configReady) return;
    const json = JSON.stringify(storeData);
    if (json === remoteConfigRef.current) return;
    remoteConfigRef.current = json;
    cloud.db.doc("loja/config").set({ store: storeData, atualizadoEm: new Date().toISOString() })
      .catch((e) => cloudFail(e, "as configurações da loja"));
  }, [storeData, online, cloud.isAdmin, configReady]);

  // 4. A equipe dá baixa no estoque e conta os cupons dos pedidos novos
  useEffect(() => {
    if (!online || !cloud.isAdmin || !configReady || reconcilingRef.current) return;
    const pending = (all.pedidos || []).filter((d) => (d.lista || []).some((o) => !o.stockApplied));
    if (!pending.length) return;
    reconcilingRef.current = true;
    (async () => {
      const sold = {};
      const used = {};
      const soldBy = [];
      try {
        for (const d of pending) {
          const applied = [];
          await writeUserDoc(cloud.db, "pedidos", d.uid, (doc) => ({
            ...doc,
            lista: doc.lista.map((o) => {
              if (o.stockApplied) return o;
              applied.push(o);
              return { ...o, stockApplied: true };
            }),
          }));
          applied.forEach((o) => {
            o.items.forEach((i) => { sold[i.id] = (sold[i.id] || 0) + i.qty; soldBy.push({ at: o.createdAt, productId: i.id, qty: i.qty, ref: o.id }); });
            if (o.coupon) used[o.coupon] = (used[o.coupon] || 0) + 1;
          });
        }
        if (Object.keys(sold).length || Object.keys(used).length) {
          setStoreData((dd) => {
            const products = { ...dd.products };
            const moves = [];
            soldBy.forEach(({ at, productId, qty, ref }) => {
              const cur = products[productId] && products[productId].stock !== undefined ? products[productId].stock : DEFAULT_STOCK[productId] ?? 30;
              products[productId] = { ...(products[productId] || {}), stock: Math.max(0, cur - qty) };
              moves.push({ at, productId, delta: -qty, saldo: products[productId].stock, motivo: `Venda ${ref}` });
            });
            const coupons = dd.coupons.map((c) => (used[c.code] ? { ...c, uses: (c.uses || 0) + used[c.code] } : c));
            return addMoves({ ...dd, products, coupons }, moves);
          });
        }
      } catch (e) {
        console.warn("[banco] estoque:", e && e.code, e && e.message);
      } finally {
        reconcilingRef.current = false;
      }
    })();
  }, [online, cloud.isAdmin, configReady, all.pedidos]);

  /** Junta as listas de cada pessoa numa lista só, guardando de quem é cada item */
  const gather = (col) => {
    const docs = online ? (cloud.isAdmin ? all[col] || [] : mine[col] ? [mine[col]] : []) : [];
    return docs.flatMap((d) => (d.lista || []).map((x) => ({ ...x, _uid: d.uid })));
  };
  const ordersView = (online ? gather("pedidos") : orders).map(fixOrder);

  /* ---------- Avaliações ---------- */
  const reviewsAll = online ? gather("avaliacoes") : reviewsLocal.map((r) => ({ ...r, _uid: "local" }));
  const reviewsMine = online ? reviewsAll.filter((r) => r._uid === cloud.uid) : reviewsLocal;
  const reviewsApproved = online ? publicReviews : reviewsLocal.filter((r) => r.status === "aprovada");
  const reviewsCtx = useMemo(() => ({ approved: reviewsApproved, mine: reviewsMine, stats: reviewStats(reviewsApproved) }), [JSON.stringify(reviewsApproved), JSON.stringify(reviewsMine)]);
  const saveLocalReviews = (fn) => setReviewsLocal((cur) => { const next = fn(cur); saveJSON("farmaura_reviews_v1", next); return next; });
  const submitReview = async ({ productId, stars, name, text }) => {
    if (reviewsMine.some((r) => r.productId === productId && r.status !== "rejeitada")) {
      notify("Você já avaliou este produto.", "error");
      return false;
    }
    const r = { id: cloudId("AV"), productId, stars, name, text, createdAt: new Date().toISOString(), status: "pendente" };
    if (online) {
      try {
        await writeUserDoc(cloud.db, "avaliacoes", cloud.uid, (d) => ({ ...d, lista: [r, ...d.lista] }));
      } catch (e) {
        cloudFail(e, "a avaliação");
        return false;
      }
    } else {
      saveLocalReviews((cur) => [r, ...cur]);
    }
    notify("Avaliação enviada! Ela aparece depois de aprovada pela equipe.");
    return true;
  };
  /** Mantém a lista pública (loja/avaliacoes) só com as aprovadas */
  const syncPublicReview = async (r, show) => {
    const ref = cloud.db.doc("loja/avaliacoes");
    const snap = await ref.get();
    const lista = (snap.exists && Array.isArray(snap.data().lista) ? snap.data().lista : []).filter((x) => x.id !== r.id);
    if (show) lista.unshift({ id: r.id, productId: r.productId, stars: r.stars, name: r.name, text: r.text, createdAt: r.createdAt });
    await ref.set({ lista, atualizadoEm: new Date().toISOString() });
  };
  const moderateReview = async (r, status) => {
    if (online) {
      if (!(await editUserItem("avaliacoes", r, (x) => [{ ...x, status }]))) return;
      try { await syncPublicReview(r, status === "aprovada"); } catch (e) { cloudFail(e, "a avaliação pública"); return; }
    } else {
      saveLocalReviews((cur) => cur.map((x) => (x.id === r.id ? { ...x, status } : x)));
    }
    notify(status === "aprovada" ? "Avaliação publicada na loja" : "Avaliação retirada da loja");
  };
  const deleteReview = async (r) => {
    if (online) {
      if (!(await editUserItem("avaliacoes", r, () => []))) return;
      try { await syncPublicReview(r, false); } catch (e) { cloudFail(e, "a avaliação pública"); return; }
    } else {
      saveLocalReviews((cur) => cur.filter((x) => x.id !== r.id));
    }
    notify("Avaliação excluída");
  };
  const donationsView = online ? gather("doacoes") : donations;
  const messagesView = online ? gather("mensagens") : messagesLocal.lista;
  const newsletterView = online
    ? (cloud.isAdmin ? all.mensagens || [] : mine.mensagens ? [mine.mensagens] : []).filter((d) => d.newsletter).map((d) => ({ ...d.newsletter, _uid: d.uid }))
    : messagesLocal.newsletter;
  const myProfile = online ? mine.clientes || null : profileLocal;
  const clientsView = online
    ? (cloud.isAdmin ? all.clientes || [] : mine.clientes ? [mine.clientes] : [])
    : [...(profileLocal ? [profileLocal] : []), ...demoClientsLocal];
  const myOrders = online
    ? ordersView.filter((o) => o._uid === cloud.uid)
    : myProfile ? orders.filter((o) => o.customer.email.toLowerCase() === myProfile.email) : [];
  const myDonations = online ? donationsView.filter((d) => d._uid === cloud.uid) : [];

  const cloudFail = (e, what) => {
    console.warn("[banco]", e && e.code, e && e.message);
    notify(
      e && e.code === "quota_exceeded"
        ? "O banco de dados está cheio. Apague registros antigos no painel."
        : `Não foi possível salvar ${what} no banco de dados. Confira se sua conta tem permissão para usar este site.`,
      "error"
    );
  };
  /** Altera ou remove um item da lista de uma pessoa (usado pelo painel) */
  const editUserItem = async (col, item, fn) => {
    try {
      await writeUserDoc(cloud.db, col, item._uid, (d) => ({
        ...d,
        lista: d.lista.flatMap((x) => (x.id === item.id ? fn(x) : [x])),
      }));
      return true;
    } catch (e) {
      cloudFail(e, "a alteração");
      return false;
    }
  };

  /* ---------- Chat ao vivo ---------- */
  const myChat = online ? mine.chats || null : chatLocal;
  const chatsView = online
    ? (cloud.isAdmin ? all.chats || [] : mine.chats ? [mine.chats] : [])
    : chatLocal ? [{ uid: "local", ...chatLocal }] : [];
  /** Lê a conversa, aplica a mudança e grava (uma escrita por vez) */
  const writeChat = async (uid, fn) => {
    if (!online) {
      const next = fn(chatLocal || {});
      setChatLocal(next);
      saveJSON("farmaura_chat_v1", next);
      return true;
    }
    try {
      const ref = cloud.db.doc(`chats/${uid}`);
      const snap = await ref.get();
      const cur = snap.exists ? snap.data() : {};
      await ref.set(fn({ ...cur, mensagens: Array.isArray(cur.mensagens) ? cur.mensagens : [] }));
      return true;
    } catch (e) {
      cloudFail(e, "a mensagem do chat");
      return false;
    }
  };
  const chatMsg = (from, text) => ({ id: `${from[0]}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, from, text, at: new Date().toISOString() });
  /** Cliente manda mensagem */
  const sendChat = (text, who) =>
    writeChat(online ? cloud.uid : "local", (d) => {
      const m = chatMsg("cliente", text);
      return {
        ...d, name: d.name || who.name || "Visitante", email: d.email || who.email || "",
        mensagens: [...(d.mensagens || []), m], ultimaEm: m.at, lidoPeloClienteEm: m.at,
      };
    });
  const readChatCliente = () =>
    writeChat(online ? cloud.uid : "local", (d) => ({ ...d, lidoPeloClienteEm: new Date().toISOString() }));

  /** Cadastro do cliente */
  const saveProfile = async (p) => {
    const now = new Date().toISOString();
    const data = { ...p, createdAt: (myProfile && myProfile.createdAt) || now, atualizadoEm: now };
    if (online) {
      try {
        await cloud.db.doc(`clientes/${cloud.uid}`).set(data);
        return true;
      } catch (e) {
        cloudFail(e, "o cadastro");
        return false;
      }
    }
    setProfileLocal(data);
    saveJSON(PROFILE_KEY, data);
    return true;
  };

  /** Mensagem do formulário de contato */
  const sendMessage = async ({ name, email, message }) => {
    const msg = { id: online ? cloudId("MSG") : `MSG-${Date.now()}`, name, email, message, createdAt: new Date().toISOString(), read: false };
    if (online) {
      try {
        await writeUserDoc(cloud.db, "mensagens", cloud.uid, (d) => ({ ...d, lista: [msg, ...d.lista] }));
        return true;
      } catch (e) {
        cloudFail(e, "a mensagem");
        return false;
      }
    }
    setMessagesLocal((m) => {
      const next = { ...m, lista: [msg, ...(m.lista || [])] };
      saveJSON(MESSAGES_KEY, next);
      return next;
    });
    return true;
  };

  /** Inscrição na newsletter */
  const subscribeNewsletter = async (email) => {
    const entry = { email, createdAt: new Date().toISOString() };
    if (online) {
      try {
        await writeUserDoc(cloud.db, "mensagens", cloud.uid, (d) => ({ ...d, newsletter: entry }));
        return true;
      } catch (e) {
        cloudFail(e, "a inscrição");
        return false;
      }
    }
    setMessagesLocal((m) => {
      const next = { ...m, newsletter: [entry, ...(m.newsletter || []).filter((x) => x.email !== email)] };
      saveJSON(MESSAGES_KEY, next);
      return next;
    });
    return true;
  };
  const [toast, setToast] = useState(null);

  // Persiste os pedidos e o carrinho sempre que mudarem (quando o ambiente permitir)
  useEffect(() => saveOrders(orders), [orders]);
  useEffect(() => saveCart(cart), [cart]);
  useEffect(() => { if (cloud.status === "local") saveStore(storeData); }, [storeData, cloud.status]);
  useEffect(() => saveDonations(donations), [donations]);

  /** Registra uma doação (o pagamento é feito pelo PIX gerado na tela) */
  const addDonation = async ({ amount, name, message }) => {
    const d = {
      id: online ? cloudId("DO") : nextDonationId(donations),
      createdAt: new Date().toISOString(), amount, name, message, status: "Aguardando",
    };
    if (online) {
      try {
        await writeUserDoc(cloud.db, "doacoes", cloud.uid, (doc) => ({ ...doc, lista: [d, ...doc.lista] }));
      } catch (e) {
        cloudFail(e, "a doação");
        return null;
      }
    } else {
      setDonations((prev) => [d, ...prev]);
    }
    return d;
  };
  useEffect(() => {
    try { window.localStorage.setItem(FAVS_KEY, JSON.stringify(favs)); } catch { /* ignora */ }
  }, [favs]);
  const toggleFav = (id) => {
    const p = store.allProducts.find((x) => x.id === id);
    setFavs((prev) => {
      const has = prev.includes(id);
      notify(has ? `${p.name} saiu dos favoritos` : `${p.name} foi para os favoritos`);
      return has ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  // Aplica o tema escolhido no documento
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");
  }, [theme]);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch { /* ignora */ }
  };

  // Vistos recentemente: registra cada produto aberto (página ou janela de detalhes)
  useEffect(() => { if (pageId) registrarVisto(pageId); }, [pageId]);
  useEffect(() => { if (selectedProduct) registrarVisto(selectedProduct.id); }, [selectedProduct]);

  // Lista de favoritos recebida por link (#favoritos=id1,id2)
  const [sharedFavs, setSharedFavs] = useState(null);
  useEffect(() => {
    const ler = () => setSharedFavs(lerFavoritosDoLink(store.products.map((p) => p.id)));
    ler();
    window.addEventListener("hashchange", ler);
    return () => window.removeEventListener("hashchange", ler);
  }, [store.products.length]);
  const closeShared = () => {
    setSharedFavs(null);
    if (window.location.hash.startsWith("#favoritos=")) {
      try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch { /* ignora */ }
    }
  };
  const saveSharedFavs = (ids) => {
    setFavs((prev) => [...new Set([...prev, ...ids])]);
    notify(`${ids.length} ${ids.length === 1 ? "produto salvo" : "produtos salvos"} nos seus favoritos`);
  };

  // Aparência editável (Painel > Aparência): cores, fontes, cantos e animações
  const appearance = store.appearance;
  const appearanceKey = JSON.stringify(appearance);
  useEffect(() => { applyAppearance(appearance); }, [appearanceKey]);
  // Tema padrão da loja: vale só para quem ainda não escolheu claro/escuro no botão
  useEffect(() => {
    let saved = null;
    try { saved = window.localStorage.getItem(THEME_KEY); } catch { /* ignora */ }
    if (saved) return;
    if (appearance.temaPadrao === "claro") setTheme("light");
    else if (appearance.temaPadrao === "escuro") setTheme("dark");
  }, [appearance.temaPadrao]);

  // Destaca no menu a seção visível e mostra o botão "voltar ao topo"
  useEffect(() => {
    const ids = ["inicio", "catalogo-sabonete", "catalogo-protetor", "catalogo-acessorios", "quiz", "doar", "sobre", "rastrear", "duvidas", "contato"];
    const onScroll = () => {
      setShowTop(window.scrollY > 700);
      let current = "inicio";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [view, pageId]);

  // Remove o toast automaticamente após alguns segundos
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // Bloqueia a rolagem do fundo quando um modal/drawer está aberto
  useEffect(() => {
    document.body.style.overflow = cartOpen || selectedProduct || accountOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, selectedProduct, accountOpen]);

  // Fecha modal/drawer com a tecla ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const notify = (message, type = "success", action = null) => setToast({ message, type, action, id: Date.now() });

  /* ---------- Ações do carrinho ---------- */
  const addToCart = (product, qty = 1, opts = {}) => {
    const p = store.allProducts.find((x) => x.id === product.id) || product;
    const cfg = store.customization[p.id];
    const custom = opts.custom && cfg ? opts.custom : null;
    const customStyle = custom ? opts.customStyle || null : null;
    if (!p.active || p.stock <= 0) return notify(`${p.name} está esgotado`, "error");
    const inCart = cart.filter((i) => i.id === p.id).reduce((a, i) => a + i.qty, 0);
    const room = p.stock - inCart;
    if (room <= 0) return notify(`Você já tem as ${p.stock} unidades disponíveis no carrinho`, "error");
    const add = Math.min(qty, room);
    const lineId = custom
      ? [p.id, custom.toLowerCase(), customStyle ? customStyle.font : "", customStyle ? customStyle.color : ""].join("::")
      : p.id;
    const price = round2(p.price + (custom ? cfg.fee : 0));
    setCart((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) => (i.lineId === lineId ? { ...i, qty: Math.min(20, i.qty + add) } : i));
      }
      return [...prev, { lineId, id: p.id, name: p.name, variant: p.variant, price, image: p.image, qty: add, custom, customStyle }];
    });
    if (add < qty) notify(`Só restavam ${room} unidades. Adicionamos ${add} ao carrinho.`, "error", "Ver carrinho");
    else notify(`${p.name} adicionado`, "success", opts.silent ? null : "Ver carrinho");
    setCartBump(true);
    setTimeout(() => setCartBump(false), 450);
  };
  const updateQty = (lineId, qty) => setCart((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, qty } : i)));
  const removeItem = (lineId) => setCart((prev) => prev.filter((i) => i.lineId !== lineId));

  /** Carrinho com preço, nome e estoque atuais (o admin pode mudar enquanto o cliente compra) */
  const liveCart = useMemo(() => {
    const perProduct = {};
    cart.forEach((i) => { perProduct[i.id] = (perProduct[i.id] || 0) + i.qty; });
    return cart.map((i) => {
      const p = store.allProducts.find((x) => x.id === i.id);
      if (!p) return { ...i, stock: 0, issue: "Produto indisponível. Remova do carrinho." };
      const cfg = i.custom ? store.customizationAll[i.id] : null;
      let issue = null;
      if (!p.active) issue = "Saiu da loja. Remova do carrinho.";
      else if (p.stock <= 0) issue = "Esgotado. Remova do carrinho.";
      else if (perProduct[i.id] > p.stock) issue = `Só ${p.stock} ${p.stock === 1 ? "unidade disponível" : "unidades disponíveis"}.`;
      else if (i.custom && !store.customization[i.id]) issue = "Personalização indisponível. Remova e adicione sem nome.";
      return {
        ...i,
        name: p.name,
        variant: p.variant,
        image: p.image,
        price: round2(p.price + (cfg ? cfg.fee : 0)),
        stock: p.stock,
        issue,
      };
    });
  }, [cart, store]);
  const cartCount = liveCart.reduce((acc, i) => acc + i.qty, 0);

  /**
   * Finaliza o pedido:
   *  - monta o objeto do pedido com todos os dados do cliente
   *  - envia AUTOMATICAMENTE para o Painel Admin (estado `orders`)
   *  - limpa o carrinho
   */
  const placeOrder = async (form, totals) => {
    if (liveCart.some((i) => i.issue)) {
      notify("Alguns itens mudaram de estoque. Confira o carrinho.", "error");
      return null;
    }
    const order = {
      id: online ? cloudId("FA") : nextOrderId(orders),
      createdAt: new Date().toISOString(),
      customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone },
      address: {
        street: form.street.trim(), number: form.number.trim(), district: form.district.trim(),
        city: form.city.trim(), state: form.state, zip: form.zip,
      },
      items: liveCart.map(({ lineId, id, name, variant, price, qty, custom, customStyle }) => ({ lineId, id, name, variant, price, qty, custom, customStyle })),
      giftFee: totals.giftFee,
      subtotal: totals.subtotal, shipping: totals.shipping, discount: totals.discount, total: totals.total,
      gift: form.gift ? { message: form.giftMessage.trim() } : null,
      coupon: totals.coupon,
      // Para cartão, registra apenas os 4 últimos dígitos (boa prática de segurança)
      payment:
        form.payment === "Cartão de Crédito"
          ? `Cartão de Crédito (•••• ${onlyDigits(form.cardNumber).slice(-4)})`
          : form.payment,
      status: "Recebido",
    };
    if (online) {
      // Vai para o banco; a equipe dá baixa no estoque quando o painel recebe o pedido
      try {
        await writeUserDoc(cloud.db, "pedidos", cloud.uid, (d) => ({ ...d, lista: [{ ...order, stockApplied: false }, ...d.lista] }));
      } catch (e) {
        cloudFail(e, "o pedido");
        return null;
      }
      if (!myProfile) {
        saveProfile({
          name: order.customer.name, email: order.customer.email.toLowerCase(), phone: order.customer.phone, newsletter: false,
          address: { ...order.address },
        });
      }
      setCart([]);
      notify(`Pedido ${order.id} realizado com sucesso!`);
      return order;
    }
    setOrders((prev) => [order, ...prev]);
    // Mesmo comportamento do modo online: quem compra sem cadastro fica cadastrado.
    // Sem isto, "Minha conta" seguia pedindo cadastro e "Meus pedidos" ficava vazio.
    if (!myProfile) {
      saveProfile({
        name: order.customer.name, email: order.customer.email.toLowerCase(), phone: order.customer.phone, newsletter: false,
        address: { ...order.address },
      });
    }
    // Baixa o estoque e conta o uso do cupom
    setStoreData((d) => {
      const products = { ...d.products };
      const moves = [];
      liveCart.forEach((i) => {
        const current = store.allProducts.find((p) => p.id === i.id);
        const prevStock = products[i.id] && products[i.id].stock !== undefined ? products[i.id].stock : current.stock;
        products[i.id] = { ...(products[i.id] || {}), stock: Math.max(0, prevStock - i.qty) };
        moves.push({ at: order.createdAt, productId: i.id, delta: -i.qty, saldo: products[i.id].stock, motivo: `Venda ${order.id}` });
      });
      const coupons = totals.coupon ? d.coupons.map((c) => (c.code === totals.coupon ? { ...c, uses: (c.uses || 0) + 1 } : c)) : d.coupons;
      return addMoves({ ...d, products, coupons }, moves);
    });
    setCart([]);
    notify(`Pedido ${order.id} realizado com sucesso!`);
    return order;
  };

  // Segurança: lojas antigas guardavam a senha do painel em texto no banco.
  // Assim que a equipe entra, ela é trocada pelo resumo SHA-256 (e o texto é apagado).
  useEffect(() => {
    const plain = storeData.settings.adminPassword;
    if (!adminAuthed || typeof plain !== "string" || !plain) return;
    let vivo = true;
    hashSenha(plain).then((h) => {
      if (vivo) setStoreData((d) => ({ ...d, settings: { ...d.settings, adminPasswordHash: h, adminPassword: undefined } }));
    }).catch(() => { /* navegador sem criptografia: mantém como estava */ });
    return () => { vivo = false; };
  }, [adminAuthed, storeData.settings.adminPassword]);

  const loginAdmin = () => {
    if (cloud.noAuth) setCloud((c) => ({ ...c, isAdmin: true }));
    setAdminAuthed(true);
    try { window.sessionStorage.setItem(ADMIN_SESSION_KEY, "ok"); } catch { /* ignora */ }
    notify("Bem-vindo ao Painel Admin");
  };
  const logoutAdmin = () => {
    if (cloud.provider === "firebase" && cloud.auth) cloud.auth.signOut();
    if (cloud.noAuth) setCloud((c) => ({ ...c, isAdmin: false }));
    setAdminAuthed(false);
    try { window.sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch { /* ignora */ }
    setView("store");
    window.scrollTo({ top: 0 });
    notify("Você saiu do Painel Admin");
  };
  const findOrder = (id) => ordersView.find((o) => o.id === id);
  const deleteOrder = async (id) => {
    if (online) {
      const o = findOrder(id);
      if (!o || !(await editUserItem("pedidos", o, () => []))) return;
    } else {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
    notify(`Pedido ${id} excluído`);
  };

  const updateOrder = (id, patch) => {
    if (online) {
      const o = findOrder(id);
      if (o) editUserItem("pedidos", o, (x) => [{ ...x, ...patch }]);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  /** Ações do painel sobre a loja (preços, estoque, cupons, regras) */
  const adminActions = {
    saveProduct: (id, patch) =>
      setStoreData((d) => {
        const before = store.allProducts.find((p) => p.id === id);
        const next = { ...d, products: { ...d.products, [id]: { ...(d.products[id] || {}), ...patch } } };
        if (patch.stock !== undefined && before && patch.stock !== before.stock) {
          return addMoves(next, [{ at: new Date().toISOString(), productId: id, delta: patch.stock - before.stock, saldo: patch.stock, motivo: "Ajuste no cadastro" }]);
        }
        return next;
      }),
    adjustStock: (id, delta) => {
      const p = store.allProducts.find((x) => x.id === id);
      if (!p) return;
      const saldo = Math.max(0, p.stock + delta);
      if (saldo === p.stock) return notify("O estoque já está zerado.", "error");
      setStoreData((d) => addMoves(
        { ...d, products: { ...d.products, [id]: { ...(d.products[id] || {}), stock: saldo } } },
        [{ at: new Date().toISOString(), productId: id, delta: saldo - p.stock, saldo, motivo: delta > 0 ? "Entrada manual" : "Saída manual" }]
      ));
      notify(`${p.name}: ${delta > 0 ? "+" : ""}${saldo - p.stock} (agora ${saldo} un.)`);
    },
    resetProduct: (id) =>
      setStoreData((d) => {
        const products = { ...d.products };
        const customization = { ...d.customization };
        delete products[id];
        delete customization[id];
        return { ...d, products, customization };
      }),
    saveCustomization: (id, patch) =>
      setStoreData((d) => ({ ...d, customization: { ...d.customization, [id]: { ...(d.customization[id] || {}), ...patch } } })),
    saveCoupon: (coupon, originalCode) =>
      setStoreData((d) => {
        const exists = originalCode && d.coupons.some((c) => c.code === originalCode);
        const coupons = exists ? d.coupons.map((c) => (c.code === originalCode ? coupon : c)) : [coupon, ...d.coupons];
        return { ...d, coupons };
      }),
    deleteCoupon: (code) => setStoreData((d) => ({ ...d, coupons: d.coupons.filter((c) => c.code !== code) })),
    saveSettings: (patch) => setStoreData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    saveAppearance: (next) => setStoreData((d) => ({ ...d, appearance: normalizeAppearance(next) })),
    previewStore: () => { setView("store"); window.scrollTo({ top: 0 }); },
    resetStore: () => {
      setStoreData(DEFAULT_STORE);
      notify("Loja restaurada para os valores originais");
    },
    resetOrders: () => resetOrders(),
    loadDemo: () => loadDemo(),
    clearDemo: () => clearDemo(),
    updateDonation: (id, patch) => {
      if (online) {
        const d = donationsView.find((x) => x.id === id);
        if (d) editUserItem("doacoes", d, (x) => [{ ...x, ...patch }]);
        return;
      }
      setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    },
    deleteDonation: (id) => {
      if (online) {
        const d = donationsView.find((x) => x.id === id);
        if (d) editUserItem("doacoes", d, () => []);
        return;
      }
      setDonations((prev) => prev.filter((d) => d.id !== id));
    },
    moderateReview: (r, status) => moderateReview(r, status),
    deleteReview: (r) => deleteReview(r),
    updateMessage: (m, patch) => {
      if (online) return editUserItem("mensagens", m, (x) => [{ ...x, ...patch }]);
      setMessagesLocal((cur) => {
        const next = { ...cur, lista: cur.lista.map((x) => (x.id === m.id ? { ...x, ...patch } : x)) };
        saveJSON(MESSAGES_KEY, next);
        return next;
      });
    },
    deleteMessage: (m) => {
      if (online) return editUserItem("mensagens", m, () => []).then((ok) => ok && notify("Mensagem excluída"));
      setMessagesLocal((cur) => {
        const next = { ...cur, lista: cur.lista.filter((x) => x.id !== m.id) };
        saveJSON(MESSAGES_KEY, next);
        return next;
      });
      notify("Mensagem excluída");
    },
    replyChat: (uid, text) =>
      writeChat(uid, (d) => {
        const m = chatMsg("equipe", text);
        return { ...d, mensagens: [...(d.mensagens || []), m], ultimaEm: m.at, lidoPelaEquipeEm: m.at };
      }),
    readChat: (uid) => writeChat(uid, (d) => ({ ...d, lidoPelaEquipeEm: new Date().toISOString() })),
    deleteChat: async (uid) => {
      if (!online) {
        setChatLocal(null);
        try { window.localStorage.removeItem("farmaura_chat_v1"); } catch { /* ignora */ }
      } else {
        try { await cloud.db.doc(`chats/${uid}`).delete(); } catch (e) { cloudFail(e, "a exclusão"); return; }
      }
      notify("Conversa apagada");
    },
    deleteClient: async (c) => {
      if (online) {
        if (!c.uid) return;
        try {
          await cloud.db.doc(`clientes/${c.uid}`).delete();
          notify(`Cadastro de ${c.name} apagado`);
        } catch (e) {
          cloudFail(e, "a exclusão");
        }
        return;
      }
      setProfileLocal(null);
      try { window.localStorage.removeItem(PROFILE_KEY); } catch { /* ignora */ }
      notify(`Cadastro de ${c.name} apagado`);
    },
  };

  /** Carrega ou apaga os cadastros de exemplo */
  const loadDemo = async () => {
    const people = buildDemoData(store.allProducts, store.settings);
    if (online) {
      try {
        for (let i = 0; i < people.length; i += 6) {
          await Promise.all(people.slice(i, i + 6).flatMap((p) => {
            const w = [
              cloud.db.doc(`clientes/${p.uid}`).set(p.cliente),
              cloud.db.doc(`pedidos/${p.uid}`).set({ lista: p.pedidos, demo: true, atualizadoEm: new Date().toISOString() }),
            ];
            if (p.mensagem || p.newsletter) {
              w.push(cloud.db.doc(`mensagens/${p.uid}`).set({
                lista: p.mensagem ? [p.mensagem] : [], ...(p.newsletter ? { newsletter: p.newsletter } : {}), demo: true, atualizadoEm: new Date().toISOString(),
              }));
            }
            if (p.doacao) w.push(cloud.db.doc(`doacoes/${p.uid}`).set({ lista: [p.doacao], demo: true, atualizadoEm: new Date().toISOString() }));
            return w;
          }));
        }
      } catch (e) {
        cloudFail(e, "os cadastros de exemplo");
        return;
      }
    } else {
      const strip = (list) => list.filter((x) => !x.demo);
      const clientes = people.map((p) => ({ ...p.cliente, uid: p.uid }));
      setDemoClientsLocal(clientes);
      saveJSON("farmaura_demo_clientes_v1", clientes);
      setOrders((prev) => [...strip(prev), ...people.flatMap((p) => p.pedidos)].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setDonations((prev) => [...strip(prev), ...people.filter((p) => p.doacao).map((p) => p.doacao)]);
      setMessagesLocal((m) => {
        const next = {
          lista: [...strip(m.lista || []), ...people.filter((p) => p.mensagem).map((p) => p.mensagem)],
          newsletter: [...strip(m.newsletter || []), ...people.filter((p) => p.newsletter).map((p) => p.newsletter)],
        };
        saveJSON(MESSAGES_KEY, next);
        return next;
      });
    }
    const nPed = people.reduce((a, p) => a + p.pedidos.length, 0);
    notify(`${people.length} cadastros e ${nPed} pedidos de exemplo carregados`);
  };
  const clearDemo = async () => {
    if (online) {
      try {
        const cols = ["clientes", "pedidos", "mensagens", "doacoes"];
        await Promise.all(cols.flatMap((col) => (all[col] || []).filter((d) => d.demo || String(d.uid).startsWith("demo-")).map((d) => cloud.db.doc(`${col}/${d.uid}`).delete())));
      } catch (e) {
        cloudFail(e, "a exclusão dos exemplos");
        return;
      }
    } else {
      const strip = (list) => list.filter((x) => !x.demo);
      setDemoClientsLocal([]);
      saveJSON("farmaura_demo_clientes_v1", []);
      setOrders((prev) => strip(prev));
      setDonations((prev) => strip(prev));
      setMessagesLocal((m) => {
        const next = { lista: strip(m.lista || []), newsletter: strip(m.newsletter || []) };
        saveJSON(MESSAGES_KEY, next);
        return next;
      });
    }
    notify("Cadastros de exemplo apagados");
  };

  const resetOrders = () => {
    setOrders(MOCK_ORDERS);
    notify("Pedidos de exemplo restaurados");
  };

  const updateOrderStatus = async (id, status) => {
    if (online) {
      const o = findOrder(id);
      if (!o || !(await editUserItem("pedidos", o, (x) => [{ ...x, status }]))) return;
    } else {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
    notify(`Pedido ${id} atualizado para "${status}"`);
  };

  useEffect(() => {
    const onHash = () => { setPageId(parseRoute()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const openPage = (id) => {
    setSelectedProduct(null);
    setCartOpen(false);
    if (view !== "store") setView("store");
    if (window.location.hash === `#produto-${id}`) { setPageId(id); window.scrollTo({ top: 0 }); return; }
    window.location.hash = `produto-${id}`;
  };
  const leavePage = (section = "produtos") => {
    try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch { /* ignora */ }
    setPageId(null);
    setTimeout(() => { const el = document.getElementById(section); if (el) el.scrollIntoView({ block: "start" }); }, 60);
  };
  const nav = { openPage, openQuiz: () => navigateTo("quiz") };

  /** Rolagem suave até uma seção da loja (troca para o modo loja se necessário) */
  const navigateTo = (sectionId) => {
    if (pageId) { leavePage(sectionId); return; }
    if (view !== "store") setView("store");
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const liveSelected = selectedProduct ? store.allProducts.find((p) => p.id === selectedProduct.id) : null;

  // Animação de entrada ao rolar: elementos com data-reveal surgem quando entram na tela.
  // Só liga com IntersectionObserver e sem "reduzir movimento"; sem JS o conteúdo fica visível.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("reveal-on");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    const scan = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.getElementById("root"), { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); root.classList.remove("reveal-on"); };
  }, []);

  return (
    <StoreContext.Provider value={store}>
    <NavContext.Provider value={nav}>
    <ReviewsContext.Provider value={{ ...reviewsCtx, submit: submitReview }}>
    <CloudContext.Provider value={{
      status: cloud.status, provider: cloud.provider || null, isAdmin: !!cloud.isAdmin, uid: cloud.uid || null,
      email: cloud.email || null, isAnonymous: !!cloud.isAnonymous, auth: cloud.auth || null, noAuth: !!cloud.noAuth,
    }}>
    <div className="min-h-screen bg-page font-sans text-stone-800 antialiased transition-colors duration-300">
      <Header
        view={view}
        setView={(v) => {
          setView(v);
          window.scrollTo({ top: 0 });
        }}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onNavigate={navigateTo}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeSection={view === "store" ? activeSection : null}
        cartBump={cartBump}
        onOpenAccount={() => setAccountOpen(true)}
        hasProfile={!!myProfile}
      />

      {view === "store" && pageId ? (
        <>
          <ProductPage
            productId={pageId}
            onBack={() => leavePage("produtos")}
            onAdd={(p, q) => addToCart(p, q || 1)}
            onCustomize={(p) => setSelectedProduct(p)}
            onOpenPage={openPage}
            favs={favs}
            onToggleFav={toggleFav}
            profile={myProfile}
            notify={notify}
          />
          <Footer notify={notify} onNavigate={navigateTo} onSubscribe={subscribeNewsletter} />
        </>
      ) : view === "store" ? (
        <main id="conteudo" tabIndex={-1} className="outline-none">
          {/* A ordem e as seções ligadas vêm do Painel > Aparência */}
          {appearance.secoes.filter((s) => s.on).map(({ id }) => {
            switch (id) {
              case "hero": return <Hero key={id} onShop={() => navigateTo("produtos")} onAbout={() => navigateTo("sobre")} />;
              case "beneficios": return <BenefitsStrip key={id} />;
              case "linhas": return <CategoryShowcase key={id} onNavigate={navigateTo} />;
              case "produtos": return <ProductsSection key={id} onOpen={setSelectedProduct} onAdd={addToCart} favs={favs} onToggleFav={toggleFav} setFavs={setFavs} notify={notify} />;
              case "vistos": return <RecentlyViewed key={id} onOpen={openPage} />;
              case "quiz": return <QuizSection key={id} onOpenPage={openPage} onAdd={(p) => (store.customization[p.id] ? setSelectedProduct(p) : addToCart(p))} />;
              case "doacao": return store.settings.donationsEnabled ? <DonationSection key={id} onDonate={addDonation} notify={notify} /> : null;
              case "sobre": return <AboutSection key={id} />;
              case "sustentabilidade": return <SustainabilitySection key={id} />;
              case "rastrear": return <OrderTracker key={id} orders={ordersView} />;
              case "duvidas": return <FaqSection key={id} onOpenChat={() => setChatOpen(true)} onContact={() => navigateTo("contato")} />;
              case "contato": return <ContactSection key={id} notify={notify} onSend={sendMessage} profile={myProfile} />;
              default: return null;
            }
          })}
          <Footer notify={notify} onNavigate={navigateTo} onSubscribe={subscribeNewsletter} />
        </main>
      ) : (
        <React.Suspense fallback={<CarregandoPainel />}>
        {(cloud.provider === "firebase" && !cloud.noAuth ? cloud.status === "online" && cloud.isAdmin : adminAuthed) ? (
          <AdminDashboard
            orders={ordersView}
            donations={donationsView}
            clients={clientsView}
            messages={messagesView}
            newsletter={newsletterView}
            chats={chatsView}
            reviews={reviewsAll}
            onUpdateStatus={updateOrderStatus}
            onUpdateOrder={updateOrder}
            onDelete={deleteOrder}
            onLogout={logoutAdmin}
            notify={notify}
            actions={adminActions}
          />
        ) : (
          <AdminLogin onLogin={loginAdmin} onBack={() => setView("store")} />
        )}
        </React.Suspense>
      )}

      {view === "store" && (
        <CompareBar onAdd={(p) => (store.customization[p.id] ? setSelectedProduct(p) : addToCart(p))} onOpenPage={openPage} />
      )}
      {view === "store" && sharedFavs && (
        <SharedFavorites ids={sharedFavs} onClose={closeShared} onSaveAll={saveSharedFavs} onOpenPage={openPage} />
      )}

      {/* Modal de detalhes — key reinicia aba/quantidade a cada produto aberto */}
      {liveSelected && (
        <ProductModal
          key={liveSelected.id}
          product={liveSelected}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
          isFav={favs.includes(liveSelected.id)}
          onToggleFav={toggleFav}
        />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={liveCart}
        updateQty={updateQty}
        removeItem={removeItem}
        onPlaceOrder={placeOrder}
        notify={notify}
        onAdd={(p) => addToCart(p, 1, { silent: true })}
        profile={myProfile}
      />

      <AccountPanel
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        profile={myProfile}
        onSave={saveProfile}
        orders={myOrders}
        donations={myDonations}
        notify={notify}
      />

      {view === "store" && (
        <ChatWidget open={chatOpen} setOpen={setChatOpen} chat={myChat} profile={myProfile} onSend={sendChat} onRead={readChatCliente} />
      )}

      {/* Voltar ao topo */}
      {showTop && view === "store" && !chatOpen && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-30 flex h-11 w-11 items-center justify-center rounded-full bg-surface max-sm:hidden text-stone-800 shadow-lg ring-1 ring-stone-900/10 transition hover:-translate-y-0.5"
          style={{ right: "calc(1.25rem + 0.375rem + env(safe-area-inset-right, 0px))", bottom: "calc(5.75rem + env(safe-area-inset-bottom, 0px))" }}
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <Toast toast={toast} onAction={() => { setToast(null); setCartOpen(true); }} />
    </div>
    </CloudContext.Provider>
    </ReviewsContext.Provider>
    </NavContext.Provider>
    </StoreContext.Provider>
  );
}

export class Boundary extends React.Component {
  constructor(p){ super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err){ return { err }; }
  render(){ return this.state.err
    ? <pre style={{padding:24,whiteSpace:"pre-wrap",color:"#9f1239"}}>Erro ao carregar: {String(this.state.err && this.state.err.stack || this.state.err)}</pre>
    : this.props.children; }
}
