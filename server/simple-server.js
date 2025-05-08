const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.get('/api/pipeline', authMiddleware, (req, res) => {
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

app.get('/api/pipeline/:id', authMiddleware, (req, res) => {
  const pipelineId = req.params.id;
  const pipelineData = {
    id: pipelineId,
    name: pipelineId === '1' ? 'Admin Pipeline' : 
          pipelineId === '2' ? 'Investor Pipeline' : 
          pipelineId === '3' ? 'Founder Pipeline' : 'Demo Pipeline',
    description: pipelineId === '1' ? 'Admin pipeline for testing' : 
                pipelineId === '2' ? 'Pipeline for investors' : 
                pipelineId === '3' ? 'Pipeline for founders' : 'A demo pipeline for testing',
    userId: req.userId,
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
app.get('/api/pipeline/:id/form', authMiddleware, (req, res) => {
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

app.post('/api/pipeline', authMiddleware, (req, res) => {
  const { pipelineName, description } = req.body;
  const newId = new Date().getTime().toString();
  res.status(201).json({
    id: newId,
    name: pipelineName || 'New Pipeline',
    description: description || 'New pipeline description',
    userId: req.userId,
    numberOfFounders: 0,
    numberOfInvestors: 0
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
app.get('/api/forms/:formId', authMiddleware, (req, res) => {
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

// Match criteria routes
app.get('/api/pipeline/:pipelineId/match-criteria', authMiddleware, (req, res) => {
  res.status(200).json({
    weights: {
      industry: 0.4,
      stage: 0.3,
      personality: 0.3
    }
  });
});

app.post('/api/pipeline/:pipelineId/match-criteria', authMiddleware, (req, res) => {
  const { weights } = req.body;
  res.status(200).json({
    weights
  });
});

// Industry families data
app.get('/api/industry-families', authMiddleware, (req, res) => {
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
app.get('/api/character-traits', authMiddleware, (req, res) => {
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
app.get('/api/matches', authMiddleware, (req, res) => {
  res.status(200).json([
    { id: '1', founderId: '1', investorId: '2', score: 0.85, status: 'pending' },
    { id: '2', founderId: '3', investorId: '4', score: 0.92, status: 'accepted' }
  ]);
});

// Get matches for a specific pipeline
app.get('/api/pipeline/:pipelineId/matches', authMiddleware, (req, res) => {
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
app.get('/api/matches/details/:matchId', authMiddleware, (req, res) => {
  const matchId = req.params.matchId;
  
  // Sample match details with breakdown of matching scores
  const matchDetails = {
    id: matchId,
    founderId: matchId === '1' ? '1' : '3',
    investorId: matchId === '1' ? '2' : '4',
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
app.patch('/api/matches/:matchId/status', authMiddleware, (req, res) => {
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
app.post('/api/matches/recalculate', authMiddleware, (req, res) => {
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

// Submission routes
app.get('/api/submissions', authMiddleware, (req, res) => {
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
app.get('/api/forms/:formId/submissions', authMiddleware, (req, res) => {
  const formId = req.params.formId;
  const submissions = [];
  
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

// Personality routes
app.get('/api/personality/:submissionId', authMiddleware, (req, res) => {
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

// Form submission routes
app.post('/api/forms/:formId/submit', (req, res) => {
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
app.post('/api/submissions/:submissionId/retry', authMiddleware, (req, res) => {
  const submissionId = req.params.submissionId;
  
  res.status(200).json({
    _id: submissionId,
    status: 'PROCESSING',
    message: 'Submission processing restarted',
    processingStartedAt: new Date().toISOString()
  });
});

// Industry family routes for matching algorithm
app.get('/api/industry-families', authMiddleware, (req, res) => {
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
app.get('/api/character-traits', authMiddleware, (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Simple API server running on port ${PORT}`);
});
