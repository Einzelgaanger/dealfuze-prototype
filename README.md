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
