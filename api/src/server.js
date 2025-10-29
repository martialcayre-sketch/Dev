import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/hello', (_req, res) => res.json({ message: 'Hello from Cloud Run API' }));
app.get('/scoring', (_req, res) => res.json({ score: null, message: 'Not implemented' }));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});

