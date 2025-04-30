#!/bin/bash

# Fix any issues with the build
echo "Fixing build issues..."
cd server

# Create or update tsconfig.json if needed
if [ ! -f tsconfig.json ]; then
    cat > tsconfig.json << 'EOL'
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
EOL
fi

# Create directory structure for types
mkdir -p src/types

# Create mongoose.types.ts
cat > src/types/mongoose.types.ts << 'EOL'
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
EOL

# Run the fixbuild script
echo "Running fixbuild script..."
node ../fixbuild.js

# Build the project
echo "Building project..."
npm run build

# Start the application
echo "Starting application..."
npm start 