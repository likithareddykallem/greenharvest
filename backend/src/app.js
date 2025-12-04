import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import xss from 'xss-clean';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.js';
import client from 'prom-client';

const app = express();
console.log('🚀 Backend loaded with volume mapping! 🚀');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const metricsRegistry = new client.Registry();
client.collectDefaultMetrics({ register: metricsRegistry });

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(
  cors({
    origin: true, // Allow any origin for development (fixes localhost:5174 vs 5173 issues)
    credentials: true,
  })
);
app.use(xss());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
const staticPath = path.join(__dirname, '..', 'uploads');
console.log('Serving static files from:', staticPath);
app.use('/uploads', (req, res, next) => {
  console.log('Static Request:', req.url);
  next();
}, express.static(staticPath));



app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/metrics', (req, res) => {
  res.setHeader('Content-Type', metricsRegistry.contentType);
  metricsRegistry
    .metrics()
    .then((metrics) => res.send(metrics))
    .catch(() => res.status(500).send('metrics error'));
});

app.use('/api', routes);

app.use(errorHandler);

export default app;

