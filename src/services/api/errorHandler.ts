import {api, handleApiError} from '../api';
import type {ApiResponse, ApiError} from '@/types';

interface ErrorLog {
  timestamp: string;
  error: Error;
  context?: Record<string, unknown> | undefined;
}

const errorLogs: ErrorLog[] = [];

export function logError(error: Error, context?: Record<string, unknown>) {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    error,
    context: context ?? undefined,
  };
  errorLogs.push(errorLog);

  if (import.meta.env.PROD) {
    console.error('Error logged:', errorLog);
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as {response?: {status?: number}}).response?.status;
        if (status && status >= 400 && status < 500) {
          throw error;
        }
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export {api, handleApiError};
export type {ApiResponse, ApiError};
