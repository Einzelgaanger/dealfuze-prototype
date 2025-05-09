import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { CorsOptions } from 'cors';

// Load environment variables
dotenv.config();

// Define interfaces
interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  userId: string;
  numberOfFounders?: number;
  numberOfInvestors?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Create Express app
const app = express();

// Authentication middleware for development
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // For development purposes, we'll use a simple token-based auth
  const token = req.headers.authorization?.split(' ')[1];
  
  // For development, accept any token or set a default user
  const authenticatedReq = req as AuthenticatedRequest;
  
  if (token === 'admin-token') {
    authenticatedReq.userId = 'admin123';
  } else if (token) {
    authenticatedReq.userId = token;
  } else {
    // For development, allow requests without a token
    authenticatedReq.userId = 'user123';
  }
  
  next();
};

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Set port
const PORT = process.env.PORT || 9876; // Using port 9876 to avoid conflicts

// Enable CORS - Configure for production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'])
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:9876'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(bodyParser.json());

// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'DealFuze API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Pipeline routes
app.get('/api/pipeline', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Fetching pipelines for user:', req.userId);
    
    if (req.userId === 'admin123') {
      res.status(200).json([
        {
          id: '1',
          name: 'Admin Pipeline',
          description: 'Admin pipeline for testing',
          userId: req.userId,
          numberOfFounders: 5,
          numberOfInvestors: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Investor Pipeline',
          description: 'Pipeline for investors',
          userId: req.userId,
          numberOfFounders: 3,
          numberOfInvestors: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Founder Pipeline',
          description: 'Pipeline for founders',
          userId: req.userId,
          numberOfFounders: 10,
          numberOfInvestors: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'UK Startups',
          description: 'Pipeline for UK startups',
          userId: req.userId,
          numberOfFounders: 7,
          numberOfInvestors: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } else {
      res.status(200).json([
        {
          id: '1',
          name: 'Demo Pipeline',
          description: 'A demo pipeline for testing',
          userId: req.userId,
          numberOfFounders: 2,
          numberOfInvestors: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

app.get('/api/pipeline/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const pipelineId = req.params.id;
    console.log(`Fetching pipeline with ID: ${pipelineId}`);
    
    // Validate pipeline ID
    if (!pipelineId) {
      console.error('Pipeline ID is missing');
      return res.status(400).json({ error: 'Pipeline ID is required' });
    }
    
    const pipelineData: Pipeline = {
      id: pipelineId,
      name: pipelineId === '1' ? 'Admin Pipeline' : 
            pipelineId === '2' ? 'Investor Pipeline' : 
            pipelineId === '3' ? 'Founder Pipeline' :
            pipelineId === '4' ? 'UK Startups' : 'Demo Pipeline',
      description: pipelineId === '1' ? 'Admin pipeline for testing' : 
                  pipelineId === '2' ? 'Pipeline for investors' : 
                  pipelineId === '3' ? 'Pipeline for founders' :
                  pipelineId === '4' ? 'Pipeline for UK startups' : 'A demo pipeline for testing',
      userId: req.userId || '',
      numberOfFounders: pipelineId === '1' ? 5 : 
                        pipelineId === '2' ? 3 : 
                        pipelineId === '3' ? 10 : 2,
      numberOfInvestors: pipelineId === '1' ? 8 : 
                         pipelineId === '2' ? 12 : 
                         pipelineId === '3' ? 4 : 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Successfully retrieved pipeline: ${pipelineId}`, pipelineData);
    res.status(200).json(pipelineData);
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline details' });
  }
});

// Get forms for a pipeline
app.get('/api/pipeline/:id/form', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const pipelineId = req.params.id;
    console.log(`Fetching forms for pipeline ID: ${pipelineId}`);
    
    // Validate pipeline ID
    if (!pipelineId) {
      console.error('Pipeline ID is missing');
      return res.status(400).json({ error: 'Pipeline ID is required' });
    }
    
    res.status(200).json({
      data: [
        {
          _id: '1',
          name: 'Founder Form',
          description: 'Form for founders',
          submitterType: 'FOUNDER',
          components: [
            { key: 'name', label: 'Name', type: 'textfield', input: true },
            { key: 'email', label: 'Email', type: 'email', input: true },
            { key: 'industry', label: 'Industry', type: 'select', data: { values: [
              { label: 'Technology', value: 'technology' },
              { label: 'Healthcare', value: 'healthcare' },
              { label: 'Finance', value: 'finance' },
              { label: 'Education', value: 'education' }
            ]}, input: true },
            { key: 'stage', label: 'Stage', type: 'select', data: { values: [
              { label: 'Idea', value: 'idea' },
              { label: 'Prototype', value: 'prototype' },
              { label: 'Seed', value: 'seed' },
              { label: 'Series A', value: 'series_a' }
            ]}, input: true },
            { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'textfield', input: true, isPersonality: true }
          ]
        },
        {
          _id: '2',
          name: 'Investor Form',
          description: 'Form for investors',
          submitterType: 'INVESTOR',
          components: [
            { key: 'name', label: 'Name', type: 'textfield', input: true },
            { key: 'email', label: 'Email', type: 'email', input: true },
            { key: 'investmentFocus', label: 'Investment Focus', type: 'selectboxes', data: { values: [
              { label: 'Technology', value: 'technology' },
              { label: 'Healthcare', value: 'healthcare' },
              { label: 'Finance', value: 'finance' },
              { label: 'Education', value: 'education' }
            ]}, input: true },
            { key: 'investmentStage', label: 'Investment Stage', type: 'selectboxes', data: { values: [
              { label: 'Idea', value: 'idea' },
              { label: 'Prototype', value: 'prototype' },
              { label: 'Seed', value: 'seed' },
              { label: 'Series A', value: 'series_a' }
            ]}, input: true },
            { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'textfield', input: true, isPersonality: true }
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

app.post('/api/pipeline', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    res.status(201).json({
      id: Math.floor(Math.random() * 1000).toString(),
      name: name || 'New Pipeline',
      description: description || 'New pipeline description',
      userId: req.userId
    });
  } catch (error) {
    console.error('Error creating pipeline:', error);
    res.status(500).json({ error: 'Failed to create pipeline' });
  }
});

app.put('/api/pipeline/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    res.status(200).json({
      id: req.params.id,
      name: name || 'Updated Pipeline',
      description: description || 'Updated pipeline description',
      userId: req.userId
    });
  } catch (error) {
    console.error('Error updating pipeline:', error);
    res.status(500).json({ error: 'Failed to update pipeline' });
  }
});

app.delete('/api/pipeline/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    res.status(200).json({
      id: req.params.id,
      deleted: true
    });
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    res.status(500).json({ error: 'Failed to delete pipeline' });
  }
});

// Get matches for a pipeline
app.get('/api/pipeline/:id/matches', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const pipelineId = req.params.id;
    console.log(`Fetching matches for pipeline ID: ${pipelineId}`);
    
    // Validate pipeline ID
    if (!pipelineId) {
      console.error('Pipeline ID is missing');
      return res.status(400).json({ error: 'Pipeline ID is required' });
    }
    
    // Generate some sample matches
    const founderMatches = [];
    const investorMatches = [];
  
    // For each founder, generate matches with investors
    for (let i = 0; i < 2; i++) { // 2 founders
      const founderMatch = {
        founderId: `founder-${i + 1}`,
        founderName: `Founder ${i + 1}`,
        matches: []
      };
      
      // Add 2 investor matches for each founder
      for (let j = 0; j < 2; j++) {
        founderMatch.matches.push({
          investorId: `investor-${j + 1}`,
          investorName: `Investor ${j + 1}`,
          score: Math.floor(Math.random() * 100),
          matchedOn: ['industry', 'stage', 'personality']
        });
      }
      
      founderMatches.push(founderMatch);
    }
    
    // For each investor, generate matches with founders
    for (let i = 0; i < 2; i++) { // 2 investors
      const investorMatch = {
        investorId: `investor-${i + 1}`,
        investorName: `Investor ${i + 1}`,
        matches: []
      };
      
      // Add 2 founder matches for each investor
      for (let j = 0; j < 2; j++) {
        investorMatch.matches.push({
          founderId: `founder-${j + 1}`,
          founderName: `Founder ${j + 1}`,
          score: Math.floor(Math.random() * 100),
          matchedOn: ['industry', 'stage', 'personality']
        });
      }
      
      investorMatches.push(investorMatch);
    }
  
    console.log(`Successfully generated matches for pipeline: ${pipelineId}`);
    res.status(200).json({
      pipelineId,
      founderMatches,
      investorMatches
    });
  } catch (error) {
    console.error('Error generating matches for pipeline:', error);
    res.status(500).json({ error: 'Failed to generate matches for pipeline' });
  }
});

// Form submission routes
app.post('/api/forms/:formId/submit', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { formId } = req.params;
    const { data, pipelineId } = req.body;
    
    console.log(`Form submission for form ${formId} in pipeline ${pipelineId}`);
    console.log('Submission data:', data);
    
    res.status(200).json({
      formId,
      pipelineId,
      userId: req.userId,
      data,
      submittedAt: new Date().toISOString(),
      message: 'Form submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Get submissions for a form
app.get('/api/forms/:formId/submissions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { formId } = req.params;
    console.log(`Fetching submissions for form ${formId}`);
    
    // Return empty array for now
    res.status(200).json({
      data: []
    });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Add a catch-all route for API routes to handle 404s
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

export default app;
