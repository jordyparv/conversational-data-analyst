import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.js';
import './db/database.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/chat', chatRouter);
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
