import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import { connectToDatabase } from './db/config/dbconfig';
import { ObjectId } from 'mongodb';
import { MatchType } from './types/matchCriteria.type';

// Load environment variables
config();

// Initialize express app
const app = express();
const PORT = process.env.API_PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to log requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Custom interface to extend Express Request
interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

// Middleware to handle Clerk authentication
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In a real app, we would validate the token with Clerk
    // For now, we'll just set a user ID based on the email in the request
    const email = req.headers['x-user-email'] as string || 'noella@prodg.xyz';
    
    // Always accept the admin credentials
    if (email === 'noella@prodg.xyz') {
      req.userId = 'admin123';
      req.userEmail = email;
      console.log('Admin authenticated:', email);
      next();
      return;
    }
    
    // Handle other users
    req.userId = 'user123';
    req.userEmail = email;
    console.log('User authenticated:', email);
    next();
  } else {
    // For development, allow requests without auth header
    // This helps with testing when Clerk might be having issues
    console.log('No auth header, using default admin credentials');
    req.userId = 'admin123';
    req.userEmail = 'noella@prodg.xyz';
    next();
  }
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.get('/api/pipeline', authMiddleware, (req: AuthRequest, res: Response) => {
  // Return different data based on the user
  if (req.userId === 'admin123') {
    res.status(200).json([
      { 
        id: '1', 
        name: 'Admin Pipeline', 
        description: 'Admin pipeline for testing',
        numberOfFounders: 5,
        numberOfInvestors: 8
      },
      { 
        id: '2', 
        name: 'Investor Pipeline', 
        description: 'Pipeline for investors',
        numberOfFounders: 3,
        numberOfInvestors: 12
      },
      { 
        id: '3', 
        name: 'Founder Pipeline', 
        description: 'Pipeline for founders',
        numberOfFounders: 10,
        numberOfInvestors: 4
      }
    ]);
  } else {
    res.status(200).json([
      { 
        id: '1', 
        name: 'Demo Pipeline', 
        description: 'A demo pipeline for testing',
        numberOfFounders: 2,
        numberOfInvestors: 3
      }
    ]);
  }
});

app.get('/api/pipeline/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    id: req.params.id,
    name: 'Demo Pipeline',
    description: 'A demo pipeline for testing',
    userId: req.userId
  });
});

app.post('/api/pipeline', authMiddleware, (req: AuthRequest, res: Response) => {
  const { pipelineName, description } = req.body;
  res.status(201).json({
    id: new ObjectId().toString(),
    name: pipelineName || 'New Pipeline',
    description: description || 'New pipeline description',
    userId: req.userId
  });
});

app.put('/api/pipeline/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { pipelineName, description } = req.body;
  res.status(200).json({
    id: req.params.id,
    name: pipelineName || 'Updated Pipeline',
    description: description || 'Updated pipeline description',
    userId: req.userId
  });
});

app.delete('/api/pipeline/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  res.status(204).send();
});

// Form routes
app.get('/api/forms', authMiddleware, (req: AuthRequest, res: Response) => {
  res.status(200).json([
    { 
      id: '1', 
      name: 'Founder Form', 
      description: 'Form for founders',
      components: [
        { key: 'name', label: 'Name', type: 'textfield', input: true },
        { key: 'email', label: 'Email', type: 'email', input: true },
        { key: 'industry', label: 'Industry', type: 'select', data: { values: [
          { label: 'Technology', value: 'technology' },
          { label: 'Finance', value: 'finance' },
          { label: 'Healthcare', value: 'healthcare' },
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
      id: '2', 
      name: 'Investor Form', 
      description: 'Form for investors',
      components: [
        { key: 'name', label: 'Name', type: 'textfield', input: true },
        { key: 'email', label: 'Email', type: 'email', input: true },
        { key: 'investmentFocus', label: 'Investment Focus', type: 'selectboxes', values: [
          { label: 'Technology', value: 'technology' },
          { label: 'Finance', value: 'finance' },
          { label: 'Healthcare', value: 'healthcare' },
          { label: 'Education', value: 'education' }
        ], input: true },
        { key: 'investmentStage', label: 'Investment Stage', type: 'selectboxes', values: [
          { label: 'Idea', value: 'idea' },
          { label: 'Prototype', value: 'prototype' },
          { label: 'Seed', value: 'seed' },
          { label: 'Series A', value: 'series_a' }
        ], input: true },
        { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'textfield', input: true, isPersonality: true }
      ]
    }
  ]);
});

// Match criteria routes
app.get('/api/pipeline/:pipelineId/match-criteria', authMiddleware, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    pipelineId: req.params.pipelineId,
    matchCriteria: [
      {
        founderField: 'industry',
        investorField: 'investmentFocus',
        required: true,
        matchType: MatchType.EXACT,
        weight: 0.5
      },
      {
        founderField: 'stage',
        investorField: 'investmentStage',
        required: true,
        matchType: MatchType.EXACT,
        weight: 0.3
      },
      {
        founderField: 'linkedinUrl',
        investorField: 'linkedinUrl',
        required: false,
        matchType: MatchType.SOFT,
        weight: 0.2
      }
    ],
    useLinkedinPersonality: true
  });
});

// Submission routes
app.get('/api/submissions', authMiddleware, (req: AuthRequest, res: Response) => {
  // Return different data based on the user
  if (req.userId === 'admin123') {
    res.status(200).json([
      { 
        id: '1', 
        formId: '1', 
        pipelineId: '1',
        type: 'founder',
        data: { 
          name: 'John Doe', 
          email: 'john@example.com',
          industry: 'technology',
          stage: 'seed',
          linkedinUrl: 'https://www.linkedin.com/in/johndoe'
        } 
      },
      { 
        id: '2', 
        formId: '2', 
        pipelineId: '1',
        type: 'investor',
        data: { 
          name: 'Jane Smith', 
          email: 'jane@example.com',
          investmentFocus: ['technology', 'finance'],
          investmentStage: ['seed', 'series_a'],
          linkedinUrl: 'https://www.linkedin.com/in/janesmith'
        } 
      },
      { 
        id: '3', 
        formId: '1', 
        pipelineId: '2',
        type: 'founder',
        data: { 
          name: 'Bob Johnson', 
          email: 'bob@example.com',
          industry: 'healthcare',
          stage: 'prototype',
          linkedinUrl: 'https://www.linkedin.com/in/bobjohnson'
        } 
      },
      { 
        id: '4', 
        formId: '2', 
        pipelineId: '2',
        type: 'investor',
        data: { 
          name: 'Alice Brown', 
          email: 'alice@example.com',
          investmentFocus: ['healthcare', 'education'],
          investmentStage: ['prototype', 'seed'],
          linkedinUrl: 'https://www.linkedin.com/in/alicebrown'
        } 
      }
    ]);
  } else {
    res.status(200).json([
      { id: '1', formId: '1', pipelineId: '1', type: 'founder', data: { name: 'John Doe', email: 'john@example.com' } },
      { id: '2', formId: '2', pipelineId: '1', type: 'investor', data: { name: 'Jane Smith', email: 'jane@example.com' } }
    ]);
  }
});

// Personality routes
app.get('/api/personality/:submissionId', authMiddleware, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    submissionId: req.params.submissionId,
    traits: [
      { name: 'Openness', score: 0.8 },
      { name: 'Conscientiousness', score: 0.7 },
      { name: 'Extraversion', score: 0.6 },
      { name: 'Agreeableness', score: 0.9 },
      { name: 'Neuroticism', score: 0.3 }
    ],
    analysis: 'This person is highly open to new experiences and very agreeable. They are conscientious and moderately extraverted.'
  });
});

// Match routes
app.get('/api/matches/:pipelineId', authMiddleware, (req: AuthRequest, res: Response) => {
  res.status(200).json([
    {
      id: '1',
      founderSubmissionId: '1',
      investorSubmissionId: '2',
      score: 0.85,
      criteria: {
        industry: 0.9,
        stage: 0.8,
        personality: 0.7
      },
      status: 'PENDING'
    },
    {
      id: '2',
      founderSubmissionId: '3',
      investorSubmissionId: '4',
      score: 0.75,
      criteria: {
        industry: 0.8,
        stage: 0.7,
        personality: 0.6
      },
      status: 'ACCEPTED'
    }
  ]);
});

// Connect to database and start server
const startServer = async () => {
  try {
    // Uncomment this when MongoDB connection is needed
    // await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
