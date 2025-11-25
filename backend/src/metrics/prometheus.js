// backend/src/metrics/prometheus.js

const client = require('prom-client');

client.collectDefaultMetrics({ prefix: 'greenharvest_' });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 0.75, 1, 2, 5],
});

const inventoryGauge = new client.Gauge({
  name: 'inventory_low_stock_count',
  help: 'Number of products that are below their low stock threshold',
});

const activeFarmersGauge = new client.Gauge({
  name: 'active_farmers_total',
  help: 'Number of active farmer profiles',
});

const queueDepthGauge = new client.Gauge({
  name: 'task_queue_depth',
  help: 'Depth of asynchronous task queues',
  labelNames: ['queue'],
});

module.exports = {
  register: client.register,
  httpRequestDuration,
  inventoryGauge,
  activeFarmersGauge,
  queueDepthGauge,
};

