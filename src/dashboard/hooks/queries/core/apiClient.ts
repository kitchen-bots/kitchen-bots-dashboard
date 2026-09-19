import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create central API client
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Inject auth token here in the future
    const token = localStorage.getItem('kb_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data; // Unwrap data natively
  },
  (error: AxiosError) => {
    // Normalise error formats
    const standardError = {
      message: (error.response?.data as any)?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
    };
    
    // Global 401 handler could go here (e.g. redirect to login)
    if (standardError.status === 401) {
      // Handle logout
    }

    return Promise.reject(standardError);
  }
);
