import { normalize } from "../lib/util";

/* ----------------------------------------------------------------------------
 * CADASTROS DE EXEMPLO — carregados pelo Painel Admin (Configurações).
 * Todos levam demo: true e são apagados com um clique, sem tocar no estoque.
 * -------------------------------------------------------------------------- */
export const DEMO_PEOPLE = [
  ["Ana Beatriz Souza", "Campinas", "SP", "Cambuí"], ["Lucas Oliveira", "São Paulo", "SP", "Vila Mariana"],
  ["Mariana Costa", "Santo André", "SP", "Centro"], ["Gabriel Santos", "Guarulhos", "SP", "Vila Galvão"],
  ["Júlia Ferreira", "Osasco", "SP", "Presidente Altino"], ["Rafael Lima", "Rio de Janeiro", "RJ", "Tijuca"],
  ["Beatriz Almeida", "Belo Horizonte", "MG", "Savassi"], ["Pedro Rocha", "Curitiba", "PR", "Batel"],
  ["Larissa Martins", "Sorocaba", "SP", "Jardim Europa"], ["Thiago Ribeiro", "São Bernardo do Campo", "SP", "Rudge Ramos"],
  ["Camila Carvalho", "Santos", "SP", "Gonzaga"], ["Felipe Gomes", "Jundiaí", "SP", "Anhangabaú"],
  ["Isabela Pereira", "Niterói", "RJ", "Icaraí"], ["Matheus Barbosa", "Ribeirão Preto", "SP", "Jardim Irajá"],
  ["Letícia Araújo", "Florianópolis", "SC", "Trindade"], ["Bruno Cardoso", "Mogi das Cruzes", "SP", "Vila Oliveira"],
  ["Fernanda Teixeira", "São José dos Campos", "SP", "Jardim Aquarius"], ["Gustavo Mendes", "Porto Alegre", "RS", "Moinhos de Vento"],
  ["Amanda Nunes", "Barueri", "SP", "Alphaville"], ["Vinícius Moreira", "Goiânia", "GO", "Setor Bueno"],
  ["Carolina Dias", "Taboão da Serra", "SP", "Jardim Maria Rosa"], ["Rodrigo Castro", "Diadema", "SP", "Centro"],
  ["Natália Freitas", "Salvador", "BA", "Pituba"], ["Eduardo Pinto", "Carapicuíba", "SP", "Vila Dirce"],
];
export const DEMO_STREETS = ["Rua das Palmeiras", "Av. Brasil", "Rua São Bento", "Rua XV de Novembro", "Av. Paulista", "Rua das Acácias", "Rua Sete de Setembro", "Rua dos Ipês"];
export const DEMO_MESSAGES = [
  "Olá! Vocês fazem venda para revenda? Tenho uma loja de produtos naturais.",
  "O refil de 100g dura quanto tempo, mais ou menos?",
  "Comprei o kit e adorei a espuma. Quando chega o protetor de novo?",
  "Vocês entregam em todo o Brasil?",
  "Posso usar o sabonete em pó no rosto também?",
];
export const DEMO_DONATION_MSGS = ["Boa sorte no TCC!", "Adorei a ideia do sabonete em pó.", "", "Sucesso para a equipe!", ""];
export const DEMO_SKUS = ["sabonete-cha-verde", "wayfarer-kit", "wayfarer-combo", "aura-vital", "acc-adesivos", "acc-chaveiro-av"];

/** Monta os cadastros, pedidos, mensagens e doações de exemplo (sempre os mesmos) */
export const buildDemoData = (products, settings) => {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const skus = DEMO_SKUS.filter((id) => byId[id]);
  const now = Date.now();
  const DAY = 86400000;
  const statusFor = (ageDays) => (ageDays > 8 ? "Entregue" : ageDays > 4 ? "Pronto para entrega" : ageDays > 1 ? "Em preparação" : "Recebido");
  const payments = ["PIX", "PIX", "Cartão de Crédito (•••• 4421)", "Cartão de Crédito (•••• 9034)", "Boleto"];
  const people = DEMO_PEOPLE.map(([name, city, state, district], i) => {
    const uid = `demo-${String(i + 1).padStart(2, "0")}`;
    const first = normalize(name.split(" ")[0]);
    const last = normalize(name.split(" ").slice(-1)[0]);
    const email = `${first}.${last}${i + 3}@exemplo.com`;
    const phone = `(11) 9${String(8100 + i * 37).padStart(4, "0")}-${String(1000 + i * 271).slice(-4)}`;
    const joined = now - Math.floor(10 + rnd() * 80) * DAY;
    const address = {
      street: pick(DEMO_STREETS), number: String(10 + Math.floor(rnd() * 900)), district, city, state,
      zip: `0${Math.floor(1000 + rnd() * 8999)}-${String(Math.floor(rnd() * 999)).padStart(3, "0")}`,
    };
    const cliente = { name, email, phone, newsletter: rnd() > 0.45, address, createdAt: new Date(joined).toISOString(), atualizadoEm: new Date(joined).toISOString(), demo: true };
    const nOrders = rnd() > 0.75 ? 2 + Math.floor(rnd() * 2) : 1;
    const pedidos = [];
    for (let k = 0; k < nOrders; k++) {
      // os últimos clientes compraram agora há pouco, para o painel ter pedidos em andamento
      const at = k === 0 && i >= DEMO_PEOPLE.length - 5
        ? now - Math.floor(rnd() * (i - DEMO_PEOPLE.length + 6) * 0.8 * DAY) - 3600000
        : Math.max(joined, now - Math.floor(rnd() * 85 * DAY) - Math.floor(rnd() * DAY));
      const lines = {};
      const nItems = 1 + Math.floor(rnd() * 2);
      for (let j = 0; j < nItems; j++) { const id = pick(skus); lines[id] = (lines[id] || 0) + (rnd() > 0.8 ? 2 : 1); }
      const items = Object.entries(lines).map(([id, qty]) => ({ lineId: `${id}-${k}`, id, name: byId[id].name, variant: byId[id].variant, price: byId[id].price, qty }));
      const subtotal = Math.round(items.reduce((a, x) => a + x.price * x.qty, 0) * 100) / 100;
      const payment = pick(payments);
      const shipping = subtotal >= settings.freeShipping ? 0 : settings.shippingFee;
      const discount = payment === "PIX" ? Math.round(subtotal * settings.pixDiscount) / 100 : 0;
      const age = (now - at) / DAY;
      pedidos.push({
        id: `FA-EX${String(i + 1).padStart(2, "0")}${k + 1}`, createdAt: new Date(at).toISOString(),
        customer: { name, email, phone }, address: { ...address },
        items, giftFee: 0, subtotal, shipping, discount, total: Math.round((subtotal + shipping - discount) * 100) / 100,
        gift: null, coupon: null, payment, status: statusFor(age), stockApplied: true, demo: true,
      });
    }
    const out = { uid, cliente, pedidos };
    if (i % 5 === 1) out.mensagem = { id: `MSG-EX${i}`, name, email, message: DEMO_MESSAGES[(i / 5) | 0], createdAt: new Date(now - Math.floor(rnd() * 20) * DAY).toISOString(), read: rnd() > 0.5, demo: true };
    if (i % 6 === 2) out.doacao = { id: `DO-EX${i}`, createdAt: new Date(now - Math.floor(rnd() * 40) * DAY).toISOString(), amount: pick([5, 10, 15, 20, 25]), name, message: DEMO_DONATION_MSGS[(i / 6) | 0], status: rnd() > 0.3 ? "Recebida" : "Aguardando", demo: true };
    if (cliente.newsletter) out.newsletter = { email, createdAt: cliente.createdAt, demo: true };
    return out;
  });
  return people;
};
