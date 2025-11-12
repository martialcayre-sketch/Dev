import express from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { logRequests } from './middleware/log';
import { requestId } from './middleware/requestId';
import questionnairesRouter from './routes/questionnaires';
import { makeError, makeOk } from './utils/response';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(requestId);
app.use(logRequests);

// Health check - root and /api/health
app.get('/health', (req: any, res) => {
  try {
    res.json(makeOk({ status: 'ok', timestamp: new Date().toISOString() }, req.id));
  } catch (e: any) {
    res.status(500).json(makeError('internal', 'Health check failed', req?.id));
  }
});
app.get('/api/health', (req: any, res) => {
  try {
    res.json(makeOk({ status: 'ok', timestamp: new Date().toISOString() }, req.id));
  } catch (e: any) {
    res.status(500).json(makeError('internal', 'Health check failed', req?.id));
  }
});

// API routes - both at root and /api prefix
app.use('/', questionnairesRouter);
app.use('/api', questionnairesRouter);

// 404 handler
app.use((req: any, res) => {
  res.status(404).json(makeError('not_found', 'Not found', req?.id, { path: req.path }));
});

// Export as Firebase Cloud Function with region enforced
export const api = onRequest({ region: 'europe-west1' }, app);

// Export named app for integration tests (Supertest)
export { app as expressApp };
