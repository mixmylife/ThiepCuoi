const target = (process.env.TARGET || 'http://127.0.0.1:3000').replace(/\/$/, '');
const slug = process.env.SLUG || 'huy-hihi-duyen';
const durationSeconds = Number(process.env.DURATION || 30);
const concurrency = Number(process.env.CONCURRENCY || 20);
const writeEnabled = process.env.WRITE === '1';
const timeoutMs = Number(process.env.TIMEOUT_MS || 10000);

const readScenarios = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: `/thiep/${slug}` },
  { method: 'GET', path: `/api/wedding-config/${slug}` },
  { method: 'GET', path: `/api/guestbook/${slug}` },
  { method: 'GET', path: `/api/stats/${slug}` },
  { method: 'GET', path: '/api/platform-stats' },
  { method: 'GET', path: '/api/templates' },
];

const writeScenarios = [
  {
    method: 'POST',
    path: `/api/rsvp/${slug}`,
    body: () => ({
      name: `Load Test ${Date.now()}`,
      phone: '0900000000',
      attendance: 'yes',
      message: 'Load test RSVP',
    }),
  },
  {
    method: 'POST',
    path: `/api/guestbook/${slug}`,
    body: () => ({
      name: `Load Test ${Date.now()}`,
      message: 'Load test guestbook',
    }),
  },
];

const scenarios = writeEnabled ? [...readScenarios, ...writeScenarios] : readScenarios;
const endAt = Date.now() + durationSeconds * 1000;
const latencies = [];
const statusCounts = new Map();
let total = 0;
let failed = 0;

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

function pickScenario(workerId) {
  return scenarios[(total + workerId) % scenarios.length];
}

async function requestOnce(workerId) {
  const scenario = pickScenario(workerId);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const body = scenario.body?.();
    const response = await fetch(`${target}${scenario.path}`, {
      method: scenario.method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    await response.arrayBuffer();
    const elapsed = performance.now() - started;
    latencies.push(elapsed);
    total++;
    statusCounts.set(response.status, (statusCounts.get(response.status) || 0) + 1);
    if (response.status >= 400) failed++;
  } catch {
    total++;
    failed++;
    statusCounts.set('ERR', (statusCounts.get('ERR') || 0) + 1);
  } finally {
    clearTimeout(timer);
  }
}

async function worker(workerId) {
  while (Date.now() < endAt) {
    await requestOnce(workerId);
  }
}

console.log(`Target: ${target}`);
console.log(`Slug: ${slug}`);
console.log(`Duration: ${durationSeconds}s`);
console.log(`Concurrency: ${concurrency}`);
console.log(`Writes: ${writeEnabled ? 'enabled' : 'disabled'}`);

const startedAt = Date.now();
await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)));
const elapsedSeconds = (Date.now() - startedAt) / 1000;

const ok = total - failed;
const average = latencies.reduce((sum, value) => sum + value, 0) / (latencies.length || 1);
const statuses = [...statusCounts.entries()]
  .sort(([a], [b]) => String(a).localeCompare(String(b)))
  .map(([status, count]) => `${status}:${count}`)
  .join(' ');

console.log('');
console.log('Results');
console.log(`Requests: ${total}`);
console.log(`OK: ${ok}`);
console.log(`Failed: ${failed}`);
console.log(`RPS: ${(total / elapsedSeconds).toFixed(2)}`);
console.log(`Latency avg: ${average.toFixed(1)} ms`);
console.log(`Latency p50: ${percentile(latencies, 50).toFixed(1)} ms`);
console.log(`Latency p95: ${percentile(latencies, 95).toFixed(1)} ms`);
console.log(`Latency p99: ${percentile(latencies, 99).toFixed(1)} ms`);
console.log(`Statuses: ${statuses}`);

if (failed > 0) {
  process.exitCode = 1;
}
