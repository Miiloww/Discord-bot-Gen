import { Account } from '../types';

export function generateAccountId(): string {
  return `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export function parseAccountsFromText(text: string): Account[] {
  const lines = text.split('\n').filter(line => line.trim());
  const accounts: Account[] = [];
  
  for (const line of lines) {
    const parts = line.trim().split(':');
    if (parts.length === 2) {
      accounts.push({
        id: generateAccountId(),
        email: parts[0].trim(),
        password: parts[1].trim(),
        isUsed: false
      });
    }
  }
  
  return accounts;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}j ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function parseCooldownTime(input: string): number | null {
  const match = input.match(/^(\d+)([smhj])$/);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'j': return value * 24 * 60 * 60 * 1000;
    default: return null;
  }
}
