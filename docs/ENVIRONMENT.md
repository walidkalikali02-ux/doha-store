# Environment Variables Documentation

This document covers all required and optional environment variables for the Roastery E-commerce application.

## Quick Setup

1. Copy `.env.example` to `.env.local` for development
2. Fill in all required values
3. Never commit `.env.local` or `.env.production` to git

## Required Variables

### Supabase Configuration

| Variable                 | Description                           | Where to Get                                                                    |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL             | [Supabase Dashboard](https://app.supabase.com) → Project → Settings → API → URL |
| `VITE_SUPABASE_ANON_KEY` | Anonymous/public key (safe to expose) | Supabase Dashboard → Project → Settings → API → anon/public key                 |

### MyFatoorah Configuration (Required for Payments)

| Variable                   | Description                    | Where to Get                                                                       |
| -------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| `VITE_MYFATOORAH_API_KEY`  | API key for payment processing | [MyFatoorah Dashboard](https://myfatoorah.com)                                     |
| `VITE_MYFATOORAH_BASE_URL` | API endpoint URL               | Test: `https://apitest.myfatoorah.com`<br>Production: `https://api.myfatoorah.com` |

## Optional Variables

### Gemini AI

| Variable         | Description             | Where to Get                               |
| ---------------- | ----------------------- | ------------------------------------------ |
| `GEMINI_API_KEY` | API key for AI features | [Google AI Studio](https://ai.google.dev/) |

### Application

| Variable  | Description                      | Default                 |
| --------- | -------------------------------- | ----------------------- |
| `APP_URL` | Base URL for callbacks and links | `http://localhost:3000` |

## Environment Files

| File              | Purpose                     | Git Status        |
| ----------------- | --------------------------- | ----------------- |
| `.env.example`    | Template with all variables | Tracked in git    |
| `.env.local`      | Local development secrets   | **Never tracked** |
| `.env.production` | Production secrets          | **Never tracked** |

## Security Best Practices

1. **Never commit secrets to git**
   - `.gitignore` excludes all `.env*` files except `.env.example`

2. **Use different keys per environment**
   - Test API keys for development
   - Production keys only in production environment

3. **Rotate keys regularly**
   - Change API keys if suspected to be compromised

4. **Limit key permissions**
   - Use anon/public keys in frontend (never service_role keys)
   - Use RLS policies in Supabase for security

## Validation

The application validates environment variables on startup using `src/lib/env.ts`.

### Check Your Configuration

```typescript
import {envValidation, logEnvStatus} from './lib/env';

// Check if all required vars are set
if (!envValidation.valid) {
  console.error('Environment errors:', envValidation.errors);
}

// Log full status
logEnvStatus();
```

## Troubleshooting

### "Missing Supabase environment variables"

- Ensure `.env.local` exists and contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after adding environment variables

### "Unable to reach Supabase"

- Check your internet connection
- Verify `VITE_SUPABASE_URL` is correct (must include `https://`)
- Check DNS/VPN settings

### "Payment initialization failed"

- Verify MyFatoorah API key is correct
- Ensure you're using test URLs for development
- Check MyFatoorah dashboard for API status
