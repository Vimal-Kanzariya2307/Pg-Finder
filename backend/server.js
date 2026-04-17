// ⚠️  dotenv MUST be configured before any other imports in ES Modules
// because import statements are hoisted — dotenv.config() inside the module
// body runs too late if other modules already read process.env at import time.

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the same directory as server.js
const envResult = dotenv.config({ path: join(__dirname, '.env') });

if (envResult.error) {
  console.error('❌ Could not load .env file:', envResult.error.message);
  console.error('   Make sure backend/.env exists!');
  process.exit(1);
}

// Validate critical vars
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is missing from .env!');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('❌ FATAL: MONGODB_URI is missing from .env!');
  process.exit(1);
}

console.log('✅ JWT_SECRET loaded:', process.env.JWT_SECRET.substring(0, 8) + '...');
console.log('✅ MONGODB_URI loaded:', process.env.MONGODB_URI);

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import pgRoutes from './routes/pg.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import inquiryRoutes from './routes/inquiry.js';
import { errorHandler } from './middleware/errorHandler.js';

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/pg', pgRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  jwt: process.env.JWT_SECRET ? 'configured ✓' : 'MISSING ❌',
  db: process.env.MONGODB_URI ? 'configured ✓' : 'MISSING ❌'
}));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
