// Mesmo teste de load-test.js, salvando o resumo em resultado-k6.json.
export { options, default } from './load-test.js';

export function handleSummary(data) {
  return { 'resultado-k6.json': JSON.stringify(data, null, 2) };
}
