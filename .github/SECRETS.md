# GitHub Secrets Setup

This document describes the required GitHub Secrets for CI/CD.

## Required Secrets

### Supabase Secrets

| Secret Name              | Description            | How to Get                                  |
| ------------------------ | ---------------------- | ------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL   | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Project Settings → API |

### MyFatoorah Secrets

| Secret Name                | Description        | How to Get                                |
| -------------------------- | ------------------ | ----------------------------------------- |
| `VITE_MYFATOORAH_API_KEY`  | MyFatoorah API key | MyFatoorah Dashboard                      |
| `VITE_MYFATOORAH_BASE_URL` | MyFatoorah API URL | `https://api.myfatoorah.com` (production) |

### Optional Secrets

| Secret Name      | Description        | How to Get                                 |
| ---------------- | ------------------ | ------------------------------------------ |
| `GEMINI_API_KEY` | Gemini AI API key  | [Google AI Studio](https://ai.google.dev/) |
| `APP_URL`        | Production app URL | Your production domain                     |

### Deployment Secrets

| Secret Name          | Description            | Required For       |
| -------------------- | ---------------------- | ------------------ |
| `VERCEL_TOKEN`       | Vercel API token       | Vercel deployment  |
| `VERCEL_ORG_ID`      | Vercel organization ID | Vercel deployment  |
| `VERCEL_PROJECT_ID`  | Vercel project ID      | Vercel deployment  |
| `NETLIFY_AUTH_TOKEN` | Netlify auth token     | Netlify deployment |
| `NETLIFY_SITE_ID`    | Netlify site ID        | Netlify deployment |

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name shown above

## Environment-Specific Secrets

For staging/production environments:

1. Go to **Settings** → **Environments**
2. Create environments: `staging` and `production`
3. Add environment-specific secrets to each environment

## Security Best Practices

1. **Never commit secrets to the repository**
2. Use different secrets for different environments
3. Rotate secrets regularly
4. Limit secret access to specific workflows
5. Use environment protection rules for production

## Testing Secrets

To verify secrets are set correctly:

```yaml
# Add to workflow for testing
- name: Verify secrets exist
  run: |
    test -n "${{ secrets.VITE_SUPABASE_URL }}" || echo "VITE_SUPABASE_URL is missing"
```
