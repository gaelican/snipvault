import { getConfig, setConfig } from './config';
import crypto from 'crypto';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_EXPIRES_KEY = 'authExpires';

/**
 * Save authentication token
 */
export function saveAuthToken(token: string, refreshToken?: string, expiresIn?: number): void {
  const config = getConfig();
  
  // Encrypt token for storage (basic encryption, can be enhanced)
  const encrypted = encryptToken(token);
  config.set(AUTH_TOKEN_KEY, encrypted);
  
  if (refreshToken) {
    const encryptedRefresh = encryptToken(refreshToken);
    config.set(AUTH_REFRESH_TOKEN_KEY, encryptedRefresh);
  }
  
  if (expiresIn) {
    const expiresAt = Date.now() + (expiresIn * 1000);
    config.set(AUTH_EXPIRES_KEY, expiresAt);
  }
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  const config = getConfig();
  const encrypted = config.get(AUTH_TOKEN_KEY);
  
  if (!encrypted) {
    return null;
  }
  
  // Check if token is expired
  const expiresAt = config.get(AUTH_EXPIRES_KEY);
  if (expiresAt && Date.now() > expiresAt) {
    // Token expired, clear it
    clearAuthToken();
    return null;
  }
  
  try {
    return decryptToken(encrypted);
  } catch {
    // Failed to decrypt, clear invalid token
    clearAuthToken();
    return null;
  }
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  const config = getConfig();
  const encrypted = config.get(AUTH_REFRESH_TOKEN_KEY);
  
  if (!encrypted) {
    return null;
  }
  
  try {
    return decryptToken(encrypted);
  } catch {
    return null;
  }
}

/**
 * Clear authentication tokens
 */
export function clearAuthToken(): void {
  const config = getConfig();
  config.delete(AUTH_TOKEN_KEY);
  config.delete(AUTH_REFRESH_TOKEN_KEY);
  config.delete(AUTH_EXPIRES_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Basic token encryption (can be enhanced with proper key management)
 */
function encryptToken(token: string): string {
  const algorithm = 'aes-256-cbc';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Basic token decryption
 */
function decryptToken(encrypted: string): string {
  const algorithm = 'aes-256-cbc';
  const key = getEncryptionKey();
  
  const parts = encrypted.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted token format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedData = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Get or generate encryption key
 */
function getEncryptionKey(): Buffer {
  const config = getConfig();
  let keyHex = config.get('encryptionKey');
  
  if (!keyHex) {
    // Generate new key
    const key = crypto.randomBytes(32);
    keyHex = key.toString('hex');
    config.set('encryptionKey', keyHex);
  }
  
  return Buffer.from(keyHex, 'hex');
}

/**
 * Refresh authentication token
 */
export async function refreshAuthToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }
  
  try {
    // This would call your API to refresh the token
    // For now, we'll return false as the implementation depends on your API
    return false;
  } catch {
    return false;
  }
}