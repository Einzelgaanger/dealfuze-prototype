const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware to simulate authentication
const authMiddleware = (req, res, next) => {
  // For development, we'll just set a dummy user ID
  req.userId = 'user123';
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.get('/api/pipeline', authMiddleware, (req, res) => {
  res.status(200).json({ 
    message: 'Pipeline API is available',
    pipelines: [
      { id: '1', name: 'Demo Pipeline', description: 'A demo pipeline for testing' }
    ]
  });
});

app.get('/api/pipeline/:id', authMiddleware, (req, res) => {
  res.status(200).json({
    id: req.params.id,
    name: 'Demo Pipeline',
    description: 'A demo pipeline for testing',
    userId: req.userId
  });
});

app.post('/api/pipeline', authMiddleware, (req, res) => {
  const { pipelineName, description } = req.body;
  res.status(201).json({
    id: Date.now().toString(),
    name: pipelineName || 'New Pipeline',
    description: description || 'New pipeline description',
    userId: req.userId
  });
});

app.put('/api/pipeline/:id', authMiddleware, (req, res) => {
  const { pipelineName, description } = req.body;
  res.status(200).json({
    id: req.params.id,
    name: pipelineName || 'Updated Pipeline',
    description: description || 'Updated pipeline description',
    userId: req.userId
  });
});

app.delete('/api/pipeline/:id', authMiddleware, (req, res) => {
  res.status(204).send();
});

// Form routes
app.get('/api/forms', authMiddleware, (req, res) => {
  res.status(200).json([
    { id: '1', name: 'Founder Form', description: 'Form for founders' },
    { id: '2', name: 'Investor Form', description: 'Form for investors' }
  ]);
});

// Submission routes
app.get('/api/submissions', authMiddleware, (req, res) => {
  res.status(200).json([
    { id: '1', formId: '1', data: { name: 'John Doe', email: 'john@example.com' } },
    { id: '2', formId: '2', data: { name: 'Jane Smith', email: 'jane@example.com' } }
  ]);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Simple API server running on port ${PORT}`);
});
