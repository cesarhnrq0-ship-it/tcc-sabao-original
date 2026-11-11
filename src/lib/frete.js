/* ============================================================================
 * FRETE POR REGIÃO + CONSULTA DE CEP (ViaCEP)
 * O valor e o prazo de cada região são editados no Painel > Configurações.
 * Por padrão todas as regiões usam o frete e o prazo que a loja já tinha.
 * ========================================================================== */

export const REGIOES = [
  { id: "sp", label: "Estado de São Paulo", ufs: ["SP"] },
  { id: "sudeste", label: "Sudeste (RJ, MG, ES)", ufs: ["RJ", "MG", "ES"] },
  { id: "sul", label: "Sul", ufs: ["PR", "SC", "RS"] },
  { id: "centro", label: "Centro-Oeste", ufs: ["DF", "GO", "MT", "MS"] },
  { id: "nordeste", label: "Nordeste", ufs: ["BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"] },
  { id: "norte", label: "Norte", ufs: ["AM", "PA", "AC", "RO", "RR", "AP", "TO"] },
];

export const regiaoDaUF = (uf) => REGIOES.find((r) => r.ufs.includes(String(uf || "").toUpperCase())) || null;

/** Tabela padrão: mesma regra de antes (um valor único e 3 a 8 dias úteis) */
export const defaultFreteRegioes = (fee = 15.9) =>
  Object.fromEntries(REGIOES.map((r) => [r.id, { fee, min: 3, max: 8 }]));

/** Frete e prazo para uma UF (sem UF, usa o valor único das configurações) */
export const freteParaUF = (uf, settings, subtotal = 0) => {
  const reg = regiaoDaUF(uf);
  const tabela = settings.freteRegioes || {};
  const linha = reg && tabela[reg.id] ? tabela[reg.id] : { fee: settings.shippingFee, min: 3, max: 8 };
  const gratis = subtotal > 0 && subtotal >= settings.freeShipping;
  return { regiao: reg, fee: gratis ? 0 : Number(linha.fee) || 0, valorCheio: Number(linha.fee) || 0, min: linha.min ?? 3, max: linha.max ?? 8, gratis };
};

/** Consulta o endereço de um CEP no ViaCEP (serviço público e gratuito dos Correios) */
const cacheCEP = new Map();
export const buscarCEP = async (cep) => {
  const n = String(cep || "").replace(/\D/g, "");
  if (n.length !== 8) throw new Error("Digite os 8 números do CEP.");
  if (cacheCEP.has(n)) return cacheCEP.get(n);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`https://viacep.com.br/ws/${n}/json/`, { signal: ctrl.signal });
    if (!res.ok) throw new Error("Não foi possível consultar o CEP agora.");
    const d = await res.json();
    if (d.erro) throw new Error("CEP não encontrado. Confira os números.");
    const out = { cep: n, street: d.logradouro || "", district: d.bairro || "", city: d.localidade || "", state: d.uf || "" };
    cacheCEP.set(n, out);
    return out;
  } catch (e) {
    if (e.name === "AbortError") throw new Error("A consulta do CEP demorou demais. Tente de novo.");
    throw e.message ? e : new Error("Não foi possível consultar o CEP agora.");
  } finally {
    clearTimeout(timer);
  }
};

/** Texto de prazo: "3 a 8 dias úteis" */
export const prazoTexto = ({ min, max }) => (min === max ? `${min} ${min === 1 ? "dia útil" : "dias úteis"}` : `${min} a ${max} dias úteis`);
