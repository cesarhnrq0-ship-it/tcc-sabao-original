// Teste de carga da loja Farmaura (GitHub Pages).
// O site tem uma única página (SPA): todas as seções vêm no mesmo index.html.
// Uso: k6 run -e VUS=5 -e RAMP_UP=10s -e HOLD=30s load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://cesarhnrq0-ship-it.github.io/tcc-sabao-original/';
const VUS = Number(__ENV.VUS || 100);
const RAMP_UP = __ENV.RAMP_UP || '30s';
const HOLD = __ENV.HOLD || '60s';
const RAMP_DOWN = __ENV.RAMP_DOWN || '15s';

export const options = {
  stages: [
    { duration: RAMP_UP, target: VUS },
    { duration: HOLD, target: VUS },
    { duration: RAMP_DOWN, target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<3000'],
    checks: ['rate>0.99'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

export default function () {
  // Só o HTML do próprio site: os CDNs de terceiros ficam fora do teste
  const res = http.get(BASE_URL, {
    headers: { 'Accept-Encoding': 'gzip' },
    tags: { name: 'index' },
  });
  check(res, {
    'status 200': (r) => r.status === 200,
    'é a loja Farmaura': (r) => typeof r.body === 'string' && r.body.includes('Farmaura'),
    'HTML completo': (r) => typeof r.body === 'string' && r.body.includes('</html>'),
  });
  // Tempo de leitura de uma pessoa real, entre 3 e 7 segundos
  sleep(3 + Math.random() * 4);
}
