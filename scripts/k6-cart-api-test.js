import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const VUS = __ENV.VUS || 50;
const DURATION = __ENV.DURATION || '2m';

const errorRate = new Rate('errors');
const cartLatency = new Trend('cart_latency');
const productLatency = new Trend('product_latency');

const authToken = __ENV.AUTH_TOKEN || '';

export const options = {
  scenarios: {
    steady_load: {
      executor: 'constant-vus',
      vus: parseInt(VUS),
      duration: DURATION,
    },
  },
  thresholds: {
    'cart_latency': ['p(95)<500'],
    'product_latency': ['p(95)<300'],
    'errors': ['rate<0.01'],
  },
};

export default function () {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const scenarios = [
    { weight: 40, fn: testCartGet },
    { weight: 30, fn: testCartSet },
    { weight: 20, fn: testProductsList },
    { weight: 10, fn: testProductDetail },
  ];

  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const scenario of scenarios) {
    cumulative += scenario.weight;
    if (rand <= cumulative) {
      scenario.fn(headers);
      break;
    }
  }

  sleep(Math.random() * 2 + 0.5);
}

function testCartGet(headers) {
  const sessionId = `test-session-${Math.floor(Math.random() * 1000)}`;

  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/v1/cart?sessionId=${sessionId}`, { headers });
  const latency = Date.now() - start;

  cartLatency.add(latency);

  const success = check(res, {
    'cart get status 200': (r) => r.status === 200,
    'cart get has items': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && Array.isArray(body.items);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testCartSet(headers) {
  const sessionId = `test-session-${Math.floor(Math.random() * 1000)}`;
  const items = [
    {
      productId: 'product-1',
      variantId: 'variant-1',
      quantity: Math.floor(Math.random() * 5) + 1,
      name: 'Test Product',
      price: 2999,
    },
  ];

  const body = JSON.stringify({
    sessionId,
    items,
    discountCode: null,
  });

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/v1/cart`, body, { headers });
  const latency = Date.now() - start;

  cartLatency.add(latency);

  const success = check(res, {
    'cart set status 200': (r) => r.status === 200,
    'cart set success': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.sessionId === sessionId;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testProductsList(headers) {
  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/v1/products?limit=20&page=1`, { headers });
  const latency = Date.now() - start;

  productLatency.add(latency);

  const success = check(res, {
    'products list status 200': (r) => r.status === 200,
    'products list has products': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && Array.isArray(body.products);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testProductDetail(headers) {
  const productId = `product-${Math.floor(Math.random() * 10) + 1}`;

  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/v1/products/${productId}`, { headers });
  const latency = Date.now() - start;

  productLatency.add(latency);

  const success = check(res, {
    'product detail status 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const lines = [
    '',
    '=== k6 Load Test Summary ===',
    `Total Requests: ${data.metrics.http_reqs?.values?.count || 0}`,
    `Request Rate: ${data.metrics.http_reqs?.values?.rate || 0} req/s`,
    '',
    '--- Latency ---',
    `p95 Cart: ${(data.metrics.cart_latency?.values?.['p(95)'] || 0).toFixed(2)}ms`,
    `p95 Products: ${(data.metrics.product_latency?.values?.['p(95)'] || 0).toFixed(2)}ms`,
    '',
    '--- Error Rate ---',
    `${((data.metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%`,
    '',
    '--- HTTP Status ---',
    Object.entries(data.metrics.http_req_statuses?.values || {})
      .map(([status, count]) => `  ${status}: ${count}`)
      .join('\n'),
    '',
  ];
  return lines.join('\n');
}