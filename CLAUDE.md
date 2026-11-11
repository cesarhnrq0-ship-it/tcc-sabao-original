# Farmaura — instruções para o Claude Code

Site de e-commerce do TCC "Farmaura" (SENAI). Equipe: Cesar Henrique, Matheus Henrique e Pedro Henrique.
Publicado no GitHub Pages: https://cesarhnrq0-ship-it.github.io/tcc-sabao-original/
Responda sempre em português do Brasil.

## Estrutura (versão 2, com Vite)
O código é compilado antes de publicar (antes era compilado no navegador com Babel). Comandos:
- `npm run dev`: abre o site em http://localhost:5173 e atualiza sozinho a cada mudança.
- `npm run build`: gera `publicar/` (o que vai para o GitHub Pages).
- `npm run build:claude`: gera `publicar-claude/index.html` (arquivo único, com fotos dentro, para publicar no Claude).
- `npm run imagens`: converte `imagens/*.jpg` (originais) em WebP leve em `public/imagens/`.

Pastas:
- `index.html` (raiz): só o "esqueleto" com SEO e fontes. NÃO é o site pronto; o site pronto sai em `publicar/`.
- `src/main.jsx` e `src/App.jsx`: entrada e estado global (carrinho, pedidos, banco, rotas `#produto-<id>` e `#favoritos=...`).
- `src/data/`: `catalogo.js` (PRODUCTS, CUSTOMIZATION, QUIZ...), `loja.js` (DEFAULT_SETTINGS, cupons, `buildStore`, `normalizeStore`), `exemplos.js`, `imagens.js`.
- `src/lib/`: `aparencia.js` (painel Aparência), `frete.js` (frete por região + ViaCEP), `recursos.js` (vistos, comparador, favoritos por link),
  `seguranca.js` (hash da senha do painel), `nuvem.js` (Firebase), `util.js`, `contextos.js`, `icones.jsx`.
- `src/components/loja/`: Cabecalho, Inicio (Hero, faixa, "Compre por linha"), Catalogo (busca com sugestões, cards), ProdutoPagina, ProdutoModal,
  Carrinho (checkout com CEP automático), Conta, Chat, Secoes (quiz, sobre, contato, FAQ, rodapé...), Recursos (comparador, vistos, frete por CEP).
- `src/components/admin/`: AdminDashboard (abas), Paineis (pedidos, produtos, cupons, configurações...), AparenciaPanel, Login.
  O painel é carregado sob demanda (React.lazy), então não pesa na loja.
- `src/estilos.css` + `tailwind.config.js`: tokens de cor em variáveis CSS (`--emerald-*`, `--stone-*`, `--page`, `--destaque`, `--banner`...).
- `firestore.rules`: regras recomendadas do Firestore (projeto Firebase `tcc-sabao`).
- `versao-antiga/` e `versao-anterior-2026-11-11/`: cópias antigas, só para consulta. Não editar.

## Aparência editável (Painel Admin > Aparência)
Cores, fontes, cantos, formato das fotos, tema padrão, avisos do topo, textos do banner, benefícios, "Sobre", newsletter,
contato/WhatsApp/Instagram e ordem/visibilidade das seções ficam em `store.appearance` (salvo com a loja: localStorage ou
Firebase `loja/config`). Ao criar uma seção nova na página inicial: adicione em `SECOES` (`lib/aparencia.js`) e no `switch` do `App.jsx`.
Use as classes `bg-destaque`, `text-destaque-fg`, `bg-banner` e a escala `emerald-*` (que segue a "cor principal"); evite cores fixas em hex.

## Regras ao alterar
- Preservar o fluxo de pedido e o painel. Evoluir, não recriar.
- Não colocar senhas ou chaves privadas no código (a apiKey do Firebase é pública por natureza). A senha do painel fica só como hash SHA-256.
- Não inventar avaliações, certificações ou números; dados de exemplo só pelo botão do painel (marcados `demo: true`).
- Testar com `npm run dev` e no celular (F12 > modo dispositivo). Antes de publicar, `npm run build` e `npm run preview`.
- Cuidado ao testar o painel: o site conecta no Firebase real. Em testes automáticos, bloqueie o Firebase (o site cai no modo local).

## Publicar
A pasta é um clone do repositório `cesarhnrq0-ship-it/tcc-sabao-original` (branch `main`).
O GitHub Actions (`.github/workflows/publicar.yml`) roda `npm ci` + `npm run build` e publica `publicar/` no GitHub Pages
a cada push na `main` (Settings > Pages > Source = "GitHub Actions"). Para enviar: `enviar-para-github.bat` ou
`git add -A && git commit -m "..." && git push origin main`. Não versionar `publicar/`, `node_modules/` nem as pastas de versão antiga.
