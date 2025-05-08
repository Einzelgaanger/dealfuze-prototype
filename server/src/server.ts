import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Define types for our application
interface AuthenticatedRequest extends Request {
  userId?: string;
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

interface MatchCriteria {
  weights: {
    industry: number;
    stage: number;
    personality: number;
  };
}

interface Match {
  id: string;
  founderId: string;
  investorId: string;
  score: number;
  status: 'pending' | 'accepted' | 'rejected' | 'contacted';
}

interface MatchDetails extends Match {
  overallScore: number;
  breakdown: {
    industry: {
      score: number;
      weight: number;
      weightedScore: number;
      details: {
        founderIndustry: string;
        investorIndustries: string[];
        match: string;
      };
    };
    stage: {
      score: number;
      weight: number;
      weightedScore: number;
      details: {
        founderStage: string;
        investorStages: string[];
        match: string;
      };
    };
    personality: {
      score: number;
      weight: number;
      weightedScore: number;
      details: {
        founderPersonality: {
          traits: string[];
          linkedinAnalysis: string;
        };
        investorPersonality: {
          traits: string[];
          linkedinAnalysis: string;
        };
        match: string;
      };
    };
  };
  founderInfo: {
    name: string;
    email: string;
    industry: string;
    stage: string;
    linkedinUrl: string;
  };
  investorInfo: {
    name: string;
    email: string;
    investmentFocus: string[];
    investmentStage: string[];
    linkedinUrl: string;
  };
}

interface IndustryFamily {
  id: string;
  name: string;
  industries: string[];
}

interface CharacterTrait {
  id: string;
  name: string;
  description: string;
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5050; // Changed port to avoid conflict

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication middleware
const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // For development, we'll use a simple token-based authentication
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // For development, allow requests without auth
    req.userId = 'dev123';
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  
  if (token === 'admin-token') {
    req.userId = 'admin123';
  } else if (token === 'user-token') {
    req.userId = 'user456';
  } else {
    req.userId = 'dev123';
  }
  
  next();
};

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Pipeline routes
app.get('/api/pipeline', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  // Return different data based on the user
  if (req.userId === 'admin123') {
    res.status(200).json([
      { 
        id: '1', 
        name: 'Admin Pipeline', 
        description: 'Admin pipeline for testing',
        userId: req.userId || '',
        numberOfFounders: 5,
        numberOfInvestors: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        id: '2', 
        name: 'Investor Pipeline', 
        description: 'Pipeline for investors',
        userId: req.userId || '',
        numberOfFounders: 3,
        numberOfInvestors: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        id: '3', 
        name: 'Founder Pipeline', 
        description: 'Pipeline for founders',
        userId: req.userId || '',
        numberOfFounders: 10,
        numberOfInvestors: 4,
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
        userId: req.userId || '',
        numberOfFounders: 2,
        numberOfInvestors: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }
});

app.get('/api/pipeline/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const pipelineId = req.params.id;
  const pipelineData: Pipeline = {
    id: pipelineId,
    name: pipelineId === '1' ? 'Admin Pipeline' : 
          pipelineId === '2' ? 'Investor Pipeline' : 
          pipelineId === '3' ? 'Founder Pipeline' : 'Demo Pipeline',
    description: pipelineId === '1' ? 'Admin pipeline for testing' : 
                pipelineId === '2' ? 'Pipeline for investors' : 
                pipelineId === '3' ? 'Pipeline for founders' : 'A demo pipeline for testing',
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
  
  res.status(200).json(pipelineData);
});

// Get forms for a pipeline
app.get('/api/pipeline/:id/form', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const pipelineId = req.params.id;
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
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/pipeline', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { pipelineName, description } = req.body;
  const newId = new Date().getTime().toString();
  
  res.status(201).json({
    id: newId,
    name: pipelineName || 'New Pipeline',
    description: description || 'A new pipeline',
    userId: req.userId || '',
    numberOfFounders: 0,
    numberOfInvestors: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
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
      _id: '2', 
      name: 'Investor Form', 
      description: 'Form for investors',
      submitterType: 'INVESTOR',
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

// Get forms by ID
app.get('/api/forms/:formId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const formId = req.params.formId;
  const form: FormDocument = formId === '1' ? {
    _id: '1',
    name: 'Founder Form',
    description: 'Form for founders',
    submitterType: 'FOUNDER',
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
  };
  
  res.status(200).json(form);
});

// Submission routes
app.get('/api/submissions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  // Return different data based on the user
  if (req.userId === 'admin123') {
    res.status(200).json([
      { 
        _id: '1', 
        formId: '1', 
        pipelineId: '1',
        submitterType: 'FOUNDER',
        data: { 
          name: 'John Doe', 
          email: 'john@example.com',
          industry: 'technology',
          stage: 'seed',
          linkedinUrl: 'https://www.linkedin.com/in/johndoe'
        },
        submittedAt: new Date().toISOString(),
        status: 'PROCESSED'
      },
      { 
        _id: '2', 
        formId: '2', 
        pipelineId: '1',
        submitterType: 'INVESTOR',
        data: { 
          name: 'Jane Smith', 
          email: 'jane@example.com',
          investmentFocus: ['technology', 'finance'],
          investmentStage: ['seed', 'series_a'],
          linkedinUrl: 'https://www.linkedin.com/in/janesmith'
        },
        submittedAt: new Date().toISOString(),
        status: 'PROCESSED'
      },
      { 
        _id: '3', 
        formId: '1', 
        pipelineId: '2',
        submitterType: 'FOUNDER',
        data: { 
          name: 'Bob Johnson', 
          email: 'bob@example.com',
          industry: 'healthcare',
          stage: 'prototype',
          linkedinUrl: 'https://www.linkedin.com/in/bobjohnson'
        },
        submittedAt: new Date().toISOString(),
        status: 'PROCESSED'
      },
      { 
        _id: '4', 
        formId: '2', 
        pipelineId: '2',
        submitterType: 'INVESTOR',
        data: { 
          name: 'Alice Brown', 
          email: 'alice@example.com',
          investmentFocus: ['healthcare', 'education'],
          investmentStage: ['prototype', 'seed'],
          linkedinUrl: 'https://www.linkedin.com/in/alicebrown'
        },
        submittedAt: new Date().toISOString(),
        status: 'PROCESSED'
      }
    ]);
  } else {
    res.status(200).json([
      { _id: '1', formId: '1', pipelineId: '1', submitterType: 'FOUNDER', data: { name: 'John Doe', email: 'john@example.com' }, submittedAt: new Date().toISOString(), status: 'PROCESSED' },
      { _id: '2', formId: '2', pipelineId: '1', submitterType: 'INVESTOR', data: { name: 'Jane Smith', email: 'jane@example.com' }, submittedAt: new Date().toISOString(), status: 'PROCESSED' }
    ]);
  }
});

// Get submissions for a form
app.get('/api/forms/:formId/submissions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const formId = req.params.formId;
  const submissions: SubmissionDocument[] = [];
  
  if (formId === '1') { // Founder form
    submissions.push(
      { 
        _id: '1', 
        formId: '1', 
        pipelineId: '1',
        submitterType: 'FOUNDER',
        data: { 
          name: 'John Doe', 
          email: 'john@example.com',
          industry: 'technology',
          stage: 'seed',
          linkedinUrl: 'https://www.linkedin.com/in/johndoe'
        },
        submittedAt: new Date().toISOString(),
        status: 'PROCESSED'
      },
      { 
        _id: '3', 
        formId: '1', 
        pipelineId: '2',
        submitterType: 'FOUNDER',
        data: { 
          name: 'Bob Johnson', 
          email: 'bob@example.com',
          industry: 'healthcare',
          stage: 'prototype',
          linkedinUrl: 'https://www.linkedin.com/in/bobjohnson'
        },
        submittedAt: new Date().toISOString(),
        status: 'PROCESSED'
      }
    );
  } else if (formId === '2') { // Investor form
    submissions.push(
      { 
        _id: '2', 
        formId: '2', 
        pipelineId: '1',
        submitterType: 'INVESTOR',
        data: { 
          name: 'Jane Smith', 
          email: 'jane@example.com',
          investmentFocus: ['technology', 'finance'],
          investmentStage: ['seed', 'series_a'],
          linkedinUrl: 'https://www.linkedin.com/in/janesmith'
        },
        submittedAt: new Date().toISOString(),
        status: 'PROCESSED'
      },
      { 
        _id: '4', 
        formId: '2', 
        pipelineId: '2',
        submitterType: 'INVESTOR',
        data: { 
          name: 'Alice Brown', 
          email: 'alice@example.com',
          investmentFocus: ['healthcare', 'education'],
          investmentStage: ['prototype', 'seed'],
          linkedinUrl: 'https://www.linkedin.com/in/alicebrown'
        },
        submittedAt: new Date().toISOString(),
        status: 'PROCESSED'
      }
    );
  }
  
  res.status(200).json({ data: submissions });
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
});

// Match criteria routes
app.get('/api/pipeline/:pipelineId/match-criteria', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    weights: {
      industry: 0.4,
      stage: 0.3,
      personality: 0.3
    }
  });
});

app.post('/api/pipeline/:pipelineId/match-criteria', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { weights } = req.body;
  res.status(200).json({
    weights
  });
});

// Industry families data
app.get('/api/industry-families', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json([
    {
      id: '1',
      name: 'Technology',
      industries: ['Software', 'Hardware', 'AI', 'Blockchain', 'IoT', 'Cloud Computing']
    },
    {
      id: '2',
      name: 'Finance',
      industries: ['Banking', 'Insurance', 'Investment', 'Fintech', 'Cryptocurrency']
    },
    {
      id: '3',
      name: 'Healthcare',
      industries: ['Biotech', 'Medical Devices', 'Pharmaceuticals', 'Healthcare IT', 'Telemedicine']
    },
    {
      id: '4',
      name: 'Education',
      industries: ['EdTech', 'Online Learning', 'K-12', 'Higher Education', 'Professional Development']
    }
  ]);
});

// Character traits data
app.get('/api/character-traits', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json([
    { id: '1', name: 'Analytical', description: 'Focuses on data and logical thinking' },
    { id: '2', name: 'Creative', description: 'Thinks outside the box and generates innovative ideas' },
    { id: '3', name: 'Risk-taker', description: 'Comfortable with uncertainty and taking chances' },
    { id: '4', name: 'Cautious', description: 'Careful and methodical in decision making' },
    { id: '5', name: 'Collaborative', description: 'Works well with others and values teamwork' },
    { id: '6', name: 'Independent', description: 'Self-reliant and autonomous in work style' }
  ]);
});

// Matches routes
app.get('/api/matches', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json([
    { id: '1', founderId: '1', investorId: '2', score: 0.85, status: 'pending' },
    { id: '2', founderId: '3', investorId: '4', score: 0.92, status: 'accepted' }
  ]);
});

// Get matches for a specific pipeline
app.get('/api/pipeline/:pipelineId/matches', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const pipelineId = req.params.pipelineId;
  
  // Generate some sample matches for the pipeline
  const matches = [];
  
  // Sample founder IDs for this pipeline
  const founderIds = ['1', '3', '5', '7', '9'];
  // Sample investor IDs for this pipeline
  const investorIds = ['2', '4', '6', '8', '10'];
  
  // Generate top matches for each founder
  const founderMatches = founderIds.map(founderId => {
    // For each founder, generate top 3 investor matches
    return investorIds.slice(0, 3).map((investorId, index) => {
      const score = 0.95 - (index * 0.05); // Decreasing scores for ranking
      return {
        id: `${founderId}-${investorId}`,
        founderId,
        investorId,
        score,
        status: index === 0 ? 'accepted' : (index === 1 ? 'pending' : 'contacted'),
        founderName: `Founder ${founderId}`,
        investorName: `Investor ${investorId}`,
        matchReason: `Strong match on ${index === 0 ? 'industry and stage' : (index === 1 ? 'personality and industry' : 'stage and funding needs')}`
      };
    });
  }).flat();
  
  // Generate top matches for each investor
  const investorMatches = investorIds.map(investorId => {
    // For each investor, generate top 3 founder matches
    return founderIds.slice(0, 3).map((founderId, index) => {
      const score = 0.95 - (index * 0.05); // Decreasing scores for ranking
      return {
        id: `${founderId}-${investorId}`,
        founderId,
        investorId,
        score,
        status: index === 0 ? 'accepted' : (index === 1 ? 'pending' : 'contacted'),
        founderName: `Founder ${founderId}`,
        investorName: `Investor ${investorId}`,
        matchReason: `Strong match on ${index === 0 ? 'industry and stage' : (index === 1 ? 'personality and industry' : 'stage and funding needs')}`
      };
    });
  }).flat();
  
  res.status(200).json({
    pipelineId,
    founderMatches,
    investorMatches
  });
});

// Get match details
app.get('/api/matches/details/:matchId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const matchId = req.params.matchId;
  
  // Sample match details with breakdown of matching scores
  const matchDetails: MatchDetails = {
    id: matchId,
    founderId: matchId === '1' ? '1' : '3',
    investorId: matchId === '1' ? '2' : '4',
    score: matchId === '1' ? 0.85 : 0.92,
    overallScore: matchId === '1' ? 0.85 : 0.92,
    status: matchId === '1' ? 'pending' : 'accepted',
    breakdown: {
      industry: {
        score: matchId === '1' ? 0.9 : 0.95,
        weight: 0.4,
        weightedScore: matchId === '1' ? 0.36 : 0.38,
        details: {
          founderIndustry: matchId === '1' ? 'technology' : 'healthcare',
          investorIndustries: matchId === '1' ? ['technology', 'finance'] : ['healthcare', 'education'],
          match: matchId === '1' ? 'Full match on technology' : 'Full match on healthcare'
        }
      },
      stage: {
        score: matchId === '1' ? 0.8 : 0.9,
        weight: 0.3,
        weightedScore: matchId === '1' ? 0.24 : 0.27,
        details: {
          founderStage: matchId === '1' ? 'seed' : 'prototype',
          investorStages: matchId === '1' ? ['seed', 'series_a'] : ['prototype', 'seed'],
          match: matchId === '1' ? 'Full match on seed stage' : 'Full match on prototype stage'
        }
      },
      personality: {
        score: matchId === '1' ? 0.83 : 0.9,
        weight: 0.3,
        weightedScore: matchId === '1' ? 0.25 : 0.27,
        details: {
          founderPersonality: {
            traits: matchId === '1' ? ['Analytical', 'Risk-taker'] : ['Creative', 'Collaborative'],
            linkedinAnalysis: 'Based on LinkedIn profile analysis'
          },
          investorPersonality: {
            traits: matchId === '1' ? ['Analytical', 'Cautious'] : ['Creative', 'Collaborative'],
            linkedinAnalysis: 'Based on LinkedIn profile analysis'
          },
          match: matchId === '1' ? 'Partial match on Analytical trait' : 'Full match on Creative and Collaborative traits'
        }
      }
    },
    founderInfo: {
      name: matchId === '1' ? 'John Doe' : 'Bob Johnson',
      email: matchId === '1' ? 'john@example.com' : 'bob@example.com',
      industry: matchId === '1' ? 'technology' : 'healthcare',
      stage: matchId === '1' ? 'seed' : 'prototype',
      linkedinUrl: matchId === '1' ? 'https://www.linkedin.com/in/johndoe' : 'https://www.linkedin.com/in/bobjohnson'
    },
    investorInfo: {
      name: matchId === '1' ? 'Jane Smith' : 'Alice Brown',
      email: matchId === '1' ? 'jane@example.com' : 'alice@example.com',
      investmentFocus: matchId === '1' ? ['technology', 'finance'] : ['healthcare', 'education'],
      investmentStage: matchId === '1' ? ['seed', 'series_a'] : ['prototype', 'seed'],
      linkedinUrl: matchId === '1' ? 'https://www.linkedin.com/in/janesmith' : 'https://www.linkedin.com/in/alicebrown'
    }
  };
  
  res.status(200).json(matchDetails);
});

// Update match status
app.patch('/api/matches/:matchId/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const matchId = req.params.matchId;
  const { status } = req.body;
  
  if (!status || !['pending', 'accepted', 'rejected', 'contacted'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  res.status(200).json({
    id: matchId,
    founderId: matchId === '1' ? '1' : '3',
    investorId: matchId === '1' ? '2' : '4',
    score: matchId === '1' ? 0.85 : 0.92,
    status: status
  });
});

// Recalculate matches
app.post('/api/matches/recalculate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { pipelineId } = req.body;
  
  if (!pipelineId) {
    return res.status(400).json({ error: 'Pipeline ID is required' });
  }
  
  // Simulate a recalculation process
  res.status(200).json({
    message: `Matches for pipeline ${pipelineId} are being recalculated`,
    status: 'processing',
    jobId: `recalc-${new Date().getTime()}`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Export the app for testing
export default app;
