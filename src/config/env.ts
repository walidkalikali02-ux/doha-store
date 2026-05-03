interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface MyFatoorahConfig {
  apiKey: string;
  baseUrl: string;
}

interface GeminiConfig {
  apiKey: string;
}

interface AppConfig {
  url: string;
}

interface ApiConfig {
  baseUrl: string;
}

class Environment {
  private static instance: Environment;
  private _supabase: SupabaseConfig | null = null;
  private _myfatoorah: MyFatoorahConfig | null = null;
  private _gemini: GeminiConfig | null = null;
  private _app: AppConfig | null = null;
  private _api: ApiConfig | null = null;
  private _errors: string[] = [];
  private _warnings: string[] = [];

  private constructor() {
    this.load();
  }

  static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  private getEnv(key: string): string | undefined {
    return import.meta.env[key];
  }

  private load(): void {
    this.loadSupabase();
    this.loadMyFatoorah();
    this.loadGemini();
    this.loadApp();
    this.loadApi();
  }

  private loadSupabase(): void {
    const url = this.getEnv('VITE_SUPABASE_URL');
    const anonKey = this.getEnv('VITE_SUPABASE_ANON_KEY');

    if (!url || !anonKey) {
      this._errors.push(
        'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
      );
      return;
    }

    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'https:') {
        this._errors.push('VITE_SUPABASE_URL must use HTTPS');
        return;
      }
    } catch {
      this._errors.push('VITE_SUPABASE_URL is not a valid URL');
      return;
    }

    this._supabase = {url, anonKey};
  }

  private loadMyFatoorah(): void {
    const apiKey = this.getEnv('VITE_MYFATOORAH_API_KEY');
    const baseUrl = this.getEnv('VITE_MYFATOORAH_BASE_URL');

    if (!apiKey || !baseUrl) {
      this._warnings.push(
        'MyFatoorah configuration missing. Payments may not work. Set VITE_MYFATOORAH_API_KEY and VITE_MYFATOORAH_BASE_URL'
      );
      return;
    }

    this._myfatoorah = {apiKey, baseUrl};
  }

  private loadGemini(): void {
    const apiKey = this.getEnv('GEMINI_API_KEY');

    if (!apiKey) {
      this._warnings.push('Gemini API key not set. AI features may be limited.');
      return;
    }

    this._gemini = {apiKey};
  }

  private loadApp(): void {
    const url = this.getEnv('APP_URL') || 'http://localhost:3000';
    this._app = {url};
  }

  private loadApi(): void {
    const baseUrl = this.getEnv('VITE_API_URL') || '/api';
    this._api = {baseUrl};
  }

  validate(): {valid: boolean; errors: string[]; warnings: string[]} {
    return {
      valid: this._errors.length === 0,
      errors: [...this._errors],
      warnings: [...this._warnings],
    };
  }

  get supabase(): SupabaseConfig {
    if (!this._supabase) {
      throw new Error(
        'Supabase configuration not available. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
      );
    }
    return this._supabase;
  }

  get myfatoorah(): MyFatoorahConfig {
    if (!this._myfatoorah) {
      throw new Error(
        'MyFatoorah configuration not available. Check VITE_MYFATOORAH_API_KEY and VITE_MYFATOORAH_BASE_URL'
      );
    }
    return this._myfatoorah;
  }

  get gemini(): GeminiConfig | null {
    return this._gemini;
  }

  get app(): AppConfig {
    return this._app!;
  }

  get api(): ApiConfig {
    return this._api!;
  }

  get isProduction(): boolean {
    return import.meta.env.PROD;
  }

  get isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  get mode(): string {
    return import.meta.env.MODE;
  }
}

function loadConfig(): Environment {
  return Environment.getInstance();
}

export const env = loadConfig();

export function validateEnvironment(): void {
  const {valid, errors, warnings} = env.validate();

  if (!valid) {
    console.error('❌ Environment Validation Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Missing required environment variables. Check console for details.');
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment Warnings:');
    warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  if (valid && warnings.length === 0) {
    console.log('✅ All environment variables configured correctly');
  }
}

export type {SupabaseConfig, MyFatoorahConfig, GeminiConfig, AppConfig, ApiConfig};
