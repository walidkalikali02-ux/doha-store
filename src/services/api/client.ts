import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  retryStatusCodes?: number[];
}

interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: unknown | undefined;
}

interface ResponseLog {
  timestamp: string;
  status: number;
  statusText: string;
  data?: unknown | undefined;
}

interface ErrorLog {
  timestamp: string;
  error: string;
  stack?: string | undefined;
  request?: RequestLog | undefined;
  response?: ResponseLog | undefined;
}

interface EnhancedError extends Error {
  status?: number | undefined;
  code?: string | undefined;
}

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

class ApiClient {
  private instance: AxiosInstance;
  private config: Required<ApiClientConfig>;
  private requestLogs: RequestLog[] = [];
  private responseLogs: ResponseLog[] = [];
  private errorLogs: ErrorLog[] = [];
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(config: ApiClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      retryDelay: config.retryDelay ?? DEFAULT_RETRY_DELAY,
      retryStatusCodes: config.retryStatusCodes ?? DEFAULT_RETRY_STATUS_CODES,
    };

    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => this.handleRequest(config),
      (error: AxiosError) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => this.handleResponse(response),
      (error: AxiosError) => this.handleError(error)
    );
  }

  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      this.logRequest(config);
    }

    return config;
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    if (import.meta.env.DEV) {
      this.logResponse(response);
    }
    return response;
  }

  private async handleError(error: AxiosError): Promise<unknown> {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (import.meta.env.DEV) {
      this.logError(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      return this.handleAuthError(originalRequest);
    }

    if (originalRequest._retryCount && originalRequest._retryCount < this.config.maxRetries) {
      return this.retryRequest(originalRequest);
    }

    if (
      this.shouldRetry(error) &&
      (!originalRequest._retryCount || originalRequest._retryCount < this.config.maxRetries)
    ) {
      return this.retryRequest(originalRequest);
    }

    return Promise.reject(this.normalizeError(error));
  }

  private async handleAuthError(
    originalRequest: AxiosRequestConfig & {_retry?: boolean; _retryCount?: number}
  ): Promise<unknown> {
    originalRequest._retry = true;

    if (this.isRefreshing) {
      return new Promise(resolve => {
        this.refreshSubscribers.push((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(this.instance(originalRequest));
        });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshToken();
      this.isRefreshing = false;
      this.refreshSubscribers.forEach(callback => callback(newToken));
      this.refreshSubscribers = [];

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return this.instance(originalRequest);
    } catch (refreshError) {
      this.isRefreshing = false;
      this.refreshSubscribers = [];
      this.handleAuthFailure();
      return Promise.reject(refreshError);
    }
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${this.config.baseURL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const {access_token} = response.data.data;
    localStorage.setItem('access_token', access_token);
    return access_token;
  }

  private handleAuthFailure(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) return true;
    return this.config.retryStatusCodes.includes(error.response.status);
  }

  private async retryRequest(
    originalRequest: AxiosRequestConfig & {_retryCount?: number}
  ): Promise<unknown> {
    originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
    const delay = this.config.retryDelay * Math.pow(2, originalRequest._retryCount - 1);

    await new Promise(resolve => setTimeout(resolve, delay));
    return this.instance(originalRequest);
  }

  private normalizeError(error: AxiosError): EnhancedError {
    const message = this.extractErrorMessage(error);
    const enhancedError: EnhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.code = error.code;
    return enhancedError;
  }

  private extractErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as {
        message?: string;
        error?: {message?: string};
        details?: string;
      };
      return (
        data.error?.message ||
        data.message ||
        data.details ||
        this.getStatusMessage(error.response?.status)
      );
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }

    return error.message || 'An unexpected error occurred.';
  }

  private getStatusMessage(status?: number): string {
    const messages: Record<number, string> = {
      400: 'Bad request. Please check your input.',
      401: 'Authentication required. Please log in.',
      403: 'Access denied. You do not have permission.',
      404: 'Resource not found.',
      408: 'Request timed out.',
      409: 'Conflict. The resource already exists.',
      422: 'Validation error. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway.',
      503: 'Service unavailable.',
      504: 'Gateway timeout.',
    };
    return messages[status ?? 0] ?? `Request failed with status ${status}`;
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private logRequest(config: InternalAxiosRequestConfig): void {
    const log: RequestLog = {
      timestamp: new Date().toISOString(),
      method: config.method?.toUpperCase() ?? 'GET',
      url: config.url ?? '',
      headers: config.headers as Record<string, string>,
      data: config.data,
    };
    this.requestLogs.push(log);
    console.log(`[API Request] ${log.method} ${log.url}`, config.data ?? '');
  }

  private logResponse(response: AxiosResponse): void {
    const log: ResponseLog = {
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };
    this.responseLogs.push(log);
    console.log(`[API Response] ${response.status}`, response.data);
  }

  private logError(error: AxiosError): void {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      request: error.config
        ? {
            timestamp: new Date().toISOString(),
            method: error.config.method?.toUpperCase() ?? 'GET',
            url: error.config.url ?? '',
            headers: error.config.headers as Record<string, string>,
          }
        : undefined,
      response: error.response
        ? {
            timestamp: new Date().toISOString(),
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          }
        : undefined,
    };
    this.errorLogs.push(log);
    console.error('[API Error]', log);
  }

  getLogs(): {requests: RequestLog[]; responses: ResponseLog[]; errors: ErrorLog[]} {
    return {
      requests: [...this.requestLogs],
      responses: [...this.responseLogs],
      errors: [...this.errorLogs],
    };
  }

  clearLogs(): void {
    this.requestLogs = [];
    this.responseLogs = [];
    this.errorLogs = [];
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config).then(res => res.data);
  }

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config).then(res => res.data);
  }

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config).then(res => res.data);
  }

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config).then(res => res.data);
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config).then(res => res.data);
  }

  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = new ApiClient({baseURL});

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),
};

export {ApiClient};
export type {ApiClientConfig, EnhancedError};
