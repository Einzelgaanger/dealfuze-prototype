#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install --save @nestjs/common @nestjs/mongoose @nestjs/config mongoose express express-validator cors helmet dotenv pino pino-http node-cron mongodb zod @clerk/express rxjs @formio/core country-state-city openai

# Install dev dependencies
echo "Installing dev dependencies..."
npm install --save-dev @types/node @types/mongoose @types/express @types/express-validator @types/cors @types/helmet @types/dotenv @types/pino @types/pino-http @types/node-cron @types/mongodb tsconfig-paths

# Fix any issues with the build
echo "Fixing build issues..."
cd server

# Create or update tsconfig.json if needed
if [ ! -f tsconfig.json ]; then
  cat > tsconfig.json << EOL
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
cat > src/types/mongoose.types.ts << EOL
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

# Create formio.d.ts
cat > src/types/formio.d.ts << EOL
declare module '@formio/core' {
  export class Component {
    // Basic component properties
    key: string;
    label: string;
    type: string;
    input: boolean;
    validate: any;
    defaultValue?: any;
  }

  export class TextFieldComponent extends Component {
    placeholder?: string;
    prefix?: string;
    suffix?: string;
    inputMask?: string;
    allowMultipleMasks?: boolean;
  }

  export class SelectComponent extends Component {
    data: {
      values: Array<{ label: string; value: string }>;
    };
    dataSrc: string;
    valueProperty: string;
    multiple?: boolean;
    placeholder?: string;
  }

  export class ButtonComponent extends Component {
    action: string;
    theme: string;
    size: string;
    block: boolean;
  }

  export class CheckboxComponent extends Component {
    value: boolean;
  }

  export class NumberComponent extends Component {
    min?: number;
    max?: number;
    step?: number;
  }

  export class DayComponent extends Component {
    fields: {
      day: { hide?: boolean };
      month: { hide?: boolean };
      year: { hide?: boolean };
    };
  }

  export class EmailComponent extends Component {
    placeholder?: string;
    prefix?: string;
    suffix?: string;
  }

  export class FileComponent extends Component {
    filePattern?: string;
    fileMaxSize?: number;
  }

  export class PhoneNumberComponent extends Component {
    placeholder?: string;
    inputMask?: string;
  }

  export class RadioComponent extends Component {
    values: Array<{ label: string; value: string }>;
    inline?: boolean;
  }

  export class SelectBoxesComponent extends Component {
    values: Array<{ label: string; value: string }>;
    inline?: boolean;
  }

  export class TextAreaComponent extends Component {
    placeholder?: string;
    rows?: number;
    wysiwyg?: boolean;
  }

  export class UrlComponent extends Component {
    placeholder?: string;
  }
  
  export interface FormSettings {
    components: Component[];
    title?: string;
    display?: string;
    type?: string;
    name?: string;
    path?: string;
  }
}
EOL

# Create country-state-city.d.ts
cat > src/types/country-state-city.d.ts << EOL
declare module 'country-state-city' {
  export interface ICountry {
    name: string;
    isoCode: string;
    phonecode: string;
    flag: string;
    currency: string;
    latitude: string;
    longitude: string;
    timezones: any[];
  }

  export interface IState {
    name: string;
    isoCode: string;
    countryCode: string;
    latitude: string;
    longitude: string;
  }

  export interface ICity {
    name: string;
    countryCode: string;
    stateCode: string;
    latitude: string;
    longitude: string;
  }

  export const Country: {
    getAllCountries(): ICountry[];
    getCountryByCode(code: string): ICountry;
  };

  export const State: {
    getAllStates(): IState[];
    getStatesOfCountry(countryCode: string): IState[];
    getStateByCodeAndCountry(stateCode: string, countryCode: string): IState;
  };

  export const City: {
    getAllCities(): ICity[];
    getCitiesOfState(countryCode: string, stateCode: string): ICity[];
    getCitiesOfCountry(countryCode: string): ICity[];
  };
}
EOL

echo "Build script completed successfully!" 