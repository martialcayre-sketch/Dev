import express from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import questionnairesRouter from './routes/questionnaires';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Health check - root and /api/health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes - both at root and /api prefix
app.use('/', questionnairesRouter);
app.use('/api', questionnairesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Export as Firebase Cloud Function with region enforced
export const api = onRequest({ region: 'europe-west1' }, app);
