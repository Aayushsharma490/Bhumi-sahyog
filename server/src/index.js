import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
config();

// Routes
import queueRoutes from './routes/queue.js';
import aiRoutes from './routes/ai.js';
import farmerRoutes from './routes/farmers.js';
import procurementRoutes from './routes/procurements.js';
import notificationRoutes from './routes/notifications.js';
import whatsappRoutes from './routes/whatsapp.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));

// CORS — Allow Netlify deployed frontend and all localhost origins
app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate limiting (generous for live queue polling and WhatsApp status)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  skip: (req) => req.url.includes('/whatsapp/status') || process.env.NODE_ENV !== 'production',
  message: { error: 'Too many requests. Please try again later.' }
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: 'Bhumi Sahyog API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    whatsapp: process.env.WHATSAPP_ENABLED === 'true' ? 'enabled' : 'disabled',
    groq: !!process.env.GROQ_API_KEY ? 'configured' : 'fallback mode',
    resend: !!process.env.RESEND_API_KEY ? 'configured' : 'disabled',
  });
});

// API routes
app.use('/api/queue', queueRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/procurements', procurementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
import localtunnel from 'localtunnel';

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: PORT, subdomain: 'bhumi-sahyog-jaipur' });
    console.log(`🌐 [Public HTTPS Tunnel Active]: ${tunnel.url}`);
    console.log(`   (Connects Netlify frontend directly to live Node backend & WhatsApp)`);
    tunnel.on('close', () => {
      console.log('🔄 Tunnel closed, reconnecting in 5s...');
      setTimeout(startTunnel, 5000);
    });
    tunnel.on('error', (err) => {
      console.warn('Tunnel note:', err.message);
    });
  } catch (err) {
    console.warn('Automatic tunnel start note:', err.message);
  }
}

// Start server
app.listen(PORT, () => {
  console.log('\n🌾 ========================================');
  console.log('   BHUMI SAHYOG — Server Starting');
  console.log('   Predict. Inform. Reduce Waiting.');
  console.log('========================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? '✅ Configured' : '⚠️  Fallback mode (no API key)'}`);
  console.log(`📧 Resend: ${process.env.RESEND_API_KEY ? '✅ Configured' : '⚠️  Disabled'}`);
  console.log(`📱 WhatsApp: ${process.env.WHATSAPP_ENABLED === 'true' ? '✅ Enabled' : '⚠️  Disabled'}`);
  console.log('========================================\n');

  // Start public HTTPS tunnel for Netlify
  startTunnel();
});

export default app;
