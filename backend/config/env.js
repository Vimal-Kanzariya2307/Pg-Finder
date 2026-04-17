import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root directory
const result = dotenv.config({ path: join(__dirname, '..', '.env') });

if (result.error) {
  console.warn('⚠️  .env file not found, using system environment variables');
} else {
  console.log('✅ Environment variables loaded from .env');
}

// Validate critical env vars
const required = ['JWT_SECRET', 'MONGODB_URI'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Please check your backend/.env file');
  process.exit(1);
}
