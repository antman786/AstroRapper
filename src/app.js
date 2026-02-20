const express = require('express');
const fs = require('node:fs');
const config = require('./config');
const natalRouter = require('./routes/natal');
const transitRouter = require('./routes/transit');

const app = express();

app.use(express.json());

// JSON parse error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Invalid JSON in request body' });
  }
  next(err);
});

// Routes
app.use('/api/natal', natalRouter);
app.use('/api/transit', transitRouter);

// Health check
app.get('/api/health', (req, res) => {
  let accessible = false;
  try {
    fs.accessSync(config.astrologPath, fs.constants.X_OK);
    accessible = true;
  } catch {}
  res.json({
    status: 'ok',
    astrolog: config.astrologPath,
    accessible,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

module.exports = app;
