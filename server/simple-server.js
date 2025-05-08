const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4001;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.get('/api/pipeline', (req, res) => {
  res.status(200).json({ 
    message: 'Pipeline API is available',
    pipelines: [
      { id: '1', name: 'Demo Pipeline', description: 'A demo pipeline for testing' }
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Simple API server running on port ${PORT}`);
});
