import { NextRequest, NextResponse } from 'next/server';
import { readConfig, readState, writeState } from '@/lib/fileStore';
import { endGame } from '@/lib/apiClient';

export async function POST(request: NextRequest) {
  try {
    const { phone, gameId } = await request.json();

    if (!phone || !gameId) {
      return NextResponse.json({ error: 'Phone and gameId are required' }, { status: 400 });
    }
    
    // Get account from config
    const config = await readConfig();
    const account = config.find(acc => acc.phone === phone);
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // End game and claim prize
    try {
      const result = await endGame(account.token, gameId);
      
      // Update state
      const state = await readState();
      if (state[phone]) {
        state[phone].status = 'prize_claimed';
        state[phone].lastChecked = new Date().toISOString();
        await writeState(state);
      }
      
      return NextResponse.json(result);
    } catch (error) {
      console.error(`Error ending game for ${phone}:`, error);
      
      // Update state with error
      const state = await readState();
      if (state[phone]) {
        state[phone].status = 'error';
        state[phone].error = error instanceof Error ? error.message : 'Unknown error';
        state[phone].lastChecked = new Date().toISOString();
        await writeState(state);
      }
      
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to end game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
