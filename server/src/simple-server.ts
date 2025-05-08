import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { CorsOptions } from 'cors';

// Load environment variables
dotenv.config();

// Set NODE_ENV to 'development' if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Define types for our application
interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  userId: string;
  numberOfFounders: number;
  numberOfInvestors: number;
  createdAt: string;
  updatedAt: string;
}

interface FormDocument {
  _id: string;
  name: string;
  description: string;
  pipelineId?: string;
  submitterType: 'FOUNDER' | 'INVESTOR';
  components: Array<{
    key: string;
    label: string;
    type: string;
    input: boolean;
    isPersonality?: boolean;
    data?: any;
    values?: Array<{ label: string; value: string }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface SubmissionDocument {
  _id: string;
  formId: string;
  pipelineId: string;
  submitterType: 'FOUNDER' | 'INVESTOR';
  data: Record<string, any>;
  submittedAt: string;
  status: 'PROCESSING' | 'PROCESSED' | 'FAILED';
}

// Initialize Express app
const app = express();
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
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to log requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware to simulate authentication
const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In a real app, we would validate the token with Clerk
    // For now, we'll just set a user ID based on the email in the request
    const email = req.headers['x-user-email'] || 'noella@prodg.xyz';
    
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
  }
  next();
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.get('/api/pipeline', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
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
      },
      { 
        id: '4', 
        name: 'UK Startups', 
        description: 'Pipeline for UK startups',
        numberOfFounders: 2,
        numberOfInvestors: 3
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
        pipelineId: pipelineId,
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
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Investor Form',
        description: 'Form for investors',
        pipelineId: pipelineId,
        submitterType: 'INVESTOR',
        components: [
          { key: 'name', label: 'Name', type: 'textfield', input: true },
          { key: 'email', label: 'Email', type: 'email', input: true },
          { key: 'investmentFocus', label: 'Investment Focus', type: 'selectboxes', values: [
            { label: 'Technology', value: 'technology' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'Finance', value: 'finance' },
            { label: 'Education', value: 'education' }
          ], input: true },
          { key: 'investmentStage', label: 'Investment Stage', type: 'selectboxes', values: [
            { label: 'Idea', value: 'idea' },
            { label: 'Prototype', value: 'prototype' },
            { label: 'Seed', value: 'seed' },
            { label: 'Series A', value: 'series_a' }
          ], input: true },
          { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'textfield', input: true, isPersonality: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  });
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

app.post('/api/pipeline', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { pipelineName, description } = req.body;
  const newId = new Date().getTime().toString();
  res.status(201).json({
    id: newId,
    name: pipelineName || 'New Pipeline',
    description: description || 'New pipeline description',
    userId: req.userId
  });
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

app.put('/api/pipeline/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { pipelineName, description } = req.body;
  res.status(200).json({
    id: req.params.id,
    name: pipelineName || 'Updated Pipeline',
    description: description || 'Updated pipeline description',
    userId: req.userId
  });
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

app.delete('/api/pipeline/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.status(204).send();
});

// Form routes
app.get('/api/forms', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json([
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
        { key: 'investmentFocus', label: 'Investment Focus', type: 'selectboxes', values: [
          { label: 'Technology', value: 'technology' },
          { label: 'Healthcare', value: 'healthcare' },
          { label: 'Finance', value: 'finance' },
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

// Get forms by ID
app.get('/api/forms/:formId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const formId = req.params.formId;
  const form = formId === '1' ? {
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
  } : {
    _id: '2',
    name: 'Investor Form',
    description: 'Form for investors',
    submitterType: 'INVESTOR',
    components: [
      { key: 'name', label: 'Name', type: 'textfield', input: true },
      { key: 'email', label: 'Email', type: 'email', input: true },
      { key: 'investmentFocus', label: 'Investment Focus', type: 'selectboxes', values: [
        { label: 'Technology', value: 'technology' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Finance', value: 'finance' },
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
  };
  
  res.status(200).json(form);
});

// Get submissions for a form
app.get('/api/forms/:formId/submissions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const formId = req.params.formId;
  
  // Generate some sample submissions
  const submissions = [];
  const numSubmissions = formId === '1' ? 2 : 3; // 2 founders, 3 investors
  
  for (let i = 0; i < numSubmissions; i++) {
    const isFounder = formId === '1';
    const submissionId = `${formId}_${i + 1}`;
    
    const submission: SubmissionDocument = {
      _id: submissionId,
      formId,
      pipelineId: '1', // Assuming this is for pipeline 1
      submitterType: isFounder ? 'FOUNDER' : 'INVESTOR',
      data: {
        name: isFounder ? 
              i === 0 ? 'Mitch' : 'Jane Doe' :
              i === 0 ? 'Noella Spitz' : i === 1 ? 'John Doe' : 'Alice Brown',
        email: `${isFounder ? 'founder' : 'investor'}${i + 1}@example.com`,
        ...(isFounder ? {
          industry: i === 0 ? 'technology' : 'healthcare',
          stage: i === 0 ? 'seed' : 'prototype'
        } : {
          investmentFocus: i === 0 ? ['technology', 'finance'] : ['healthcare', 'education'],
          investmentStage: i === 0 ? ['seed', 'series_a'] : ['prototype', 'seed']
        }),
        linkedinUrl: `https://www.linkedin.com/in/${isFounder ? 'founder' : 'investor'}${i + 1}`
      },
      submittedAt: new Date(Date.now() - i * 86400000).toISOString(), // Stagger by days
      status: 'PROCESSED'
    };
    
    submissions.push(submission);
  }
  
  res.status(200).json({ data: submissions });
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
    const founderId = `1_${i + 1}`; // formId_submissionIndex
    
    for (let j = 0; j < 3; j++) { // 3 investors
      const investorId = `2_${j + 1}`;
      const score = 0.7 + Math.random() * 0.3; // Random score between 0.7 and 1.0
      
      founderMatches.push({
        id: `match_${founderId}_${investorId}`,
        founderId,
        investorId,
        score,
        status: 'pending',
        founderName: i === 0 ? 'Mitch' : 'Jane Doe',
        investorName: j === 0 ? 'Noella Spitz' : j === 1 ? 'John Doe' : 'Alice Brown'
      });
    }
  }
  
  // For each investor, generate matches with founders
  for (let j = 0; j < 3; j++) { // 3 investors
    const investorId = `2_${j + 1}`;
    
    for (let i = 0; i < 2; i++) { // 2 founders
      const founderId = `1_${i + 1}`;
      const score = 0.7 + Math.random() * 0.3; // Random score between 0.7 and 1.0
      
      investorMatches.push({
        id: `match_${founderId}_${investorId}`,
        founderId,
        investorId,
        score,
        status: 'pending',
        founderName: i === 0 ? 'Mitch' : 'Jane Doe',
        investorName: j === 0 ? 'Noella Spitz' : j === 1 ? 'John Doe' : 'Alice Brown'
      });
    }
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

// Get match details
app.get('/api/matches/:matchId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const matchId = req.params.matchId;
  
  const matchDetails = {
    id: matchId,
    founderId: matchId.startsWith('match_1') ? '1' : '3',
    investorId: matchId.startsWith('match_1') ? '2' : '4',
    score: 0.9,
    status: 'pending',
    overallScore: 0.9,
    breakdown: {
      industry: {
        score: 0.95,
        weight: 0.4,
        weightedScore: 0.38,
        details: {
          founderIndustry: 'technology',
          investorIndustries: ['technology', 'finance'],
          match: 'Full match on technology'
        }
      },
      stage: {
        score: 0.9,
        weight: 0.3,
        weightedScore: 0.27,
        details: {
          founderStage: 'seed',
          investorStages: ['seed', 'series_a'],
          match: 'Full match on seed stage'
        }
      },
      personality: {
        score: 0.83,
        weight: 0.3,
        weightedScore: 0.25,
        details: {
          founderPersonality: {
            traits: ['Analytical', 'Risk-taker'],
            linkedinAnalysis: 'Based on LinkedIn profile analysis'
          },
          investorPersonality: {
            traits: ['Analytical', 'Cautious'],
            linkedinAnalysis: 'Based on LinkedIn profile analysis'
          },
          match: 'Partial match on Analytical trait'
        }
      }
    },
    founderInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      industry: 'technology',
      stage: 'seed',
      linkedinUrl: 'https://www.linkedin.com/in/johndoe'
    },
    investorInfo: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      investmentFocus: ['technology', 'finance'],
      investmentStage: ['seed', 'series_a'],
      linkedinUrl: 'https://www.linkedin.com/in/janesmith'
    }
  };
  
  res.status(200).json(matchDetails);
});

// Get match criteria for a pipeline
app.get('/api/pipeline/:id/match-criteria', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const pipelineId = req.params.id;
  
  res.status(200).json({
    pipelineId,
    matchCriteria: [
      {
        field: 'industry',
        weight: 0.4,
        matchType: 'exact',
        founderField: 'industry',
        investorField: 'investmentFocus'
      },
      {
        field: 'stage',
        weight: 0.3,
        matchType: 'exact',
        founderField: 'stage',
        investorField: 'investmentStage'
      },
      {
        field: 'personality',
        weight: 0.3,
        matchType: 'personality',
        founderField: 'linkedinUrl',
        investorField: 'linkedinUrl'
      }
    ]
  });
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

// Personality routes
app.get('/api/personality/:submissionId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

// Form submission routes
app.post('/api/forms/:formId/submit', (req: Request, res: Response) => {
  const formId = req.params.formId;
  const { data, pipelineId } = req.body;
  
  if (!data || !pipelineId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const submissionId = new Date().getTime().toString();
  const submitterType = formId === '1' ? 'FOUNDER' : 'INVESTOR';
  
  res.status(201).json({
    _id: submissionId,
    formId,
    pipelineId,
    submitterType,
    data,
    status: 'PROCESSING',
    submittedAt: new Date().toISOString(),
    message: 'Form submitted successfully'
  });
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

// Retry submission processing
app.post('/api/submissions/:submissionId/retry', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const submissionId = req.params.submissionId;
  
  res.status(200).json({
    _id: submissionId,
    status: 'PROCESSING',
    message: 'Submission processing restarted',
    processingStartedAt: new Date().toISOString()
  });
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

// Industry family routes for matching algorithm
app.get('/api/industry-families', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json([
    {
      id: '1',
      name: 'Technology',
      industries: ['software', 'hardware', 'ai', 'blockchain', 'saas', 'fintech'],
      relatedFamilies: ['2']
    },
    {
      id: '2',
      name: 'Finance',
      industries: ['banking', 'insurance', 'investment', 'wealth management', 'fintech'],
      relatedFamilies: ['1']
    },
    {
      id: '3',
      name: 'Healthcare',
      industries: ['biotech', 'medical devices', 'pharmaceuticals', 'healthcare services', 'healthtech'],
      relatedFamilies: ['1']
    },
    {
      id: '4',
      name: 'Education',
      industries: ['edtech', 'schools', 'training', 'e-learning', 'education services'],
      relatedFamilies: ['1']
    }
  ]);
});

// Character trait routes for personality matching
app.get('/api/character-traits', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json([
    {
      id: '1',
      name: 'Openness',
      description: 'Appreciation for art, emotion, adventure, unusual ideas, curiosity, and variety of experience',
      weight: 0.8,
      compatibleTraits: ['3', '5'],
      incompatibleTraits: ['4']
    },
    {
      id: '2',
      name: 'Conscientiousness',
      description: 'A tendency to be organized and dependable, show self-discipline, act dutifully, aim for achievement, and prefer planned rather than spontaneous behavior',
      weight: 0.7,
      compatibleTraits: ['4', '5'],
      incompatibleTraits: ['3']
    },
    {
      id: '3',
      name: 'Extraversion',
      description: 'Energy, positive emotions, surgency, assertiveness, sociability and the tendency to seek stimulation in the company of others, and talkativeness',
      weight: 0.6,
      compatibleTraits: ['1', '5'],
      incompatibleTraits: ['2', '4']
    },
    {
      id: '4',
      name: 'Agreeableness',
      description: 'A tendency to be compassionate and cooperative rather than suspicious and antagonistic towards others',
      weight: 0.9,
      compatibleTraits: ['2', '5'],
      incompatibleTraits: ['1', '3']
    },
    {
      id: '5',
      name: 'Neuroticism',
      description: 'A tendency to experience unpleasant emotions easily, such as anger, anxiety, depression, and vulnerability',
      weight: 0.3,
      compatibleTraits: [],
      incompatibleTraits: ['1', '2', '3', '4']
    }
  ]);
});

// Add error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

// Add a catch-all route for API routes to handle 404s
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  } catch (error) {
    console.error('Error fetching forms for pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch forms for pipeline' });
  }
});

export default app;
