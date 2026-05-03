import {AxiosError} from 'axios';
import {api as apiClient} from './api/client';

export const api = apiClient;

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as AxiosError<{message?: string; error?: {message?: string}}>;
    return (
      axiosError.response?.data?.error?.message ||
      axiosError.response?.data?.message ||
      'An unexpected error occurred'
    );
  }
  return 'An unexpected error occurred';
}
