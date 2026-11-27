// Mesmo teste de load-test.js, salvando o resumo em relatorio-k6.html.
export { options, default } from './load-test.js';

const ms = (v) => (v === undefined ? '—' : `${Math.round(v)} ms`);
const pct = (v) => (v === undefined ? '—' : `${(v * 100).toFixed(2)}%`);

export function handleSummary(data) {
  const m = data.metrics;
  const dur = m.http_req_duration.values;
  const thresholds = Object.entries(m)
    .flatMap(([name, metric]) =>
      Object.entries(metric.thresholds || {}).map(([rule, r]) =>
        `<tr><td>${name}</td><td>${rule}</td><td class="${r.ok ? 'ok' : 'bad'}">${r.ok ? 'Passou' : 'Falhou'}</td></tr>`))
    .join('');
  const rows = [
    ['Requisições', m.http_reqs.values.count],
    ['Requisições por segundo', m.http_reqs.values.rate.toFixed(1)],
    ['Falhas HTTP', pct(m.http_req_failed.values.rate)],
    ['Checks aprovados', pct(m.checks.values.rate)],
    ['Usuários simultâneos (máx.)', m.vus_max.values.max],
    ['Dados recebidos', `${(m.data_received.values.count / 1048576).toFixed(0)} MB`],
    ['Tempo médio', ms(dur.avg)],
    ['Mediana', ms(dur.med)],
    ['p90', ms(dur['p(90)'])],
    ['p95', ms(dur['p(95)'])],
    ['p99', ms(dur['p(99)'])],
    ['Máximo', ms(dur.max)],
    ['Tempo até o 1º byte (p95)', ms(m.http_req_waiting.values['p(95)'])],
  ].map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Relatório k6</title>
<style>body{font:16px system-ui,sans-serif;max-width:720px;margin:32px auto;padding:0 16px;color:#1c1917}
table{border-collapse:collapse;width:100%;margin-bottom:32px}td{padding:8px;border-bottom:1px solid #e7e5e4}
td:last-child{text-align:right}.ok{color:#047857}.bad{color:#be123c}</style></head><body>
<h1>Relatório de carga: Farmaura</h1><h2>Métricas</h2><table>${rows}</table>
<h2>Limites</h2><table>${thresholds}</table></body></html>`;
  return { 'relatorio-k6.html': html };
}
