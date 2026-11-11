/* ============================================================================
 * BANCO DE DADOS
 * No link do site no Claude, os dados vão para o banco de dados do próprio
 * site (capability "db"), e todo mundo que abre o site vê a mesma loja:
 *   loja/config        -> preços, estoque, cupons e regras (só a equipe altera)
 *   clientes/<pessoa>  -> cadastro de cada cliente
 *   pedidos/<pessoa>   -> pedidos de cada cliente     { lista: [...] }
 *   doacoes/<pessoa>   -> doações de cada pessoa      { lista: [...] }
 *   mensagens/<pessoa> -> contato e newsletter        { lista: [...], newsletter }
 * Cada pessoa lê e grava só o próprio documento; a equipe (dono e Editores)
 * lê e altera tudo. Fora do Claude (arquivo baixado, GitHub Pages), tudo
 * continua salvo no navegador (localStorage).
 * ========================================================================== */
export const CLOUD_COLLECTIONS = ["clientes", "pedidos", "doacoes", "mensagens", "chats", "avaliacoes"];

/* ----------------------------------------------------------------------------
 * FIREBASE — usado quando o site está publicado fora do Claude
 * (GitHub Pages, Netlify...). A apiKey do Firebase pode ficar no código:
 * quem protege os dados são as regras do Firestore (arquivo firestore.rules).
 * -------------------------------------------------------------------------- */
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA1_L5-MRL-hZgx4_KF2zqM0mEuBWinRdA",
  authDomain: "tcc-sabao.firebaseapp.com",
  projectId: "tcc-sabao",
  storageBucket: "tcc-sabao.firebasestorage.app",
  messagingSenderId: "947728312700",
  appId: "1:947728312700:web:45edd73fd5b2be87445cf9",
  measurementId: "G-DJW0YS7PYM",
};
export const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/13.1.0";
/** E-mails da equipe que entram no Painel Admin (precisam ser os mesmos do firestore.rules) */
export const FIREBASE_ADMINS = ["farmaurainc@gmail.com"];
export const isTeamEmail = (email) => !!email && FIREBASE_ADMINS.includes(String(email).toLowerCase());

/** Mensagens de erro do Firebase em português */
export const FIREBASE_ERRORS = {
  "auth/email-already-in-use": "Esse e-mail já tem cadastro. Use “Entrar”.",
  "auth/credential-already-in-use": "Esse e-mail já tem cadastro. Use “Entrar”.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/invalid-login-credentials": "E-mail ou senha incorretos.",
  "auth/too-many-requests": "Muitas tentativas. Espere alguns minutos e tente de novo.",
  "auth/network-request-failed": "Sem conexão com a internet.",
  "auth/operation-not-allowed": "O login por e-mail ainda não foi ligado no Firebase.",
  "auth/unauthorized-domain": "Este endereço do site ainda não foi autorizado no Firebase.",
};
export const authMessage = (e) => FIREBASE_ERRORS[e && e.code] || "Não foi possível concluir agora. Tente de novo.";

/** Faz o Firestore se comportar como o banco do Claude (mesmos métodos que o site já usa) */
export const firebaseAdapter = (fs, firestore) => {
  const wrap = (snap) => ({ id: snap.id, exists: snap.exists(), data: () => snap.data() });
  return {
    doc: (path) => {
      const ref = fs.doc(firestore, path);
      return {
        get: async () => wrap(await fs.getDoc(ref)),
        // O Firestore recusa campos "undefined": a ida e volta em JSON tira esses campos
        set: (data) => fs.setDoc(ref, JSON.parse(JSON.stringify(data))),
        delete: () => fs.deleteDoc(ref),
        onSnapshot: (next, error) => fs.onSnapshot(ref, (snap) => next(wrap(snap)), error),
      };
    },
    collection: (path) => ({
      onSnapshot: (next, error) =>
        fs.onSnapshot(fs.collection(firestore, path), (qs) => next({ docs: qs.docs.map(wrap), size: qs.size, empty: qs.empty }), error),
    }),
  };
};

/** Código fixo deste aparelho (usado quando o login do Firebase não está ligado) */
export const deviceId = () => {
  try {
    let id = window.localStorage.getItem("farmaura_device_id");
    if (!id) {
      id = "dev-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      window.localStorage.setItem("farmaura_device_id", id);
    }
    return id;
  } catch {
    return "dev-" + Math.random().toString(36).slice(2, 10);
  }
};

/** Carrega o Firebase, entra como visitante anônimo e avisa a cada troca de usuário */
export const connectFirebase = async (onUser) => {
  const [appM, authM, fsM] = await Promise.all(
    ["firebase-app", "firebase-auth", "firebase-firestore"].map((m) => import(/* @vite-ignore */ `${FIREBASE_SDK}/${m}.js`))
  );
  const app = appM.initializeApp(FIREBASE_CONFIG);
  const auth = authM.getAuth(app);
  const db = firebaseAdapter(fsM, fsM.getFirestore(app));
  const info = (u) => ({ uid: u.uid, email: u.email || null, isAnonymous: !!u.isAnonymous, noAuth: false });
  const api = {
    /** Cria a conta. O visitante anônimo vira a conta, então os pedidos já feitos continuam dele. */
    signUp: async (email, password) => {
      const current = auth.currentUser;
      if (current && current.isAnonymous) {
        await authM.linkWithCredential(current, authM.EmailAuthProvider.credential(email, password));
      } else {
        await authM.createUserWithEmailAndPassword(auth, email, password);
      }
      if (auth.currentUser) onUser(info(auth.currentUser), null, { db, api });
    },
    signIn: (email, password) => authM.signInWithEmailAndPassword(auth, email, password),
    signOut: () => authM.signOut(auth),
    resetPassword: (email) => authM.sendPasswordResetEmail(auth, email),
  };
  authM.onAuthStateChanged(auth, (user) => {
    if (!user) {
      authM.signInAnonymously(auth).catch((e) => {
        // Login anônimo desligado no console: o site funciona mesmo assim (regras abertas),
        // usando um código salvo neste aparelho no lugar da conta.
        console.warn("[banco] Firebase sem login anônimo:", e && e.code);
        onUser({ uid: deviceId(), email: null, isAnonymous: true, noAuth: true }, null, { db, api });
      });
      return;
    }
    onUser(info(user), null, { db, api });
  });
};
/** Código curto e único (ex.: FA-K3J9QX) para não repetir entre aparelhos */
export const cloudId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 36).toString(36).toUpperCase()}`;
/** Lê o documento da pessoa, altera e grava de novo (uma escrita por vez) */
export const writeUserDoc = async (db, col, uid, fn) => {
  const ref = db.doc(`${col}/${uid}`);
  const snap = await ref.get();
  const cur = snap.exists ? snap.data() : {};
  const next = fn({ ...cur, lista: Array.isArray(cur.lista) ? cur.lista : [] });
  await ref.set({ ...next, atualizadoEm: new Date().toISOString() });
  return next;
};
