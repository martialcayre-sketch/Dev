import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());

// Support both root routes and /api/* when proxied by Firebase Hosting
const router = express.Router();
router.get('/health', (_req, res) => res.json({ ok: true }));
router.get('/hello', (_req, res) => res.json({ message: 'Hello from Cloud Run API' }));
router.get('/scoring', (_req, res) => res.json({ score: null, message: 'Not implemented' }));

app.use('/', router);
app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
