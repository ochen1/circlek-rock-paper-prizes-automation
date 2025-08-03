import fs from 'fs/promises';
import path from 'path';
import { AccountConfig, AccountState } from './types';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');
const STATE_PATH = path.join(process.cwd(), 'state.json');

// A simple in-memory lock to prevent race conditions on file writes
let isWriting = false;

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
    while (isWriting) {
        await new Promise(resolve => setTimeout(resolve, 50)); // wait if a write is in progress
    }
    isWriting = true;
    try {
        return await fn();
    } finally {
        isWriting = false;
    }
}

export async function readConfig(): Promise<AccountConfig[]> {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('config.json not found or invalid. Returning empty array.');
    return [];
  }
}

export async function writeConfig(config: AccountConfig[]): Promise<void> {
    return withLock(() => fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8'));
}

export async function readState(): Promise<Record<string, AccountState>> {
  try {
    const data = await fs.readFile(STATE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

export async function writeState(state: Record<string, AccountState>): Promise<void> {
    return withLock(() => fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2), 'utf-8'));
}
