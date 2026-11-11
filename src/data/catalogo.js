import { IMG_ADESIVOS, IMG_AURA, IMG_BONE_AV, IMG_CHAVEIRO, IMG_CHAVEIRO_AV, IMG_COMBO, IMG_ECOBAG, IMG_KIT, IMG_REFIL, IMG_TOALHA_AV } from "./imagens";
import { Award, CreditCard, Droplets, FileText, Gift, Heart, Leaf, Package, PenLine, QrCode, Recycle, ShieldCheck, ShoppingBag, Sparkles, Sun, Truck } from "../lib/icones";

export const PRODUCTS = [
  {
    id: "sabonete-cha-verde",
    category: "sabonete",
    name: "Wayfarer Refil",
    variant: "Sabonete Corporal em Pó · Chá Verde · 100g",
    tagline: "O refil econômico para reabastecer em casa.",
    price: 59.9,
    oldPrice: 74.9,
    reviews: 1284,
    bestSeller: true,
    badge: "Mais Vendido",
    image: IMG_REFIL,
    rating: 4.9,
    accent: "from-emerald-100 to-lime-50",
    ingredients: [
      "Extrato de Camellia Sinensis (Chá Verde)",
      "Tensoativos de origem vegetal (coco)",
      "Manteiga de Karité",
      "Pantenol (Pró-Vitamina B5)",
      "Glicerina vegetal",
      "Amido de milho orgânico",
    ],
    howToUse: [
      "Com as mãos úmidas, despeje cerca de 1g (meia colher de chá) do pó.",
      "Esfregue suavemente as mãos até formar uma espuma cremosa.",
      "Aplique sobre o corpo com movimentos circulares.",
      "Enxágue bem. Mantenha a embalagem sempre seca e fechada.",
    ],
    description:
      "O Wayfarer for Men é um sabonete corporal em pó que vira espuma cremosa em contato com a água. O refil de 100g é a forma mais econômica de manter o ritual em casa: fórmula concentrada, sem água, com a ação antioxidante do Chá Verde e embalagem com menos plástico.",
    benefits: [
      "Limpa, refresca e hidrata a pele",
      "Ação antioxidante do Chá Verde",
      "Embalagem refil com 80% menos plástico",
      "Rende até 60 banhos — formato concentrado",
      "pH balanceado, ideal para peles sensíveis",
    ],
    highlights: [
      { icon: Recycle, label: "Refil" },
      { icon: Droplets, label: "Hidratante" },
      { icon: Leaf, label: "Chá Verde" },
    ],
  },
  {
    id: "wayfarer-kit",
    category: "sabonete",
    name: "Wayfarer Kit Viagem",
    variant: "Kit 5 sachês × 10g · 50g",
    tagline: "Um sachê por banho, pronto para a mochila.",
    price: 39.9,
    oldPrice: null,
    reviews: 548,
    bestSeller: false,
    badge: "Para Viagem",
    image: IMG_KIT,
    rating: 4.9,
    accent: "from-emerald-100 to-lime-50",
    ingredients: [
      "Extrato de Camellia Sinensis (Chá Verde)",
      "Tensoativos de origem vegetal (coco)",
      "Manteiga de Karité",
      "Pantenol (Pró-Vitamina B5)",
      "Glicerina vegetal",
      "Amido de milho orgânico",
    ],
    howToUse: [
      "Com as mãos úmidas, despeje cerca de 1g (meia colher de chá) do pó.",
      "Esfregue suavemente as mãos até formar uma espuma cremosa.",
      "Aplique sobre o corpo com movimentos circulares.",
      "Enxágue bem. Mantenha a embalagem sempre seca e fechada.",
    ],
    description:
      "Higiene e cuidado onde você estiver. O kit traz 5 sachês individuais de 10g do sabonete corporal em pó Wayfarer, leves e compactos, ideais para viagens, trilhas e aventuras. Sem líquido, não vaza na mala e passa sem problema na bagagem de mão.",
    benefits: [
      "5 sachês individuais de 10g (50g no total)",
      "Leve e compacto, não vaza na mochila",
      "Ideal para viagens, trilhas e acampamentos",
      "Hidrata a pele com Chá Verde antioxidante",
      "Sem líquido: liberado na bagagem de mão",
    ],
    highlights: [
      { icon: Truck, label: "Viagem" },
      { icon: Droplets, label: "Hidratante" },
      { icon: Leaf, label: "Chá Verde" },
    ],
  },
  {
    id: "wayfarer-combo",
    category: "sabonete",
    name: "Wayfarer Combo",
    variant: "Refil 100g + Kit 5 sachês × 10g · 150g",
    tagline: "O refil para casa e o kit para a estrada.",
    price: 89.9,
    oldPrice: 99.8,
    reviews: 312,
    bestSeller: false,
    badge: "Combo",
    image: IMG_COMBO,
    rating: 4.9,
    accent: "from-emerald-100 to-lime-50",
    ingredients: [
      "Extrato de Camellia Sinensis (Chá Verde)",
      "Tensoativos de origem vegetal (coco)",
      "Manteiga de Karité",
      "Pantenol (Pró-Vitamina B5)",
      "Glicerina vegetal",
      "Amido de milho orgânico",
    ],
    howToUse: [
      "Com as mãos úmidas, despeje cerca de 1g (meia colher de chá) do pó.",
      "Esfregue suavemente as mãos até formar uma espuma cremosa.",
      "Aplique sobre o corpo com movimentos circulares.",
      "Enxágue bem. Mantenha a embalagem sempre seca e fechada.",
    ],
    description:
      "O combo completo Wayfarer for Men: o refil de 100g para usar em casa e o kit com 5 sachês de 10g para levar nas viagens. São 150g de sabonete corporal em pó de Chá Verde com preço menor do que comprando separado.",
    benefits: [
      "Refil 100g + Kit 5 sachês de 10g",
      "Economia em relação à compra separada",
      "Casa e viagem cobertos com um só pedido",
      "Hidratação com ação antioxidante do Chá Verde",
      "Frete grátis no PIX acima de R$ 150 com outro item",
    ],
    highlights: [
      { icon: Package, label: "Combo" },
      { icon: Recycle, label: "Refil" },
      { icon: Truck, label: "Viagem" },
    ],
  },
  {
    id: "acc-ecobag",
    category: "acessorios",
    name: "Eco Bag Wayfarer",
    variant: "Algodão cru · estampa de montanha",
    tagline: "Leve o essencial com você, do mercado à trilha.",
    price: 34.9,
    oldPrice: null,
    rating: 4.8,
    reviews: 233,
    bestSeller: false,
    badge: "Acessório",
    accent: "from-lime-50 to-emerald-50",
    image: IMG_ECOBAG,
    description:
      "Sacola de algodão cru com a paisagem de montanha da Wayfarer estampada em verde e o lema Leve o essencial com você. Alças longas para usar no ombro, costura reforçada e espaço de sobra para compras, roupa de academia ou os itens da viagem.",
    benefits: ['Algodão cru resistente e reutilizável', 'Alças longas para usar no ombro', 'Estampa da paisagem Wayfarer', 'Dobra fácil e cabe na mochila', 'Substitui sacolas plásticas descartáveis'],
    ingredients: ['Material: 100% algodão cru', 'Tamanho: 38 × 42 cm', 'Alças: 60 cm', "Estampa: tinta à base d'água", 'Capacidade: até 10 kg'],
    howToUse: ['Lave à mão ou na máquina em água fria.', 'Não use alvejante.', 'Seque à sombra.', 'Passe pelo avesso, sem vapor sobre a estampa.'],
    specsLabel: "Especificações",
    usageLabel: "Cuidados",
    highlights: [{ icon: Recycle, label: "Reutilizável" }, { icon: Leaf, label: "Algodão" }, { icon: Package, label: "10 kg" }],
  },
  {
    id: "acc-chaveiro",
    category: "acessorios",
    name: "Chaveiro Wayfarer",
    variant: "Emborrachado · 7 cm",
    tagline: "A montanha Wayfarer sempre no seu bolso.",
    price: 19.9,
    oldPrice: null,
    rating: 4.7,
    reviews: 412,
    bestSeller: false,
    badge: "Acessório",
    accent: "from-amber-50 to-stone-100",
    image: IMG_CHAVEIRO,
    description:
      "Chaveiro emborrachado verde-floresta no formato da montanha Wayfarer, com o nome da marca em relevo. Leve, resistente a quedas e com argola de metal reforçada para as chaves de casa, do carro ou presa na mochila.",
    benefits: ['Borracha flexível resistente a quedas', 'Logo Wayfarer em relevo', 'Argola de metal reforçada', 'Leve, cabe em qualquer bolso', 'Bom para prender no zíper da mochila'],
    ingredients: ['Material: PVC emborrachado', 'Tamanho: 7 × 4,5 cm', 'Argola: metal niquelado, 2,5 cm', 'Peso: 15 g'],
    howToUse: ['Limpe com pano úmido.', 'Evite deixar exposto ao sol forte por muito tempo.', 'Não use solventes para limpar.'],
    specsLabel: "Especificações",
    usageLabel: "Cuidados",
    highlights: [{ icon: Award, label: "Relevo" }, { icon: Heart, label: "Presente" }, { icon: Package, label: "15 g" }],
  },
  {
    id: "acc-adesivos",
    category: "acessorios",
    name: "Kit de Adesivos Wayfarer",
    variant: "7 adesivos de vinil",
    tagline: "Para a garrafa, o notebook e a mala.",
    price: 14.9,
    oldPrice: null,
    rating: 4.9,
    reviews: 689,
    bestSeller: false,
    badge: "Mais Barato",
    accent: "from-sky-50 to-stone-100",
    image: IMG_ADESIVOS,
    description:
      "Sete adesivos de vinil com as artes da Wayfarer: a montanha com o nome da marca, o selo redondo, a paisagem do aventureiro, a folha de chá verde, o escudo, a assinatura e o selo minimalista. Resistentes à água e ao sol.",
    benefits: ['7 artes diferentes no kit', 'Vinil resistente à água', 'Proteção contra desbotamento pelo sol', 'Recorte com borda clara', 'Colam em vidro, metal e plástico'],
    ingredients: ['Material: vinil com laminação fosca', 'Tamanhos: de 5 a 9 cm', 'Quantidade: 7 adesivos', 'Uso interno e externo'],
    howToUse: ['Limpe e seque bem a superfície antes de colar.', 'Pressione do centro para as bordas para tirar o ar.', 'Aguarde 24 h antes de molhar.', 'Evite lava-louças na garrafa adesivada.'],
    specsLabel: "Especificações",
    usageLabel: "Cuidados",
    highlights: [{ icon: Droplets, label: "À prova d'água" }, { icon: Sun, label: "Anti-UV" }, { icon: Sparkles, label: "7 artes" }],
  },
  {
    id: "acc-bone-av",
    category: "acessorios",
    name: "Boné Aura Vital",
    variant: "Azul degradê · ajuste traseiro",
    tagline: "Mais sombra no rosto para o dia de sol.",
    price: 59.9,
    oldPrice: null,
    rating: 4.8,
    reviews: 187,
    bestSeller: false,
    badge: "Linha Aura Vital",
    accent: "from-sky-50 to-amber-50",
    image: IMG_BONE_AV,
    description:
      "Boné azul em degradê com a marca Farmaura Aura Vital bordada na frente e o selo FPS 67 na lateral. Aba curva que protege o rosto e os olhos do sol, perfeito junto com o protetor na praia, na trilha ou no esporte ao ar livre.",
    benefits: ['Aba curva que faz sombra no rosto', 'Bordado Farmaura Aura Vital na frente', 'Selo FPS 67 bordado na lateral', 'Ilhoses para ventilação', 'Ajuste traseiro para vários tamanhos'],
    ingredients: ['Material: 100% algodão', 'Ajuste: fivela traseira, de 54 a 60 cm', 'Bordado: linha branca', 'Cor: azul em degradê'],
    howToUse: ['Lave à mão com água fria e sabão neutro.', 'Não torça e não use secadora.', 'Seque à sombra, apoiado para manter o formato.'],
    specsLabel: "Especificações",
    usageLabel: "Cuidados",
    highlights: [{ icon: Sun, label: "Proteção" }, { icon: Award, label: "Bordado" }, { icon: Heart, label: "Ajustável" }],
  },
  {
    id: "acc-toalha-av",
    category: "acessorios",
    name: "Toalha de Praia Aura Vital",
    variant: "Microfibra · 80 × 160 cm",
    tagline: "Leve, seca rápido e não segura areia.",
    price: 69.9,
    oldPrice: 84.9,
    rating: 4.7,
    reviews: 276,
    bestSeller: false,
    badge: "Linha Aura Vital",
    accent: "from-sky-50 to-amber-50",
    image: IMG_TOALHA_AV,
    description:
      "Toalha de praia em microfibra azul degradê com a estampa Farmaura Aura Vital e o selo FPS 67. Absorve bem, seca muito mais rápido que o algodão e a areia sai com uma sacudida. Dobra pequena para levar na bolsa.",
    benefits: ['Seca até 3 vezes mais rápido que algodão', 'A areia não gruda', 'Leve e compacta para levar na bolsa', 'Estampa que não desbota no sol', 'Tamanho grande para deitar na areia'],
    ingredients: ['Material: microfibra (80% poliéster, 20% poliamida)', 'Tamanho: 80 × 160 cm', 'Peso: 300 g', 'Cor: azul degradê'],
    howToUse: ['Lave na máquina em água fria.', 'Não use amaciante.', 'Seque à sombra.', 'Sacuda bem a areia antes de lavar.'],
    specsLabel: "Especificações",
    usageLabel: "Cuidados",
    highlights: [{ icon: Droplets, label: "Seca rápido" }, { icon: Sun, label: "Praia" }, { icon: Truck, label: "Compacta" }],
  },
  {
    id: "acc-chaveiro-av",
    category: "acessorios",
    name: "Chaveiro Aura Vital",
    variant: "Miniatura do frasco FPS 67",
    tagline: "O frasco do Aura Vital em miniatura.",
    price: 24.9,
    oldPrice: null,
    rating: 4.9,
    reviews: 354,
    bestSeller: false,
    badge: "Linha Aura Vital",
    accent: "from-sky-50 to-amber-50",
    image: IMG_CHAVEIRO_AV,
    description:
      "Chaveiro em miniatura do frasco do protetor solar Aura Vital FPS 67, com todos os detalhes do rótulo. Feito em material emborrachado com argola de metal, é um lembrete divertido de passar e reaplicar o protetor.",
    benefits: ['Réplica fiel do frasco Aura Vital', 'Material emborrachado resistente', 'Argola e corrente de metal', 'Leve para chaves e mochilas', 'Boa lembrança para presentear'],
    ingredients: ['Material: PVC emborrachado', 'Tamanho: 6 cm de altura', 'Argola: metal niquelado, 2,5 cm', 'Peso: 14 g'],
    howToUse: ['Limpe com pano úmido.', 'Evite deixar exposto ao sol forte por muito tempo.', 'Não use solventes para limpar.'],
    specsLabel: "Especificações",
    usageLabel: "Cuidados",
    highlights: [{ icon: Sun, label: "FPS 67" }, { icon: Heart, label: "Presente" }, { icon: Package, label: "14 g" }],
  },
  {
    id: "aura-vital",
    category: "protetor",
    name: "Aura Vital",
    variant: "Protetor Solar Facial & Corporal · FPS 67",
    tagline: "Proteção avançada, toque seco e ação antioxidante.",
    price: 89.9,
    oldPrice: null,
    rating: 4.8,
    reviews: 962,
    bestSeller: false,
    badge: "Lançamento",
    accent: "from-sky-100 to-amber-50",
    image: IMG_AURA,
    description:
      "Aura Vital é o protetor solar multifuncional da Farmaura: ultra proteção FPS 67 contra UVA/UVB com textura fluida de rápida absorção e acabamento seco. Enriquecido com Vitamina E e Niacinamida, protege contra o fotoenvelhecimento enquanto cuida da pele do rosto e do corpo.",
    benefits: [
      "Ultra proteção FPS 67, amplo espectro UVA/UVB",
      "Toque seco — não deixa a pele oleosa",
      "Ação antioxidante contra radicais livres",
      "Resistente à água e ao suor",
      "Não comedogênico, testado dermatologicamente",
    ],
    ingredients: [
      "Filtros solares fotoestáveis de amplo espectro",
      "Vitamina E (Tocoferol)",
      "Niacinamida (Vitamina B3)",
      "Ácido Hialurônico",
      "Extrato de Aloe Vera",
      "Sílica (efeito toque seco)",
    ],
    howToUse: [
      "Aplique generosamente no rosto e corpo 15 minutos antes da exposição solar.",
      "Espalhe uniformemente até completa absorção.",
      "Reaplique a cada 2 horas ou após nadar, transpirar ou se secar com toalha.",
      "Use diariamente, inclusive em dias nublados.",
    ],
    highlights: [
      { icon: Sun, label: "FPS 67" },
      { icon: ShieldCheck, label: "UVA/UVB" },
      { icon: Sparkles, label: "Toque Seco" },
    ],
  },
];

/** Acessórios que aceitam personalização com nome (texto + taxa) */
export const CUSTOMIZATION = {
  "acc-ecobag": {
    label: "Estampar um nome na sacola", verb: "Estampa", fee: 12.9, max: 14, material: "Algodão cru",
    surface: "repeating-linear-gradient(90deg, rgba(60,45,20,.05) 0 2px, transparent 2px 5px), linear-gradient(135deg, #f1e9d6, #e0d3b6)",
    stitch: "rgba(80,64,40,.35)", shadow: "none",
    colors: [
      { id: "verde", label: "Verde floresta", hex: "#1f3a2c" },
      { id: "preto", label: "Preto", hex: "#1c1917" },
      { id: "terracota", label: "Terracota", hex: "#a4492f" },
    ],
  },
  "acc-chaveiro": {
    label: "Gravar um nome no verso", verb: "Gravação", fee: 7.9, max: 10, material: "Verso emborrachado",
    surface: "radial-gradient(circle at 30% 20%, #2e5446, #17302a 70%)",
    stitch: "rgba(239,230,207,.3)", shadow: "0 1px 0 rgba(0,0,0,.45)",
    colors: [
      { id: "creme", label: "Creme", hex: "#efe6cf" },
      { id: "salvia", label: "Verde-sálvia", hex: "#b9d3ad" },
    ],
  },
  "acc-bone-av": {
    label: "Bordar um nome na lateral", verb: "Bordado", fee: 14.9, max: 12, material: "Lateral do boné",
    surface: "repeating-linear-gradient(45deg, rgba(255,255,255,.05) 0 3px, transparent 3px 6px), linear-gradient(135deg, #1e4fd8, #3aa0f0)",
    stitch: "rgba(255,255,255,.45)", shadow: "0 1px 0 rgba(0,0,0,.3), 0 0 1px rgba(0,0,0,.5)",
    colors: [
      { id: "branco", label: "Branco", hex: "#ffffff" },
      { id: "amarelo", label: "Amarelo sol", hex: "#fcd34d" },
    ],
  },
  "acc-toalha-av": {
    label: "Bordar um nome na toalha", verb: "Bordado", fee: 14.9, max: 14, material: "Canto da toalha",
    surface: "radial-gradient(rgba(255,255,255,.12) 1px, transparent 1.5px) 0 0 / 6px 6px, linear-gradient(135deg, #2563eb, #38bdf8)",
    stitch: "rgba(255,255,255,.45)", shadow: "0 1px 0 rgba(0,0,0,.3), 0 0 1px rgba(0,0,0,.5)",
    colors: [
      { id: "branco", label: "Branco", hex: "#ffffff" },
      { id: "amarelo", label: "Amarelo sol", hex: "#fcd34d" },
    ],
  },
};

/** Estilos de letra para a personalização */
export const CUSTOM_FONTS = [
  { id: "classica", label: "Clássica", style: { fontFamily: "Fraunces, Georgia, serif", fontWeight: 500 } },
  { id: "manuscrita", label: "Manuscrita", style: { fontFamily: '"Caveat", "Segoe Script", cursive', fontWeight: 700, fontSize: "1.3em" } },
  { id: "bastao", label: "Bastão", style: { fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.78em" } },
];
export const fontById = (id) => CUSTOM_FONTS.find((f) => f.id === id) || CUSTOM_FONTS[0];
/** "Manuscrita · Verde floresta" a partir do item do carrinho/pedido */
export const customStyleText = (item) => {
  if (!item.customStyle) return "";
  const cfg = CUSTOMIZATION[item.id];
  const color = cfg && cfg.colors.find((c) => c.id === item.customStyle.color);
  return [fontById(item.customStyle.font).label, color && color.label].filter(Boolean).join(" · ");
};

/** Status possíveis de um pedido e seus estilos visuais */
export const ORDER_STATUS = {
  Recebido: { color: "bg-amber-100 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  "Em preparação": { color: "bg-sky-100 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
  "Pronto para entrega": { color: "bg-violet-100 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
  Entregue: { color: "bg-emerald-100 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
};

/** Converte os nomes antigos de status para os atuais (pedidos já gravados continuam valendo) */
export const OLD_STATUS = { Pendente: "Recebido", "Em Processamento": "Em preparação", Enviado: "Pronto para entrega" };
export const normStatus = (st) => OLD_STATUS[st] || (ORDER_STATUS[st] ? st : "Recebido");
export const fixOrder = (o) => (o && o.status !== normStatus(o.status) ? { ...o, status: normStatus(o.status) } : o);

/** Formas de pagamento disponíveis no checkout */
export const PAYMENT_METHODS = [
  { id: "PIX", label: "PIX", icon: QrCode, hint: "5% de desconto · aprovação imediata" },
  { id: "Cartão de Crédito", label: "Cartão de Crédito", icon: CreditCard, hint: "Até 3x sem juros" },
  { id: "Boleto", label: "Boleto Bancário", icon: FileText, hint: "Compensação em até 2 dias úteis" },
];

export const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

/** Catálogos: um para o sabonete em pó, outro para o protetor solar */
export const CATALOGS = [
  {
    id: "catalogo-sabonete",
    category: "sabonete",
    short: "Sabonete em Pó",
    eyebrow: "Catálogo · Sabonete em Pó",
    title: "Wayfarer for Men",
    text: "Sabonete corporal em pó de Chá Verde em três formatos: o refil para casa, o kit de sachês para a viagem e o combo com os dois.",
    tone: "bg-page",
  },
  {
    id: "catalogo-protetor",
    category: "protetor",
    short: "Protetor Solar",
    eyebrow: "Catálogo · Protetor Solar",
    title: "Aura Vital",
    text: "Proteção solar facial e corporal FPS 67, resistente à água e com toque seco, para o dia a dia e para a praia.",
    tone: "bg-gradient-to-b from-sky-50 to-amber-50/60",
  },
  {
    id: "catalogo-acessorios",
    category: "acessorios",
    short: "Acessórios",
    eyebrow: "Catálogo · Acessórios",
    title: "Acessórios Wayfarer",
    text: "Itens Wayfarer para levar o ritual na mochila e a linha Aura Vital para os dias de praia: sacola, chaveiros, adesivos, boné e toalha.",
    tone: "bg-page",
  },
];

export const SORTS = [
  { id: "relevancia", label: "Mais relevantes" },
  { id: "menor", label: "Menor preço" },
  { id: "maior", label: "Maior preço" },
  { id: "avaliados", label: "Mais bem avaliados" },
];

/** Ficha técnica e características de cada produto (vêm das descrições do catálogo) */
export const PRODUCT_FACTS = {
  "sabonete-cha-verde": { conteudo: "100 g", linha: "Wayfarer for Men", tags: ["refil", "economia", "casa"] },
  "wayfarer-kit": { conteudo: "50 g (5 sachês de 10 g)", linha: "Wayfarer for Men", tags: ["viagem", "pratico"] },
  "wayfarer-combo": { conteudo: "150 g (refil de 100 g + 5 sachês de 10 g)", linha: "Wayfarer for Men", tags: ["refil", "viagem", "economia", "presente"] },
  "aura-vital": { conteudo: null, linha: "Aura Vital", tags: ["protecao", "praia"] },
  "acc-ecobag": { conteudo: "38 × 42 cm · alças de 60 cm", linha: "Wayfarer for Men", tags: ["reutilizavel", "presente"] },
  "acc-chaveiro": { conteudo: "7 × 4,5 cm · 15 g", linha: "Wayfarer for Men", tags: ["presente"] },
  "acc-adesivos": { conteudo: "7 adesivos de 5 a 9 cm", linha: "Wayfarer for Men", tags: ["presente"] },
  "acc-bone-av": { conteudo: "Ajuste de 54 a 60 cm", linha: "Aura Vital", tags: ["praia", "presente"] },
  "acc-toalha-av": { conteudo: "80 × 160 cm · 300 g", linha: "Aura Vital", tags: ["praia", "viagem", "reutilizavel"] },
  "acc-chaveiro-av": { conteudo: "6 cm · 14 g", linha: "Aura Vital", tags: ["presente"] },
};
export const FEATURE_LABELS = {
  refil: "Refil",
  economia: "Econômico",
  casa: "Uso em casa",
  viagem: "Para viagem",
  pratico: "Prático",
  presente: "Bom para presente",
  praia: "Praia e sol",
  protecao: "Proteção solar",
  reutilizavel: "Reutilizável",
  personalizavel: "Personalizável",
  promocao: "Em promoção",
  estoque: "Disponível",
};
/** Características de um produto, incluindo as que dependem do estado da loja */
export const productTags = (p, customization) => {
  const t = [...((PRODUCT_FACTS[p.id] || {}).tags || [])];
  if (customization && customization[p.id]) t.push("personalizavel");
  if (p.oldPrice) t.push("promocao");
  if (p.stock > 0) t.push("estoque");
  return t;
};
export const PRICE_RANGES = [
  { id: "todos", label: "Qualquer preço", test: () => true },
  { id: "ate30", label: "Até R$ 30", test: (v) => v <= 30 },
  { id: "30a60", label: "R$ 30 a 60", test: (v) => v > 30 && v <= 60 },
  { id: "60a90", label: "R$ 60 a 90", test: (v) => v > 60 && v <= 90 },
  { id: "mais90", label: "Acima de R$ 90", test: (v) => v > 90 },
];

/* ---------------------------------------------------------------------------
 * QUIZ DE RECOMENDAÇÃO
 * ------------------------------------------------------------------------- */
export const QUIZ = [
  {
    id: "tipo",
    q: "Qual tipo de produto você procura?",
    opts: [
      { id: "sabonete", label: "Sabonete para o banho", icon: Droplets },
      { id: "protetor", label: "Proteção contra o sol", icon: Sun },
      { id: "acessorios", label: "Acessório", icon: ShoppingBag },
      { id: "presente", label: "Um presente", icon: Gift },
    ],
  },
  {
    id: "carac",
    q: "Qual característica é mais importante?",
    opts: [
      { id: "viagem", label: "Levar na viagem ou na mochila", icon: Truck },
      { id: "economia", label: "Economizar e reabastecer", icon: Recycle },
      { id: "personalizavel", label: "Ter o meu nome", icon: PenLine },
      { id: "praia", label: "Usar na praia e no sol", icon: Sun },
    ],
  },
  {
    id: "preco",
    q: "Qual faixa de preço você prefere?",
    opts: [
      { id: "ate30", label: "Até R$ 30" },
      { id: "30a70", label: "De R$ 30 a R$ 70" },
      { id: "mais70", label: "Acima de R$ 70" },
      { id: "todos", label: "Tanto faz" },
    ],
  },
];
export const quizPrice = { ate30: (v) => v <= 30, "30a70": (v) => v > 30 && v <= 70, mais70: (v) => v > 70, todos: () => true };

/** Pontua só os produtos cadastrados, ativos e com estoque */
export const recommend = (answers, products, customization) =>
  products
    .filter((p) => p.stock > 0)
    .map((p) => {
      const tags = productTags(p, customization);
      const why = [];
      let score = 0;
      if (answers.tipo === "presente" ? tags.includes("presente") : p.category === answers.tipo) { score += 3; why.push(answers.tipo === "presente" ? "bom para presente" : "é o tipo que você procura"); }
      if (tags.includes(answers.carac)) { score += 2; why.push(FEATURE_LABELS[answers.carac].toLowerCase()); }
      if (quizPrice[answers.preco](p.price)) { score += answers.preco === "todos" ? 0.5 : 2; if (answers.preco !== "todos") why.push("cabe na faixa de preço"); }
      return { p, score, why };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
    .slice(0, 3);

export const CATEGORY_LABELS = { sabonete: "Sabonete em Pó", protetor: "Protetor Solar", acessorios: "Acessórios" };
