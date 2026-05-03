export {
  env,
  validateEnvironment,
  type SupabaseConfig,
  type MyFatoorahConfig,
  type GeminiConfig,
  type AppConfig,
  type ApiConfig,
} from '../config/env';

type EnvVar = {
  name: string;
  required: boolean;
  description: string;
  example: string;
};

const ENV_VARS: EnvVar[] = [
  {
    name: 'VITE_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    example: 'https://your-project-ref.supabase.co',
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous/public key (safe to expose)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
  {
    name: 'VITE_MYFATOORAH_API_KEY',
    required: false,
    description: 'MyFatoorah API key for payment processing',
    example: 'your-api-key',
  },
  {
    name: 'VITE_MYFATOORAH_BASE_URL',
    required: false,
    description: 'MyFatoorah API base URL (test or production)',
    example: 'https://apitest.myfatoorah.com',
  },
  {
    name: 'GEMINI_API_KEY',
    required: false,
    description: 'Gemini AI API key for AI features',
    example: 'your-gemini-api-key',
  },
  {
    name: 'APP_URL',
    required: false,
    description: 'Application base URL for callbacks',
    example: 'http://localhost:3000',
  },
];

export {ENV_VARS};
