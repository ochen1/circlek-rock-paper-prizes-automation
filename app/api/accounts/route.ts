import { NextResponse } from 'next/server';
import { readConfig, readState } from '@/lib/fileStore';
import { AccountState } from '@/lib/types';

export async function GET() {
  try {
    const config = await readConfig();
    const state = await readState();
    
    // Map config accounts to state or create minimal state if not found
    const accounts: AccountState[] = config.map(account => {
      const existingState = state[account.phone];
      if (existingState) {
        // Ensure token and note are up-to-date from config
        return {
          ...existingState,
          token: account.token,
          note: account.note
        };
      } else {
        // Create minimal state for new accounts
        return {
          phone: account.phone,
          token: account.token,
          note: account.note,
          status: 'idle',
          lastChecked: null,
          prizes: []
        };
      }
    });
    
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to get accounts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
