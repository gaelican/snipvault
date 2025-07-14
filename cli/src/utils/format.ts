import chalk from 'chalk';
import Table from 'cli-table3';

export interface FormatOptions {
  format?: 'table' | 'json' | 'raw';
  fields?: string[];
  noColor?: boolean;
}

/**
 * Format data for output based on the specified format
 */
export function formatOutput(data: any, options: FormatOptions = {}): string {
  const { format = 'table', fields, noColor } = options;
  
  if (noColor) {
    chalk.level = 0;
  }
  
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
      
    case 'raw':
      return formatRaw(data, fields);
      
    case 'table':
    default:
      return formatTable(data, fields);
  }
}

/**
 * Format data as a table
 */
function formatTable(data: any, fields?: string[]): string {
  if (!Array.isArray(data)) {
    data = [data];
  }
  
  if (data.length === 0) {
    return chalk.yellow('No data to display');
  }
  
  // Determine fields to display
  const availableFields = Object.keys(data[0]);
  const displayFields = fields || availableFields;
  
  const table = new Table({
    head: displayFields.map(f => chalk.cyan(f)),
    style: { 
      head: [],
      border: []
    }
  });
  
  data.forEach((item: any) => {
    const row = displayFields.map(field => {
      const value = item[field];
      if (value === null || value === undefined) {
        return chalk.gray('N/A');
      }
      if (typeof value === 'boolean') {
        return value ? chalk.green('Yes') : chalk.red('No');
      }
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    });
    table.push(row);
  });
  
  return table.toString();
}

/**
 * Format data as raw text
 */
function formatRaw(data: any, fields?: string[]): string {
  if (!Array.isArray(data)) {
    data = [data];
  }
  
  return data.map((item: any) => {
    if (fields) {
      return fields.map(field => item[field] || '').join('\t');
    }
    return Object.values(item).join('\t');
  }).join('\n');
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration to human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}