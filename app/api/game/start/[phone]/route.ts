import { NextRequest, NextResponse } from 'next/server';
import { readConfig, readState, writeState } from '@/lib/fileStore';
import { startGame } from '@/lib/apiClient';

interface RouteParams {
  params: {
    phone: string;
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const phone = decodeURIComponent(params.phone);
    
    // Get account from config
    const config = await readConfig();
    const account = config.find(acc => acc.phone === phone);
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Start game
    try {
      const state = await readState();
      const existing = state[phone] || {
        phone: account.phone,
        token: account.token,
        status: 'idle',
        lastChecked: null,
        prizes: [],
        note: account.note,
      };
      
      existing.status = 'checking';
      state[phone] = existing;
      await writeState(state);
      
      const gameResponse = await startGame(account.token);
      
      // Update state based on response
      if ('completed' in gameResponse && gameResponse.completed) {
        existing.status = 'cooldown';
        existing.cooldownUntil = gameResponse.time;
      } else {
        // It's a game start response - but we don't auto-claim anymore
        existing.status = 'prize_claimed';
        existing.lastPrize = gameResponse.prize.title;
      }
      
      existing.lastChecked = new Date().toISOString();
      state[phone] = existing;
      await writeState(state);
      
      return NextResponse.json(gameResponse);
    } catch (error) {
      console.error(`Error starting game for ${phone}:`, error);
      
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
    console.error('Failed to start game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
