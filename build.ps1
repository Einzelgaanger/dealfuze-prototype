# Install dependencies
Write-Host "Installing dependencies..."
npm install --save @nestjs/common @nestjs/mongoose @nestjs/config mongoose express express-validator cors helmet dotenv pino pino-http node-cron mongodb zod @clerk/express rxjs @formio/core country-state-city openai

# Install dev dependencies
Write-Host "Installing dev dependencies..."
npm install --save-dev @types/node @types/mongoose @types/express @types/express-validator @types/cors @types/helmet @types/dotenv @types/pino @types/pino-http @types/node-cron @types/mongodb tsconfig-paths

# Fix any issues with the build
Write-Host "Fixing build issues..."
cd server

# Create or update tsconfig.json if needed
if (-not (Test-Path tsconfig.json)) {
    @"
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
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["src/*"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
"@ | Out-File -FilePath tsconfig.json -Encoding utf8
}

# Create directory structure for types
New-Item -ItemType Directory -Force -Path src/types

# Create mongoose.types.ts
@"
import { Document, Model, Schema, Types } from 'mongoose';

declare module 'mongoose' {
  interface Query<ResultType, DocType extends Document> {
    exec(): Promise<ResultType>;
    sort(arg: any): this;
    limit(n: number): this;
    skip(n: number): this;
    lean(): this;
    select(arg: any): this;
  }

  interface DeleteResult {
    deletedCount?: number;
  }

  interface UpdateResult {
    nModified: number;
  }

  interface Aggregate<R> {
    exec(): Promise<R>;
  }
}

export interface ExtendedModel<T extends Document> {
  aggregate(pipeline: any[]): Promise<any[]>;
  bulkWrite(operations: any[]): Promise<any>;
  insertMany(docs: any[]): Promise<T[]>;
}
"@ | Out-File -FilePath src/types/mongoose.types.ts -Encoding utf8

# Run the build
Write-Host "Building the project..."
npm run build

# Run the fixbuild script
Write-Host "Running fixbuild script..."
node fixbuild.js 