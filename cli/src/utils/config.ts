import Configstore from 'configstore';
import path from 'path';
import os from 'os';

const packageJson = require('../../package.json');

// Default configuration values
const DEFAULT_CONFIG = {
  apiUrl: process.env.SNIPVAULT_API_URL || 'https://api.snipvault.com',
  defaultLanguage: 'javascript',
  defaultVisibility: 'public',
  outputFormat: 'table',
  syntaxHighlight: true,
  pageSize: 20,
  editor: process.env.EDITOR || 'vim',
  theme: 'default'
};

let configInstance: Configstore | null = null;

/**
 * Get the configuration store instance
 */
export function getConfig(): Configstore {
  if (!configInstance) {
    configInstance = new Configstore(packageJson.name, DEFAULT_CONFIG, {
      globalConfigPath: true
    });
  }
  return configInstance;
}

/**
 * Get a specific configuration value
 */
export function getConfigValue<T = any>(key: string, defaultValue?: T): T {
  const config = getConfig();
  return config.get(key, defaultValue) as T;
}

/**
 * Set a configuration value
 */
export function setConfig(key: string, value: any): void {
  const config = getConfig();
  config.set(key, value);
}

/**
 * Get all configuration values
 */
export function getAllConfig(): Record<string, any> {
  const config = getConfig();
  return config.all;
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(key?: string): void {
  const config = getConfig();
  
  if (key) {
    if (key in DEFAULT_CONFIG) {
      config.set(key, DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG]);
    } else {
      config.delete(key);
    }
  } else {
    // Reset all config
    config.clear();
    Object.entries(DEFAULT_CONFIG).forEach(([k, v]) => {
      config.set(k, v);
    });
  }
}

/**
 * Get the configuration file path
 */
export function getConfigPath(): string {
  const config = getConfig();
  return config.path;
}

/**
 * Export configuration to file
 */
export async function exportConfig(filePath: string): Promise<void> {
  const fs = await import('fs/promises');
  const config = getAllConfig();
  
  // Remove sensitive data
  const exportData = { ...config };
  delete exportData.authToken;
  delete exportData.refreshToken;
  delete exportData.encryptionKey;
  
  await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
}

/**
 * Import configuration from file
 */
export async function importConfig(filePath: string): Promise<void> {
  const fs = await import('fs/promises');
  const data = await fs.readFile(filePath, 'utf-8');
  const importedConfig = JSON.parse(data);
  
  // Validate and set each config value
  Object.entries(importedConfig).forEach(([key, value]) => {
    // Skip sensitive keys
    if (['authToken', 'refreshToken', 'encryptionKey'].includes(key)) {
      return;
    }
    setConfig(key, value);
  });
}

/**
 * Get cache directory for CLI
 */
export function getCacheDir(): string {
  const cacheDir = path.join(os.homedir(), '.cache', 'snipvault-cli');
  return cacheDir;
}

/**
 * Get data directory for CLI
 */
export function getDataDir(): string {
  const dataDir = path.join(os.homedir(), '.local', 'share', 'snipvault-cli');
  return dataDir;
}