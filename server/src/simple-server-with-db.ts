import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './db/connection';
import { Pipeline, Form, Submission, Match } from './db/models';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Define interfaces for request with user
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Define middleware for authentication
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // For development purposes, we'll use a simple token-based authentication
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  // In a real app, you would verify the token with Clerk or another auth provider
  // For now, we'll just set a mock user ID and role
  req.userId = 'user123';
  req.userRole = 'user';
  
  // If token is admin token, set admin role
  if (token === 'admin-token') {
    req.userId = 'admin123';
    req.userRole = 'admin';
  }
  
  next();
};

// Create Express app
const app = express();
const PORT = process.env.PORT || 9876;

// Middleware
app.use(express.json());

// Configure CORS
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://dealfuze.app']) 
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true
}));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
connectToDatabase().catch(console.error);

// API Routes

// Get all pipelines
app.get('/api/pipeline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let pipelines;
    
    if (req.userRole === 'admin') {
      // Admin can see all pipelines
      pipelines = await Pipeline.find().sort({ createdAt: -1 });
    } else {
      // Regular users can only see pipelines they created or active ones
      pipelines = await Pipeline.find({
        $or: [
          { createdBy: req.userId },
          { status: 'active' }
        ]
      }).sort({ createdAt: -1 });
    }
    
    res.status(200).json(pipelines);
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

// Create a new pipeline
app.post('/api/pipeline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const newPipeline = new Pipeline({
      name,
      description,
      status: 'active',
      createdBy: req.userId
    });
    
    await newPipeline.save();
    
    // Create default forms for founder and investor
    const founderForm = new Form({
      title: 'Founder Information',
      description: 'Please provide information about your startup',
      pipelineId: newPipeline._id,
      type: 'founder',
      fields: [
        {
          id: 'companyName',
          label: 'Company Name',
          type: 'text',
          required: true
        },
        {
          id: 'industry',
          label: 'Industry',
          type: 'select',
          required: true,
          options: ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'Other']
        },
        {
          id: 'stage',
          label: 'Company Stage',
          type: 'select',
          required: true,
          options: ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+']
        },
        {
          id: 'fundingAmount',
          label: 'Funding Amount Needed',
          type: 'number',
          required: true
        },
        {
          id: 'pitch',
          label: 'Elevator Pitch',
          type: 'textarea',
          required: true
        }
      ]
    });
    
    const investorForm = new Form({
      title: 'Investor Information',
      description: 'Please provide information about your investment preferences',
      pipelineId: newPipeline._id,
      type: 'investor',
      fields: [
        {
          id: 'firmName',
          label: 'Firm Name',
          type: 'text',
          required: true
        },
        {
          id: 'investmentStage',
          label: 'Investment Stage Preference',
          type: 'select',
          required: true,
          options: ['Pre-seed', 'Seed', 'Series A', 'Series B+', 'All Stages']
        },
        {
          id: 'industryFocus',
          label: 'Industry Focus',
          type: 'select',
          required: true,
          options: ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'Other']
        },
        {
          id: 'minInvestment',
          label: 'Minimum Investment Amount',
          type: 'number',
          required: true
        },
        {
          id: 'maxInvestment',
          label: 'Maximum Investment Amount',
          type: 'number',
          required: true
        }
      ]
    });
    
    await founderForm.save();
    await investorForm.save();
    
    res.status(201).json(newPipeline);
  } catch (error) {
    console.error('Error creating pipeline:', error);
    res.status(500).json({ error: 'Failed to create pipeline' });
  }
});

// Get a specific pipeline
app.get('/api/pipeline/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pipelineId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(pipelineId)) {
      return res.status(400).json({ error: 'Invalid pipeline ID' });
    }
    
    const pipeline = await Pipeline.findById(pipelineId);
    
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    
    // Check if user has access to this pipeline
    if (req.userRole !== 'admin' && pipeline.createdBy !== req.userId && pipeline.status !== 'active') {
      return res.status(403).json({ error: 'You do not have access to this pipeline' });
    }
    
    res.status(200).json(pipeline);
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// Get forms for a specific pipeline
app.get('/api/pipeline/:id/form', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pipelineId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(pipelineId)) {
      return res.status(400).json({ error: 'Invalid pipeline ID' });
    }
    
    const forms = await Form.find({ pipelineId });
    
    if (!forms || forms.length === 0) {
      return res.status(404).json({ error: 'No forms found for this pipeline' });
    }
    
    res.status(200).json({ data: forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get a specific form
app.get('/api/forms/:formId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const formId = req.params.formId;
    
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.status(200).json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Submit a form
app.post('/api/forms/:formId/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const formId = req.params.formId;
    const { data, pipelineId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(formId) || !mongoose.Types.ObjectId.isValid(pipelineId)) {
      return res.status(400).json({ error: 'Invalid form ID or pipeline ID' });
    }
    
    if (!data) {
      return res.status(400).json({ error: 'Form data is required' });
    }
    
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Create new submission
    const submission = new Submission({
      formId,
      pipelineId,
      userId: req.userId,
      data,
      type: form.type,
      status: 'pending'
    });
    
    await submission.save();
    
    // If this is a founder submission, find potential investor matches
    if (form.type === 'founder') {
      const investorSubmissions = await Submission.find({
        pipelineId,
        type: 'investor',
        status: 'pending'
      });
      
      // Create matches with investors
      for (const investorSubmission of investorSubmissions) {
        // Calculate a simple match score (in a real app, this would be more sophisticated)
        const score = Math.floor(Math.random() * 100);
        
        const match = new Match({
          pipelineId,
          founderSubmissionId: submission._id,
          investorSubmissionId: investorSubmission._id,
          score,
          status: 'pending'
        });
        
        await match.save();
      }
    }
    
    // If this is an investor submission, find potential founder matches
    if (form.type === 'investor') {
      const founderSubmissions = await Submission.find({
        pipelineId,
        type: 'founder',
        status: 'pending'
      });
      
      // Create matches with founders
      for (const founderSubmission of founderSubmissions) {
        // Calculate a simple match score (in a real app, this would be more sophisticated)
        const score = Math.floor(Math.random() * 100);
        
        const match = new Match({
          pipelineId,
          founderSubmissionId: founderSubmission._id,
          investorSubmissionId: submission._id,
          score,
          status: 'pending'
        });
        
        await match.save();
      }
    }
    
    res.status(201).json({ success: true, submissionId: submission._id });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Get all submissions for a pipeline
app.get('/api/pipeline/:id/submissions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pipelineId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(pipelineId)) {
      return res.status(400).json({ error: 'Invalid pipeline ID' });
    }
    
    // Check if user has access to this pipeline
    const pipeline = await Pipeline.findById(pipelineId);
    
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    
    if (req.userRole !== 'admin' && pipeline.createdBy !== req.userId) {
      return res.status(403).json({ error: 'You do not have access to this pipeline' });
    }
    
    const submissions = await Submission.find({ pipelineId }).sort({ createdAt: -1 });
    
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get all matches for a pipeline
app.get('/api/pipeline/:id/matches', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pipelineId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(pipelineId)) {
      return res.status(400).json({ error: 'Invalid pipeline ID' });
    }
    
    // Check if user has access to this pipeline
    const pipeline = await Pipeline.findById(pipelineId);
    
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    
    if (req.userRole !== 'admin' && pipeline.createdBy !== req.userId) {
      return res.status(403).json({ error: 'You do not have access to this pipeline' });
    }
    
    const matches = await Match.find({ pipelineId })
      .sort({ score: -1 })
      .populate('founderSubmissionId')
      .populate('investorSubmissionId');
    
    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get user's submissions
app.get('/api/submissions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await Submission.find({ userId: req.userId }).sort({ createdAt: -1 });
    
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ error: 'Failed to fetch user submissions' });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all route for 404 errors
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
