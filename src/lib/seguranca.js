/* ============================================================================
 * SENHA DO PAINEL (modo sem login do Firebase)
 * A senha não fica mais salva em texto: guardamos só o "resumo" SHA-256 dela.
 * Antes, quem abrisse o documento loja/config no banco conseguia ler a senha.
 * Observação: no modo com Firebase Authentication o painel usa e-mail e senha
 * da própria conta do Firebase, que é o jeito mais seguro.
 * ========================================================================== */

const SAL = "farmaura-admin:";

/** Resumo SHA-256 em hexadecimal */
export const hashSenha = async (senha) => {
  const dados = new TextEncoder().encode(SAL + senha);
  const buf = await crypto.subtle.digest("SHA-256", dados);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

/** Confere a senha digitada (aceita o formato antigo em texto, de lojas já salvas) */
export const conferirSenha = async (senha, settings) => {
  // Lojas salvas antes desta versão ainda têm a senha em texto: ela vale até ser convertida
  if (typeof settings.adminPassword === "string" && settings.adminPassword) return senha === settings.adminPassword;
  if (settings.adminPasswordHash) return (await hashSenha(senha)) === settings.adminPasswordHash;
  return false;
};
