import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { authenticateToken, logRequest } from './middleware/auth.js';
import adminRouter from './routes/admin.js';
import analyticsRouter from './routes/analytics.js';
import consultationRouter from './routes/consultation.js';
import practitionersRouter from './routes/practitioners.js';
import questionnairesRouter from './routes/questionnaires.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

// Basic rate limiting across API to mitigate abuse
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// Log middleware (optional, pour debug)
app.use(logRequest);

// Support both root routes and /api/* when proxied by Firebase Hosting
const router = express.Router();
router.get('/health', (_req, res) => res.json({ ok: true }));
router.get('/hello', (_req, res) =>
  res.json({ message: 'Hello from Cloud Run API - Backend First Architecture' })
);
// Require auth for all subsequent routes by default; route files can add role checks
router.use(authenticateToken);

// Mount all routes
router.use(questionnairesRouter);
router.use(consultationRouter);
router.use(analyticsRouter);
router.use(adminRouter);
router.use(practitionersRouter);

app.use('/', router);
app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`🚀 API listening on :${port}`);
  console.log(`📊 Backend-First Architecture enabled`);
  console.log(`   - Questionnaires: /patients/:id/questionnaires`);
  console.log(`   - Consultation:   /patients/:id/consultation`);
  console.log(`   - Analytics:      /patients/:id/scores`);
});
