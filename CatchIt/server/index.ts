import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pushRoutes from './routes/push.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.server
const envPath = join(__dirname, '..', '.env.server');
try {
  const content = readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const idx = line.indexOf('=');
    if (idx > 0) {
      process.env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  });
} catch {
  console.error('Warning: Could not read .env.server');
}

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', /\.local$/],
  methods: ['GET', 'POST', 'DELETE'],
}));

app.use(express.json());

app.use('/api', pushRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`\n🚌 Catch It push server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Active jobs: http://localhost:${PORT}/api/jobs\n`);
});
