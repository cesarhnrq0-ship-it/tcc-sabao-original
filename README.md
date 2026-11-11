# Farmaura — E-commerce de Dermocosméticos (TCC SENAI)

Loja virtual completa: catálogo com busca e filtros, página de produto com QR Code e avaliações,
comparador, frete por CEP, carrinho e checkout com PIX, conta do cliente, chat ao vivo, doações
e painel administrativo (pedidos, estoque, cupons, avaliações, clientes e **aparência editável**).

Site: https://cesarhnrq0-ship-it.github.io/tcc-sabao-original/

## Rodar

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # gera publicar/ para o GitHub Pages
npm run build:claude # gera publicar-claude/index.html (arquivo único)
```

No Windows, dá para usar `rodar-site.bat` e `gerar-site.bat`.

## Tecnologia

- **React 18 + Vite 6**: código em módulos (`src/`), compilado antes de publicar.
- **Tailwind CSS 3** compilado, com cores em variáveis CSS (tema claro/escuro e cores da marca trocadas em tempo real pelo painel).
- **Firebase** (Auth + Firestore) para dados compartilhados, com reserva no `localStorage` (modo local).
- **ViaCEP** para buscar endereço e calcular frete por região.
- Painel admin carregado sob demanda (`React.lazy`).

## Medições (antes → depois, mesma máquina)

| | Versão 1 (Babel no navegador) | Versão 2 (Vite) |
| --- | --- | --- |
| Dados baixados na primeira visita | 1,74 MB | 0,25 MB |
| Loja pronta para usar | ~1,9 s | ~1,0 s |
| Fotos | 691 KB (JPG) | 277 KB (WebP) |
| Problemas WCAG 2.1 AA (axe) | — | 0 (claro, escuro e página de produto) |

## Estrutura

Veja `CLAUDE.md` (mapa dos arquivos) e `LEIA-ME.txt` (guia da equipe: publicar, Firebase, senha).

## Observação

Pagamentos são simulados (o QR Code PIX é real, mas a confirmação é manual no painel).
