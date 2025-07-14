import axios, { AxiosInstance, AxiosError } from 'axios';
import { getAuthToken } from './auth';
import { getConfig } from './config';

class APIClient {
  private client: AxiosInstance;
  
  constructor() {
    const config = getConfig();
    const baseURL = config.get('apiUrl') || process.env.SNIPVAULT_API_URL || 'https://api.snipvault.com';
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SnipVault-CLI/1.0.0'
      }
    });
    
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          
          if (status === 401) {
            // Unauthorized - token might be expired
            throw new Error('Authentication failed. Please login again.');
          } else if (status === 403) {
            throw new Error('You do not have permission to perform this action.');
          } else if (status === 404) {
            throw new Error('Resource not found.');
          } else if (status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          } else if (status >= 500) {
            throw new Error('Server error. Please try again later.');
          }
          
          // Use server-provided error message if available
          if (data && typeof data === 'object' && 'message' in data) {
            throw new Error((data as any).message);
          }
        } else if (error.request) {
          // Request made but no response received
          throw new Error('Network error. Please check your internet connection.');
        }
        
        throw error;
      }
    );
  }
  
  async get(url: string, config?: any) {
    return this.client.get(url, config);
  }
  
  async post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config);
  }
  
  async put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config);
  }
  
  async patch(url: string, data?: any, config?: any) {
    return this.client.patch(url, data, config);
  }
  
  async delete(url: string, config?: any) {
    return this.client.delete(url, config);
  }
}

// Export singleton instance
export const apiClient = new APIClient();