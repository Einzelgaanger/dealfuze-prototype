# DealFuze Algorithm Implementation Documentation

## Overview
This document provides a comprehensive overview of the matching algorithm implementation for DealFuze, a platform that connects founders and investors based on various matching criteria including industry alignment, form responses, and personality assessments.

## Tech Stack
- **Backend**: NestJS (TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful architecture
- **Authentication**: JWT-based authentication
- **Testing**: Jest (unit tests) and Supertest (integration tests)
- **Deployment**: Docker containerization

## Build and Deployment

### Prerequisites
- Node.js (v22.14.0 or higher)
- MongoDB
- Docker (optional)

### Installation
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the development server
npm run dev

# Start the production server
npm start
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=4000
NODE_ENV=development
```

### Docker Deployment
```bash
# Build the Docker image
docker build -t dealfuze-algorithm .

# Run the container
docker run -p 4000:4000 dealfuze-algorithm
```

### Render Deployment
1. Connect your GitHub repository to Render
2. Configure the following settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: Add all required variables from `.env`

## System Architecture

### Core Components

#### 1. Submission Module
- **Location**: `server/src/submission/`
- **Key Files**:
  - `submission.schema.ts`: Defines the MongoDB schema for submissions
  - `submission.service.ts`: Handles submission business logic
  - `submission.controller.ts`: Manages HTTP endpoints for submissions
  - `submission.type.ts`: Contains TypeScript interfaces and types

#### 2. Match Module
- **Location**: `server/src/match/`
- **Key Files**:
  - `match.schema.ts`: Defines the match document structure
  - `match.service.ts`: Implements matching algorithm logic
  - `match.controller.ts`: Exposes matching endpoints
  - `familyMatch.ts`: Contains industry family matching logic

### Database Schema

#### Submission Schema
```typescript
{
  formId: ObjectId,
  type: 'founder' | 'investor',
  data: SubmissionDataType,
  submittedAt: Date,
  ipAddress?: string,
  userAgent?: string,
  name: string,
  email: string,
  linkedInProfileId?: ObjectId,
  status: SubmissionStatus
}
```

#### Match Schema
```typescript
{
  founderSubmission: ObjectId,
  investorSubmission: ObjectId,
  score: number,
  createdAt: Date
}
```

## Matching Algorithm Implementation

### 1. Industry Family Matching
The algorithm uses a sophisticated approach to match industries based on semantic similarity:

```typescript
class IndustryFamilyManager {
  private industryFamilies: Map<string, Set<string>>;

  addIndustry(industry: string, relatedIndustries: string[]) {
    // Groups similar industries into families
  }
}
```

### 2. Profile Matching Process
1. **Initial Data Collection**
   - Gather submissions from both founders and investors
   - Extract industry preferences and other matching criteria

2. **Industry Matching**
   - Group similar industries into families
   - Calculate industry alignment scores

3. **Form Response Matching**
   - Compare form responses between founders and investors
   - Weight different criteria based on importance

4. **Score Calculation**
   - Combine multiple factors:
     - Industry match score (40%)
     - Form response alignment (40%)
     - Personality match (20%)

### 3. Match Storage and Retrieval
- Matches are stored in the database with scores
- Cached for quick retrieval
- Updated periodically as new submissions come in

## API Endpoints

### Submission Endpoints
```
POST /api/submissions - Create new submission
GET /api/submissions - Get all submissions
GET /api/submissions/:id - Get specific submission
GET /api/submissions/type/:type - Get submissions by type
PUT /api/submissions/:id/status - Update submission status
DELETE /api/submissions - Delete submissions
GET /api/submissions/stats/:formId - Get submission statistics
```

### Match Endpoints
```
POST /api/matches/:submissionId/find - Find matches for a submission
GET /api/matches/:submissionId/stats - Get matching statistics
GET /api/matches/:submissionId/top - Get top matches
```

## Service Communication

### 1. Submission Flow
1. User submits form (`SubmissionController`)
2. Data validated and stored (`SubmissionService`)
3. Matching process triggered (`MatchService`)
4. Results stored in database

### 2. Matching Flow
1. New submission triggers matching
2. Industry families updated
3. Profile matcher runs comparison
4. Matches stored and scored
5. Results available via API

## Database Optimization

### Indexes
```typescript
// Submission indexes
SubmissionSchema.index({ formId: 1, submittedAt: -1 });
SubmissionSchema.index({ type: 1 });

// Match indexes
MatchSchema.index({ founderSubmission: 1, score: -1 });
MatchSchema.index({ investorSubmission: 1, score: -1 });
```

### Query Optimization
- Pagination implemented for large result sets
- Aggregation pipelines for statistics
- Caching for frequently accessed data

## Error Handling

### Global Error Handler
```typescript
app.use(errorHandler);
```

### Service-Level Error Handling
- Type-safe error handling with TypeScript
- Custom error classes for different scenarios
- Proper error propagation

## Security Measures

### 1. Authentication
- JWT-based authentication
- Route protection with guards
- Role-based access control

### 2. Data Validation
- Input validation using class-validator
- Sanitization of user inputs
- Type checking with TypeScript

## Testing

### Unit Tests
- Service layer testing
- Algorithm component testing
- Mocked database interactions

### Integration Tests
- API endpoint testing
- End-to-end flow testing
- Database integration testing

## Monitoring and Logging

### Logging Implementation
```typescript
app.use(pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      body: res.body,
    }),
  },
}));
```

## Future Improvements

1. **Algorithm Enhancements**
   - Machine learning integration
   - More sophisticated industry matching
   - Dynamic weight adjustment

2. **Performance Optimization**
   - Caching layer implementation
   - Query optimization
   - Batch processing

3. **Scalability**
   - Horizontal scaling
   - Load balancing
   - Message queues for async processing

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details

## Match Algorithm Implementation Updates

### Match Module Implementation

#### 1. Module Structure
A new Match Module has been implemented with the following components:
- **match.schema.ts**: Defines the match data model with status tracking
- **match.service.ts**: Core service to create, find and manage matches
- **match.controller.ts**: API endpoints for match operations
- **match-calculation.service.ts**: Dedicated service for match scoring algorithms
- **match.module.ts**: NestJS module configuration

#### 2. Match Schema
The Match schema includes important fields for tracking the relationship between founders and investors:
```typescript
export class Match {
  founderSubmissionId: string;        // ID of the founder submission
  investorSubmissionId: string;       // ID of the investor submission
  score: number;                      // Match score (0-100)
  status: MatchStatus;                // Status tracking (PENDING, VIEWED, ACCEPTED, REJECTED, ARCHIVED)
  viewedAt?: Date;                    // When the match was viewed
  acceptedAt?: Date;                  // When the match was accepted
  rejectedAt?: Date;                  // When the match was rejected
  rejectionReason?: RejectionReason;  // Why the match was rejected
  archivedAt?: Date;                  // When the match was archived
  matchDetails?: Record<string, any>; // Additional match details
  matchCriteria: MatchCriteria;       // Criteria that contributed to the match
  isHighPriority: boolean;            // Whether this is a high priority match
}
```

#### 3. Match Calculation Algorithm
The match calculation service implements an algorithm that evaluates:
- Industry match (30%): Based on industry preferences and related industries
- Stage match (25%): Company stage vs investor preferences
- Market size match (15%): Evaluates if market size meets investor minimum
- Investment range match (20%): Checks if funding needs align with investment ranges
- Location match (10%): Considers location preferences

The algorithm uses normalized scoring to produce a final match score between 0-100.

#### 4. API Endpoints
The Match Controller exposes several endpoints:
```
POST /matches - Create a new match
GET /matches - List matches with optional filters
GET /matches/:id - Get details for a specific match
GET /matches/founder/:founderSubmissionId - Get matches for a founder
GET /matches/investor/:investorSubmissionId - Get matches for an investor
PATCH /matches/:id/status - Update match status
POST /matches/batch/process - Process matches in batch
POST /matches/recalculate - Recalculate match scores
GET /matches/report/stats - Get match statistics
```

#### 5. Optimizations
The match implementation includes:
- Database indexes for efficient querying
- Status tracking with timestamps 
- Score ranges for categorizing matches
- Performance optimizations for batch processing

### Algorithm Improvements

The original match.ts file contains sophisticated matching algorithms:

1. **Basic Matching**: Simple field comparison for backward compatibility
2. **Optimized Matching**: Advanced vector-based approach with various matching techniques:
   - Exact matching for direct equality
   - Fuzzy matching using Levenshtein distance
   - Range matching for numeric values
   - Array intersection for multiple values
   - Semantic matching for text similarity

3. **Batch Matching**: Efficient processing of large datasets with:
   - Pre-filtering using critical fields
   - Lookup structures for faster matching
   - Threshold-based filtering

4. **High-Scale Processing**:
   - Caching for field lookups
   - Chunked processing to manage memory
   - Parallel processing where appropriate
   - Indexed lookups for performance

### Implementation Notes for Software Engineers

1. **TypeScript Model**: The Match module uses TypeScript for type safety across the application.

2. **NestJS Structure**: Follows NestJS recommended patterns with clear separation of:
   - Schema definitions (data models)
   - Service layer (business logic)
   - Controller layer (API endpoints)

3. **Mongoose Integration**: Uses Mongoose ODM with:
   - Schema decorators for MongoDB models
   - Indexes for query optimization
   - Query helpers for common operations

4. **Extensibility**: The implementation allows for:
   - Adding new match criteria
   - Adjusting scoring weights
   - Implementing new matching algorithms

## Deployment Troubleshooting

### Common TypeScript Errors

The build process may fail due to missing type declarations. If you encounter errors like `Cannot find module X or its corresponding type declarations`, ensure you have installed all required type definitions:

```bash
# Install core dependencies
npm install zod mongodb @nestjs/common @nestjs/mongoose mongoose @formio/core

# Install type definitions
npm install --save-dev @types/node @types/express @types/mongodb

# Add NestJS related packages
npm install @nestjs/core @nestjs/platform-express @nestjs/config
```

### Specific Dependencies for the Match Module

The matching algorithm requires these specific dependencies:

```bash
# Install dependencies for the match module
npm install country-state-city express-validator rxjs

# For authentication
npm install @clerk/express
```

### Render Deployment Issues

When deploying to Render, ensure:

1. The package.json scripts are correctly defined:
   ```json
   "scripts": {
     "build": "tsc",
     "start": "node dist/main.js",
     "dev": "ts-node-dev --respawn src/main.ts"
   }
   ```

2. Your environment variables are properly set in the Render dashboard:
   - MONGODB_URI
   - JWT_SECRET
   - NODE_ENV

3. If you see "Cannot find module" errors during build:
   - Check that all dependencies are listed in package.json
   - Make sure the build command includes installing dependencies: `npm install && npm run build`

### TypeScript Configuration

Ensure your tsconfig.json is properly configured for NestJS:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true
  }
}
```

### Fixing Type Errors in the Match Module

The match module may have type errors related to:

1. Duplicate function implementations in match.ts:
   - Rename one of the duplicate `match` functions to avoid conflicts
   - Use named exports to distinguish between different matching algorithms

2. Missing Model generic types:
   - Update mongoose Model imports to include proper generic types
   - Example: `Model<MatchDocument>` should include all required type parameters

3. Match calculation type mismatches:
   - Ensure MatchCriteria interface properties match between schema and calculation service
   - Fix type errors where boolean values are assigned to number properties
