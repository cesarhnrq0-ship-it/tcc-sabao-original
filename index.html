<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>Farmaura Natural – Sabonete em pó</title>
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
<style>
:root{--bg:#f6f8f3;--card:#fff;--tx:#1f2a22;--mut:#5d6b61;--g:#3f7d4e;--g2:#e3efe5;--bd:#dbe4dc;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121a15;--card:#1b261f;--tx:#e8efe9;--mut:#9fb0a4;--g:#6fbf84;--g2:#223329;--bd:#2c3d32}}
html{scroll-behavior:smooth;scroll-padding-top:5rem}
body{background:var(--bg);color:var(--tx);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.card{background:var(--card);border:1px solid var(--bd);border-radius:1rem}
.btn{background:var(--g);color:#fff;border-radius:.75rem;padding:.7rem 1.2rem;font-weight:600}
.btn:hover{filter:brightness(1.08)}
.btn2{border:1px solid var(--g);color:var(--g);border-radius:.75rem;padding:.6rem 1rem;font-weight:600}
.inp{width:100%;background:var(--bg);border:1px solid var(--bd);border-radius:.6rem;padding:.6rem .8rem;color:var(--tx)}
.mut{color:var(--mut)}.gr{color:var(--g)}
[x-cloak]{display:none!important}
</style>
</head>
<body x-data="loja()" x-init="init()">

<div class="text-center text-sm py-2 px-3 font-medium" style="background:var(--g);color:#fff">Cupom <b>PRIMEIRA10</b>: 10% de desconto · Frete grátis acima de R$ 70</div>
<header class="sticky top-0 z-30 backdrop-blur" style="background:color-mix(in srgb,var(--bg) 90%,transparent);border-bottom:1px solid var(--bd)">
  <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href="#topo" class="text-xl font-bold gr">🌿 Farmaura</a>
    <nav class="hidden sm:flex gap-6 text-sm font-medium">
      <a href="#produtos">Produtos</a><a href="#como-usar">Como usar</a><a href="#sobre">Sobre</a><a href="#faq">Dúvidas</a>
    </nav>
    <div class="flex items-center gap-2">
      <button class="btn2 text-sm" @click="modal='cadastro'" x-text="perfil ? 'Olá, '+perfil.nome.split(' ')[0] : 'Cadastrar'"></button>
      <button class="btn2 relative" @click="abrir=true" aria-label="Abrir carrinho">
        Carrinho <span class="ml-1 inline-block min-w-5 text-center rounded-full text-xs px-1.5 py-0.5" style="background:var(--g);color:#fff" x-text="qtd"></span>
      </button>
    </div>
  </div>
  <nav class="sm:hidden flex gap-5 text-sm font-medium overflow-x-auto px-4 pb-2 whitespace-nowrap">
    <a href="#produtos">Produtos</a><a href="#como-usar">Como usar</a><a href="#sobre">Sobre</a><a href="#faq">Dúvidas</a>
  </nav>
</header>

<main id="topo">
  <section class="max-w-5xl mx-auto px-4 py-12 sm:py-20 grid sm:grid-cols-2 gap-10 items-center">
    <div>
      <p class="text-sm font-semibold gr mb-2">Natural · Vegano · Artesanal</p>
      <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight">Sabonete em pó que cuida da sua pele e do planeta.</h1>
      <p class="mt-4 mut text-lg">Sem água, sem desperdício e sem embalagem excessiva. Basta umedecer, espumar e usar.</p>
      <div class="mt-6 flex gap-3 flex-wrap">
        <a href="#produtos" class="btn">Ver produtos</a><a href="#como-usar" class="btn2">Como usar</a>
      </div>
    </div>
    <div class="flex justify-center" aria-hidden="true">
      <div class="rounded-full p-6 flex items-center justify-center" style="background:var(--g2)">
        <img :src="produtos[0].img" alt="Embalagem do sabonete em pó Farmaura Wayfarer" class="w-48 sm:w-60 rounded-xl">
      </div>
    </div>
  </section>

  <section id="produtos" class="max-w-5xl mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold mb-4">Nossos produtos</h2>
    <div class="flex flex-wrap gap-2 mb-6" role="tablist">
      <template x-for="c in ['Todos','Sabonetes','Protetor solar','Acessórios']" :key="c">
        <button class="btn2 !py-1 !px-3 text-sm" :style="cat===c?'background:var(--g2)':''" @click="cat=c" x-text="c"></button>
      </template>
    </div>
    <div class="grid sm:grid-cols-2 gap-6">
      <template x-for="p in lista" :key="p.base||p.id">
        <article class="card p-5 flex flex-col">
          <div class="rounded-xl flex items-center justify-center h-64 overflow-hidden" style="background:var(--g2)">
            <img x-show="p.img" :src="p.img" :alt="p.nome" class="h-full object-contain">
            <span x-show="!p.img" class="text-6xl" x-text="p.emoji"></span>
          </div>
          <h3 class="mt-4 text-xl font-bold" x-text="p.nome"></h3>
          <p class="mut text-sm mt-1" x-text="p.desc"></p>
          <p class="text-xs gr font-semibold mt-2" x-text="p.info"></p>
          <div x-show="p.tam" class="flex gap-2 mt-3">
            <template x-for="t in (p.tam||[])" :key="t.k">
              <button type="button" class="btn2 !py-1 !px-3 text-sm" :style="(sel[p.base]||p.tam[0].k)===t.k?'background:var(--g2)':''" @click="sel[p.base]=t.k" x-text="t.rotulo"></button>
            </template>
          </div>
          <div class="mt-auto pt-4 flex items-center justify-between">
            <span class="text-2xl font-bold" x-text="moeda(p.preco)"></span>
            <button x-show="!qtdDe(p.id)" class="btn" @click="add(p)">Adicionar</button>
            <div x-show="qtdDe(p.id)" x-cloak class="flex items-center gap-2">
              <button class="btn2 !px-3 !py-1" @click="mudar(itens.find(i=>i.id===p.id),-1)" aria-label="Diminuir">−</button>
              <span class="font-semibold w-6 text-center" x-text="qtdDe(p.id)"></span>
              <button class="btn2 !px-3 !py-1" @click="add(p)" aria-label="Aumentar">+</button>
            </div>
          </div>
        </article>
      </template>
    </div>
  </section>

  <section class="max-w-5xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-4">
    <div class="card p-5"><div class="text-3xl">🌱</div><h3 class="font-bold mt-2">100% vegano</h3><p class="mut text-sm">Ingredientes de origem vegetal e sem testes em animais.</p></div>
    <div class="card p-5"><div class="text-3xl">♻️</div><h3 class="font-bold mt-2">Menos plástico</h3><p class="mut text-sm">Sachês individuais e refill para reduzir embalagens.</p></div>
    <div class="card p-5"><div class="text-3xl">✋</div><h3 class="font-bold mt-2">Artesanal</h3><p class="mut text-sm">Produzido em pequenos lotes, com cuidado em cada etapa.</p></div>
  </section>

  <section id="como-usar" class="max-w-5xl mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold mb-6">Como usar</h2>
    <ol class="grid sm:grid-cols-3 gap-4">
      <li class="card p-5"><span class="gr font-bold text-2xl">1</span><p class="mt-1">Despeje o conteúdo de um sachê na palma da mão.</p></li>
      <li class="card p-5"><span class="gr font-bold text-2xl">2</span><p class="mt-1">Adicione um pouco de água e esfregue até formar espuma.</p></li>
      <li class="card p-5"><span class="gr font-bold text-2xl">3</span><p class="mt-1">Massageie o corpo e enxágue. Pronto!</p></li>
    </ol>
  </section>

  <section id="impacto" class="max-w-5xl mx-auto px-4 py-10">
    <div class="card p-6">
      <h2 class="text-3xl font-bold">Calculadora de impacto</h2>
      <p class="mut text-sm mt-1">Quantos frascos de sabonete líquido você deixa de usar ao trocar pelo sabonete em pó?</p>
      <label class="block mt-4 text-sm font-medium">Banhos por semana: <b x-text="banhos"></b><input type="range" min="1" max="21" x-model.number="banhos" class="w-full mt-2"></label>
      <div class="grid grid-cols-3 gap-3 mt-4 text-center">
        <div><p class="text-2xl font-bold gr" x-text="frascos"></p><p class="text-xs mut">frascos a menos por ano</p></div>
        <div><p class="text-2xl font-bold gr" x-text="frascos*25+' g'"></p><p class="text-xs mut">de plástico dos frascos</p></div>
        <div><p class="text-2xl font-bold gr" x-text="kits"></p><p class="text-xs mut">kits Wayfarer por ano</p></div>
      </div>
      <button class="btn mt-5" @click="add(produtos[0])">Quero meu kit</button>
      <p class="text-xs mut mt-3">Estimativa do projeto: considera frasco de 250 ml com cerca de 25 g de plástico e 25 banhos por frasco; não inclui a embalagem do pó. Substitua pelos dados da sua pesquisa.</p>
    </div>
  </section>

  <section class="max-w-5xl mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold mb-4">Pó × líquido</h2>
    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left mut"><th class="p-3"></th><th class="p-3 gr">Sabonete em pó</th><th class="p-3">Sabonete líquido</th></tr>
        </thead>
        <tbody>
          <template x-for="r in [['Água na fórmula','Não','Sim'],['Peso e transporte','Leve e compacto','Mais pesado'],['Em viagem','Menos risco de vazar','Pode vazar'],['Dose','Um sachê por banho','A olho']]" :key="r[0]">
            <tr style="border-top:1px solid var(--bd)"><td class="p-3 font-medium" x-text="r[0]"></td><td class="p-3 gr" x-text="r[1]"></td><td class="p-3" x-text="r[2]"></td></tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>

  <section id="sobre" class="max-w-5xl mx-auto px-4 py-10">
    <div class="card p-6 sm:p-8">
      <h2 class="text-3xl font-bold">Sobre a Farmaura</h2>
      <p class="mt-3 mut">A Farmaura nasceu de um projeto de TCC com um objetivo simples: oferecer cosméticos naturais, práticos e sustentáveis. Nosso sabonete em pó dispensa a água na fórmula, o que torna o produto leve, compacto e de longa duração.</p>
    </div>
  </section>

  <section id="faq" class="max-w-5xl mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold mb-6">Dúvidas frequentes</h2>
    <div class="space-y-3">
      <template x-for="(f,i) in faq" :key="i">
        <div class="card p-4">
          <button class="w-full text-left font-semibold flex justify-between" @click="aberta = aberta===i ? null : i">
            <span x-text="f[0]"></span><span x-text="aberta===i ? '−' : '+'"></span>
          </button>
          <p x-show="aberta===i" x-cloak class="mut mt-2 text-sm" x-text="f[1]"></p>
        </div>
      </template>
    </div>
  </section>
</main>

<footer class="mt-10 pt-8 pb-24 text-center text-sm mut" style="border-top:1px solid var(--bd)">
  © 2026 Farmaura Natural · Projeto acadêmico (TCC) · Contato: contato@farmaura.com.br · <button class="underline" @click="abrirMeus()">Meus pedidos</button> · <button class="underline" @click="abrirAdmin()">Admin</button>
</footer>

<div x-show="modal==='cadastro'" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4" @keydown.escape.window="modal=''">
  <div class="absolute inset-0 bg-black/50" @click="modal=''"></div>
  <form @submit.prevent="salvarPerfil()" class="card relative w-full max-w-md p-5 space-y-3 max-h-full overflow-y-auto">
    <div class="flex justify-between items-center"><h2 class="text-2xl font-bold" x-text="perfil?'Meu cadastro':'Criar cadastro'"></h2><button type="button" class="text-2xl" @click="modal=''" aria-label="Fechar">×</button></div>
    <p x-show="!podeGravar" class="text-sm p-3 rounded-lg" style="background:var(--g2)">Para salvar o cadastro é preciso estar conectado ao Claude com acesso de colaborador a este site. Sem isso, o site funciona só como vitrine.</p>
    <template x-for="c in campos" :key="c[0]"><label class="block text-sm font-medium"><span x-text="c[1]"></span><input class="inp mt-1" :type="c[2]" :required="c[3]" x-model="f2[c[0]]"></label></template>
    <label class="flex gap-2 text-xs mut"><input type="checkbox" required x-model="f2.ok"><span>Concordo em compartilhar meus dados com a Farmaura para compra e contato (LGPD).</span></label>
    <p class="text-sm gr font-medium" x-text="msg"></p>
    <button class="btn w-full" x-text="perfil?'Atualizar cadastro':'Cadastrar'"></button>
  </form>
</div>

<div x-show="modal==='meus'" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="absolute inset-0 bg-black/50" @click="modal=''"></div>
  <div class="card relative w-full max-w-md p-5 max-h-full overflow-y-auto">
    <div class="flex justify-between items-center mb-3"><h2 class="text-2xl font-bold">Meus pedidos</h2><button class="text-2xl" @click="modal=''" aria-label="Fechar">×</button></div>
    <p x-show="!meus.length" class="mut text-sm">Nenhum pedido encontrado. Os pedidos só aparecem para quem está conectado ao Claude com acesso de colaborador.</p>
    <template x-for="p in meus" :key="p.num+p.data"><div class="mb-3 p-3 rounded-lg" style="background:var(--g2)"><div class="flex justify-between"><b x-text="p.num"></b><span class="text-xs font-semibold gr" x-text="p.status||'Pendente'"></span></div><p class="text-xs mut" x-text="dt(p.data)"></p><p class="text-sm" x-text="(p.itens||[]).join(', ')"></p><p class="text-sm font-semibold" x-text="moeda(+p.total||0)"></p></div></template>
  </div>
</div>

<div x-show="modal==='admin'" x-cloak class="fixed inset-0 z-50 overflow-y-auto" style="background:var(--bg);padding-top:env(safe-area-inset-top,0px)" @keydown.escape.window="if(modal==='admin')modal=''">
  <div class="max-w-5xl mx-auto p-4 sm:p-6">
    <div class="flex justify-between items-center mb-4 gap-2">
      <h2 class="text-2xl font-bold">Painel do administrador</h2>
      <div class="flex gap-2"><button class="btn2" x-show="logado" @click="sair()">Sair</button><button class="btn2" @click="sair(); modal=''">Fechar</button></div>
    </div>
    <p x-show="!logado && !eAdmin" class="card p-5 max-w-md">🔒 Acesso restrito. O painel só abre para quem administra este site (dono ou editor), com a senha do painel.</p>
    <form x-show="!logado && eAdmin" @submit.prevent="entrar()" class="card p-5 max-w-sm space-y-3">
      <p class="text-sm mut" x-text="semSenha ? 'Primeiro acesso: crie a senha do painel (mínimo 6 caracteres).' : 'Digite a senha para entrar.'"></p>
      <input class="inp" type="password" required minlength="6" autocomplete="current-password" placeholder="Senha" x-model="senha">
      <p class="text-sm" style="color:#c0392b" x-text="erroAdm"></p>
      <button class="btn w-full" x-text="semSenha ? 'Criar senha e entrar' : 'Entrar'"></button>
    </form>
    <div x-show="logado" x-cloak>
      <p class="text-sm mb-2" style="color:#c0392b" x-text="erroAdm"></p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <template x-for="s in [['Faturamento (pagos)',moeda(fat)],['A receber (pendentes)',moeda(pend)],['Pedidos',pedidos.length],['Clientes',clientes.length]]" :key="s[0]">
          <div class="card p-4"><p class="text-xs mut" x-text="s[0]"></p><p class="text-2xl font-bold gr" x-text="s[1]"></p></div>
        </template>
      </div>
      <div class="grid sm:grid-cols-2 gap-3 mb-6">
        <div class="card p-4"><p class="font-semibold mb-3">Vendas dos últimos 7 dias</p>
          <div class="flex items-end gap-2 h-32"><template x-for="d in dias" :key="d.d"><div class="flex-1 flex flex-col items-center justify-end h-full"><div class="w-full rounded-t" style="background:var(--g)" :style="'height:'+Math.max(d.h,2)+'%'" :title="moeda(d.v)"></div><span class="text-[10px] mut mt-1" x-text="d.d"></span></div></template></div></div>
        <div class="card p-4"><p class="font-semibold mb-3">Mais vendidos</p>
          <template x-for="t in top" :key="t[0]"><div class="flex justify-between text-sm py-1"><span x-text="t[0]"></span><b x-text="t[1]+' un.'"></b></div></template>
          <p x-show="!top.length" class="mut text-sm">Sem vendas ainda.</p></div>
      </div>
      <div class="flex gap-2 mb-3"><button class="btn2" :style="aba==='pedidos'?'background:var(--g2)':''" @click="aba='pedidos'">Pedidos</button><button class="btn2" :style="aba==='clientes'?'background:var(--g2)':''" @click="aba='clientes'">Clientes</button><button class="btn2 ml-auto" @click="exportar()">Exportar CSV</button></div>
      <div class="card overflow-x-auto" x-show="aba==='pedidos'">
        <table class="w-full text-sm"><thead><tr class="text-left mut"><th class="p-3">Pedido</th><th class="p-3">Cliente</th><th class="p-3">Itens</th><th class="p-3">Pagamento</th><th class="p-3">Total</th><th class="p-3">Status</th></tr></thead>
        <tbody><template x-for="p in pedidos" :key="p.num+p.data"><tr style="border-top:1px solid var(--bd)">
          <td class="p-3"><b x-text="p.num"></b><br><span class="mut text-xs" x-text="dt(p.data)"></span></td>
          <td class="p-3"><span x-text="p.cliente"></span><br><span class="mut text-xs" x-text="p.email"></span></td>
          <td class="p-3" x-text="(p.itens||[]).join(', ')"></td><td class="p-3" x-text="p.pag"></td><td class="p-3 font-semibold" x-text="moeda(+p.total||0)"></td><td class="p-3"><select class="inp !py-1" :value="p.status||'Pendente'" @change="mudarStatus(p,$event.target.value)"><option>Pendente</option><option>Pago</option><option>Enviado</option><option>Entregue</option></select></td></tr></template></tbody></table>
        <p x-show="!pedidos.length" class="p-4 mut text-sm">Nenhum pedido ainda.</p>
      </div>
      <div class="card overflow-x-auto" x-show="aba==='clientes'">
        <table class="w-full text-sm"><thead><tr class="text-left mut"><th class="p-3">Nome</th><th class="p-3">E-mail</th><th class="p-3">Telefone</th><th class="p-3">Nascimento</th><th class="p-3">Endereço</th><th class="p-3">Cidade / CEP</th><th class="p-3">Cadastro</th></tr></thead>
        <tbody><template x-for="c in clientes" :key="c.email+c.criado"><tr style="border-top:1px solid var(--bd)">
          <td class="p-3" x-text="c.nome"></td><td class="p-3" x-text="c.email"></td><td class="p-3" x-text="c.tel"></td><td class="p-3" x-text="c.nasc||'—'"></td><td class="p-3" x-text="c.end"></td><td class="p-3" x-text="c.cidade"></td><td class="p-3" x-text="dt(c.criado)"></td></tr></template></tbody></table>
        <p x-show="!clientes.length" class="p-4 mut text-sm">Nenhum cadastro ainda.</p>
      </div>
    </div>
  </div>
</div>

<div x-show="chatAberto" x-cloak x-transition class="fixed z-40 inset-x-3 bottom-3 sm:inset-x-auto sm:right-3 sm:w-96 card flex flex-col shadow-xl" style="height:min(30rem,75vh);margin-bottom:env(safe-area-inset-bottom,0px)" @keydown.escape.window="chatAberto=false">
  <div class="flex justify-between items-center p-3" style="border-bottom:1px solid var(--bd)"><b>🌿 Assistente Farmaura</b><button @click="chatAberto=false" class="text-xl" aria-label="Fechar chat">×</button></div>
  <div x-ref="msgs" class="flex-1 overflow-y-auto p-3 space-y-2" aria-live="polite">
    <template x-for="(m,i) in chat" :key="i"><div :class="m.r==='u'?'flex justify-end':'flex'"><p class="text-sm px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap" :style="m.r==='u'?'background:var(--g);color:#fff':'background:var(--g2)'" x-text="m.t"></p></div></template>
    <p x-show="digitando" class="text-xs mut">Digitando…</p>
    <div x-show="chat.length<2" class="flex flex-wrap gap-2 pt-1"><template x-for="s in sugestoes" :key="s"><button class="btn2 !text-xs !py-1" @click="perguntar(s)" x-text="s"></button></template></div>
  </div>
  <form @submit.prevent="perguntar()" class="p-3 flex gap-2" style="border-top:1px solid var(--bd)"><input class="inp" placeholder="Digite sua dúvida…" x-model="chatTxt" maxlength="300"><button class="btn !px-4" :disabled="digitando">Enviar</button></form>
</div>
<button x-show="!chatAberto && !abrir && modal===''" x-cloak class="fixed right-3 z-30 btn shadow-lg !rounded-full" :style="'bottom:calc('+(qtd>0?'5rem':'1rem')+' + env(safe-area-inset-bottom,0px))'" @click="chatAberto=true">💬 Ajuda</button>

<div x-show="toast" x-cloak x-transition class="fixed left-1/2 -translate-x-1/2 z-50 card px-4 py-2 text-sm font-medium shadow-lg" style="bottom:calc(5rem + env(safe-area-inset-bottom,0px))" role="status" x-text="'✓ '+toast"></div>
<div x-show="qtd>0 && !abrir" x-cloak class="fixed inset-x-0 bottom-0 z-30 p-3" style="padding-bottom:max(.75rem,env(safe-area-inset-bottom,0px))">
  <button class="btn w-full flex justify-between shadow-lg max-w-md mx-auto" @click="etapa='carrinho';abrir=true"><span>Ver carrinho (<span x-text="qtd"></span>)</span><span x-text="moeda(total)"></span></button>
</div>

<!-- Carrinho / checkout -->
<div x-show="abrir" x-cloak class="fixed inset-0 z-40" @keydown.escape.window="abrir=false">
  <div class="absolute inset-0 bg-black/50" @click="abrir=false"></div>
  <aside class="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto p-5" style="background:var(--bg);padding-top:max(1.25rem,env(safe-area-inset-top,0px))">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold" x-text="etapa==='carrinho' ? 'Seu carrinho' : etapa==='dados' ? 'Finalizar pedido' : 'Pedido feito!'"></h2>
      <button @click="abrir=false" class="text-2xl" aria-label="Fechar">×</button>
    </div>
    <div class="flex gap-2 mb-5 text-xs font-semibold">
      <template x-for="(s,i) in ['Carrinho','Seus dados','Pronto']" :key="i">
        <div class="flex-1 text-center pb-1" :style="'border-bottom:3px solid '+(i<=['carrinho','dados','ok'].indexOf(etapa)?'var(--g)':'var(--bd)')" x-text="(i+1)+'. '+s"></div>
      </template>
    </div>

    <!-- Etapa 1 -->
    <div x-show="etapa==='carrinho'">
      <div x-show="!itens.length" class="text-center py-8"><div class="text-5xl">🛒</div><p class="mut mt-2">Seu carrinho está vazio.</p><a href="#produtos" @click="abrir=false" class="btn inline-block mt-4">Ver produtos</a></div>
      <template x-for="it in itens" :key="it.id">
        <div class="card p-3 mb-3 flex items-center justify-between gap-2">
          <div><p class="font-semibold" x-text="it.nome"></p><p class="text-sm mut" x-text="moeda(it.preco)+' cada'"></p><button class="text-xs underline mut" @click="mudar(it,-it.q)">Remover</button></div>
          <div class="flex items-center gap-2">
            <button class="btn2 !px-3 !py-1" @click="mudar(it,-1)">−</button>
            <span x-text="it.q"></span>
            <button class="btn2 !px-3 !py-1" @click="mudar(it,1)">+</button>
          </div>
        </div>
      </template>
      <div x-show="itens.length">
        <div class="my-3 text-sm">
          <div class="h-2 rounded-full overflow-hidden" style="background:var(--bd)"><div class="h-full" style="background:var(--g)" :style="'width:'+Math.min(100,total/70*100)+'%'"></div></div>
          <p class="mut mt-1" x-text="total>=70 ? '🎉 Você ganhou frete grátis!' : 'Faltam '+moeda(70-total)+' para o frete grátis'"></p>
        </div>
        <form @submit.prevent="aplicar()" class="flex gap-2"><input class="inp" placeholder="Cupom (ex.: PRIMEIRA10)" x-model="cupom"><button class="btn2">Aplicar</button></form>
        <p class="text-xs mt-1 gr" x-text="cupomMsg"></p>
        <div class="text-sm mt-3 space-y-1">
          <div class="flex justify-between"><span>Subtotal</span><span x-text="moeda(total)"></span></div>
          <div class="flex justify-between gr" x-show="desc"><span>Desconto (10%)</span><span x-text="'− '+moeda(desc)"></span></div>
          <div class="flex justify-between"><span>Frete (simulado)</span><span x-text="frete?moeda(frete):'grátis'"></span></div>
        </div>
        <div class="flex justify-between text-lg font-bold my-3"><span>Total</span><span x-text="moeda(totalFinal)"></span></div>
        <button class="btn w-full" @click="etapa='dados'; preencher()">Continuar</button>
      </div>
    </div>

    <!-- Etapa 2 -->
    <form x-show="etapa==='dados'" @submit.prevent="finalizar()" class="space-y-3">
      <label class="block text-sm font-medium">Nome completo<input class="inp mt-1" required autocomplete="name" x-model="f.nome"></label>
      <label class="block text-sm font-medium">E-mail<input class="inp mt-1" required type="email" autocomplete="email" placeholder="voce@email.com" x-model="f.email"></label>
      <label class="block text-sm font-medium">Endereço de entrega<input class="inp mt-1" required autocomplete="street-address" placeholder="Rua, número, bairro, cidade e CEP" x-model="f.end"></label>
      <fieldset><legend class="text-sm font-medium mb-1">Forma de pagamento</legend>
        <div class="grid grid-cols-3 gap-2">
          <template x-for="m in ['Pix','Cartão','Boleto']" :key="m">
            <label class="card text-center text-sm py-2 cursor-pointer" :style="f.pag===m?'border-color:var(--g);background:var(--g2)':''"><input type="radio" class="sr-only" :value="m" x-model="f.pag"><span x-text="m"></span></label>
          </template>
        </div></fieldset>
      <div class="flex justify-between font-bold"><span>Total (frete <span x-text="frete?moeda(frete):'grátis'"></span>)</span><span x-text="moeda(totalFinal)"></span></div>
      <button class="btn w-full" type="submit">Confirmar pedido</button>
      <button type="button" class="btn2 w-full" @click="etapa='carrinho'">Voltar</button>
    </form>

    <!-- Etapa 3 -->
    <div x-show="etapa==='ok'" class="text-center py-8">
      <div class="text-5xl">✅</div>
      <p class="mt-3 font-semibold">Obrigado, <span x-text="f.nome.split(' ')[0]"></span>!</p>
      <p class="mut text-sm mt-1">Pedido <b x-text="pedido"></b> registrado. Enviamos os detalhes para <span x-text="f.email"></span>.</p>
      <p class="mut text-xs mt-3">(Demonstração acadêmica: nenhum pagamento real é feito.)</p>
      <p x-show="!salvo" class="mut text-xs mt-1">Este acesso não permite registrar o pedido no painel do administrador.</p>
      <button class="btn mt-5" @click="abrir=false; etapa='carrinho'">Voltar à loja</button>
    </div>
  </aside>
</div>

<script>
const IMG='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAJYAZADASIAAhEBAxEB/8QAHQAAAQUBAQEBAAAAAAAAAAAABAIDBQYHAQAICf/EAFQQAAIBAwMCBAMEBwIKBggFBQECAwAEEQUSIQYxEyJBURRhcQcygZEVI0KhscHRM1IIFiRicpKU0uHwNFOCosLxFyU1NkRVc5NUVmN0s0NkhLLi/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAECAwQFBv/EADERAAICAgICAgECBAUFAQAAAAABAhEDIRIxBEETIlEyYRRxgZEFI0JSoTNisdHw8f/aAAw0BA AIRAbstract/s1600/sabao.jpg';

function loja() {
  return {
    modal: '',
    abrir: false,
    cat: 'Todos',
    sel: {},
    banhos: 7,
    aberta: null,
    toast: '',
    toastTimeout: null,
    itens: [],
    cupom: '',
    cupomMsg: '',
    descVal: 0,
    etapa: 'carrinho',
    f: { nome: '', email: '', end: '', pag: 'Pix' },
    pedido: '',
    salvo: true,
    perfil: null,
    podeGravar: true,
    campos: [
      ['nome', 'Nome completo', 'text', true],
      ['email', 'E-mail', 'email', true],
      ['tel', 'Telefone', 'tel', true],
      ['nasc', 'Data de nascimento', 'date', false],
      ['end', 'Endereço', 'text', true],
      ['cidade', 'Cidade / CEP', 'text', true]
    ],
    f2: { nome: '', email: '', tel: '', nasc: '', end: '', cidade: '', ok: false },
    msg: '',
    logado: false,
    eAdmin: true,
    semSenha: false,
    senha: '',
    erroAdm: '',
    aba: 'pedidos',
    pedidos: [
      { num: '#1001', data: new Date().toISOString(), cliente: 'Ana Silva', email: 'ana@email.com', itens: ['Kit Sabonete em Pó Wayfarer'], pag: 'Pix', total: 69.9, status: 'Entregue' }
    ],
    clientes: [
      { nome: 'Ana Silva', email: 'ana@email.com', tel: '(11) 98765-4321', nasc: '1995-04-12', end: 'Rua das Flores, 123', cidade: 'São Paulo - SP', criado: new Date().toISOString() }
    ],
    chatAberto: false,
    digitando: false,
    chatTxt: '',
    chat: [{ r: 'a', t: 'Olá! Sou o assistente da Farmaura. Como posso ajudar você hoje?' }],
    sugestoes: ['Como funciona o sabonete em pó?', 'Qual o prazo de entrega?', 'É adequado para pele sensível?'],
    faq: [
      ['Como funciona o sabonete em pó?', 'Basta colocar uma pequena quantidade do pó na mão úmida, esfregar suavemente para gerar uma espuma cremosa e aplicar no corpo.'],
      ['Quanto tempo dura um kit de sabonete em pó?', 'Cada sachê individual rende cerca de 1 a 2 banhos. O kit de 30 sachês dura aproximadamente um mês com uso diário.'],
      ['O sabonete em pó resseca a pele?', 'Não! Nossas fórmulas contêm ingredientes hidratantes e extratos vegetais naturais que limpam sem agredir a barreira de proteção da pele.'],
      ['É adequado para viagens?', 'Sim, é perfeito! Por não conter água na fórmula, não corre o risco de vazar na mala e pode ser levado em bagagens de mão.']
    ],
    produtos: [
      { id: 'p1', base: 'wayfarer', nome: 'Kit Sabonete em Pó Wayfarer', desc: 'Edição artesanal compacta, ideal para viagens e uso diário.', info: 'Rende até 30 banhos · Vegano', cat: 'Sabonetes', preco: 69.90, img: IMG, tam: [{k:'30', rotulo:'30 sachês'}, {k:'60', rotulo:'60 sachês'}] },
      { id: 'p2', base: 'refill', nome: 'Refill Sabonete em Pó (100g)', desc: 'Embalagem biodegradável para reabastecer seu frasco reutilizável.', info: 'Sustentável · Eco-friendly', cat: 'Sabonetes', preco: 45.00, emoji: '🌿', tam: [{k:'100g', rotulo:'100g'}, {k:'200g', rotulo:'200g'}] },
      { id: 'p3', base: 'protetor', nome: 'Protetor Solar Mineral em Pó', desc: 'Proteção FPS 30 natural contra raios UVA/UVB.', info: 'Resistente à água · Mineral', cat: 'Protetor solar', preco: 59.90, emoji: '☀️' },
      { id: 'p4', base: 'pote', nome: 'Porta-Sabonete de Silicone', desc: 'Acessório lavável e higiênico para transporte.', info: '100% silicone medicinal', cat: 'Acessórios', preco: 24.90, emoji: '🧳' }
    ],

    init() {
      this.produtos.forEach(p => {
        if (p.tam && p.tam.length > 0) {
          this.sel[p.base] = p.tam[0].k;
        }
      });
    },

    get lista() {
      if (this.cat === 'Todos') return this.produtos;
      return this.produtos.filter(p => p.cat === this.cat);
    },

    get qtd() {
      return this.itens.reduce((acc, i) => acc + i.q, 0);
    },

    get total() {
      return this.itens.reduce((acc, i) => acc + i.preco * i.q, 0);
    },

    get desc() {
      return this.descVal;
    },

    get frete() {
      if (this.total >= 70 || this.total === 0) return 0;
      return 15.00;
    },

    get totalFinal() {
      const val = this.total - this.desc + this.frete;
      return val > 0 ? val : 0;
    },

    get frascos() {
      return Math.round((this.banhos * 52) / 25);
    },

    get kits() {
      return Math.ceil(this.frascos / 2) || 1;
    },

    get fat() {
      return this.pedidos.filter(p => p.status === 'Pago' || p.status === 'Entregue' || p.status === 'Enviado')
        .reduce((acc, p) => acc + (+p.total || 0), 0);
    },

    get pend() {
      return this.pedidos.filter(p => p.status === 'Pendente')
        .reduce((acc, p) => acc + (+p.total || 0), 0);
    },

    get dias() {
      return [
        { d: 'Seg', h: 40, v: 120 },
        { d: 'Ter', h: 65, v: 195 },
        { d: 'Qua', h: 30, v: 90 },
        { d: 'Qui', h: 85, v: 255 },
        { d: 'Sex', h: 100, v: 300 },
        { d: 'Sáb', h: 50, v: 150 },
        { d: 'Dom', h: 20, v: 60 }
      ];
    },

    get top() {
      const map = {};
      this.pedidos.forEach(p => {
        (p.itens || []).forEach(it => { map[it] = (map[it] || 0) + 1; });
      });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    },

    moeda(v) {
      return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    dt(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch(e) { return d; }
    },

    qtdDe(id) {
      const found = this.itens.find(i => i.id === id);
      return found ? found.q : 0;
    },

    add(prod) {
      const tamanho = this.sel[prod.base] ? ` (${this.sel[prod.base]})` : '';
      const itemId = prod.id + (this.sel[prod.base] || '');
      const nomeItem = prod.nome + tamanho;

      const idx = this.itens.findIndex(i => i.id === itemId);
      if (idx >= 0) {
        this.itens[idx].q++;
      } else {
        this.itens.push({ id: itemId, nome: nomeItem, preco: prod.preco, q: 1 });
      }
      this.showToast('Item adicionado ao carrinho');
    },

    mudar(item, delta) {
      if (!item) return;
      item.q += delta;
      if (item.q <= 0) {
        this.itens = this.itens.filter(i => i.id !== item.id);
      }
    },

    aplicar() {
      if (this.cupom.trim().toUpperCase() === 'PRIMEIRA10') {
        this.descVal = this.total * 0.10;
        this.cupomMsg = 'Cupom PRIMEIRA10 aplicado (10% OFF)!';
      } else {
        this.cupomMsg = 'Cupom inválido.';
      }
    },

    preencher() {
      if (this.perfil) {
        this.f.nome = this.perfil.nome || '';
        this.f.email = this.perfil.email || '';
        this.f.end = this.perfil.end || '';
      }
    },

    finalizar() {
      if (!this.f.nome || !this.f.email || !this.f.end) return;
      const numPedido = '#' + Math.floor(1000 + Math.random() * 9000);
      this.pedido = numPedido;
      
      const novoPedido = {
        num: numPedido,
        data: new Date().toISOString(),
        cliente: this.f.nome,
        email: this.f.email,
        itens: this.itens.map(i => `${i.nome} (${i.q}x)`),
        pag: this.f.pag,
        total: this.totalFinal,
        status: 'Pendente'
      };
      this.pedidos.unshift(novoPedido);

      if (!this.clientes.some(c => c.email === this.f.email)) {
        this.clientes.push({
          nome: this.f.nome,
          email: this.f.email,
          tel: '—',
          nasc: '—',
          end: this.f.end,
          cidade: '—',
          criado: new Date().toISOString()
        });
      }

      this.itens = [];
      this.etapa = 'ok';
    },

    salvarPerfil() {
      if (!this.f2.ok) return;
      this.perfil = { ...this.f2 };
      this.msg = 'Cadastro salvo com sucesso!';
      setTimeout(() => {
        this.modal = '';
        this.msg = '';
      }, 1200);
    },

    abrirMeus() { this.modal = 'meus'; },

    get meus() {
      if (!this.perfil) return this.pedidos;
      return this.pedidos.filter(p => p.email.toLowerCase() === (this.perfil.email || '').toLowerCase());
    },

    abrirAdmin() { this.modal = 'admin'; },

    entrar() {
      if (this.senha.length >= 6) {
        this.logado = true;
        this.erroAdm = '';
      } else {
        this.erroAdm = 'A senha precisa ter no mínimo 6 caracteres.';
      }
    },

    sair() {
      this.logado = false;
      this.senha = '';
    },

    mudarStatus(p, novoStatus) {
      p.status = novoStatus;
      this.showToast(`Status do pedido ${p.num} alterado para ${novoStatus}`);
    },

    exportar() {
      let csv = 'Pedido,Data,Cliente,Email,Itens,Pagamento,Total,Status\n';
      this.pedidos.forEach(p => {
        csv += `"${p.num}","${this.dt(p.data)}","${p.cliente}","${p.email}","${(p.itens||[]).join('; ')}","${p.pag}","${p.total}","${p.status}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'pedidos_farmaura.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    perguntar(txt) {
      const mensagem = txt || this.chatTxt;
      if (!mensagem.trim()) return;

      this.chat.push({ r: 'u', t: mensagem });
      this.chatTxt = '';
      this.digitando = true;

      setTimeout(() => {
        let resposta = 'Obrigado pelo contato! Para dúvidas específicas, você também pode nos enviar um e-mail em contato@farmaura.com.br.';
        const lower = mensagem.toLowerCase();

        if (lower.includes('como funciona') || lower.includes('usar') || lower.includes('modo de uso')) {
          resposta = 'O sabonete em pó é super simples de usar: despeje o conteúdo de um sachê na mão úmida, esfregue até espumar e aplique no corpo!';
        } else if (lower.includes('entrega') || lower.includes('prazo') || lower.includes('frete')) {
          resposta = 'Oferecemos Frete Grátis para compras acima de R$ 70! O prazo médio de entrega varia de 3 a 7 dias úteis.';
        } else if (lower.includes('sensível') || lower.includes('pele') || lower.includes('alergia')) {
          resposta = 'Nossa fórmula é 100% vegana e artesanal, feita com ingredientes vegetais suaves, sendo ideal para todos os tipos de pele.';
        }

        this.chat.push({ r: 'a', t: resposta });
        this.digitando = false;

        this.$nextTick(() => {
          if (this.$refs.msgs) {
            this.$refs.msgs.scrollTop = this.$refs.msgs.scrollHeight;
          }
        });
      }, 800);
    },

    showToast(m) {
      this.toast = m;
      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => { this.toast = ''; }, 3000);
    }
  };
}
</script>
</body>
</html>
