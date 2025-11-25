// backend/src/metrics/index.js

const { register, httpRequestDuration } = require('./prometheus');

const httpMetricsMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const routePath = `${req.baseUrl || ''}${req.route?.path || ''}` || req.path;
    end({ method: req.method, route: routePath, status_code: res.statusCode });
  });

  next();
};

const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

module.exports = {
  httpMetricsMiddleware,
  metricsHandler,
};

