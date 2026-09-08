const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 2264;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', routes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'RailMate API', port: PORT, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚆 RailMate API Server running on http://localhost:${PORT}`);
});
