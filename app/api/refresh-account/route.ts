import { NextRequest, NextResponse } from 'next/server';
import { readConfig, readState, writeState } from '@/lib/fileStore';
import { AccountState } from '@/lib/types';
import { startGame, endGame, getWallet } from '@/lib/apiClient';

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    const config = await readConfig();
    const account = config.find(acc => acc.phone === phone);
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    
    // Get current state
    const currentState = await readState();
    const existingState = currentState[phone] || {
      phone: account.phone,
      token: account.token,
      status: 'idle',
      lastChecked: null,
      prizes: [],
      note: account.note,
    };
    
    // Update state to checking
    currentState[phone] = {
      ...existingState,
      status: 'checking',
      lastChecked: new Date().toISOString(),
    };
    await writeState(currentState);
    
    // Process this account
    const now = new Date();
    const newState = { ...currentState };
    
    try {
      const gameResponse = await startGame(account.token);

      // Check for cooldown response
      if ('completed' in gameResponse && gameResponse.completed === true) {
        newState[phone] = {
          ...existingState,
          status: 'cooldown',
          lastChecked: now.toISOString(),
          // Set cooldown for 24 hours from now
          cooldownUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          note: account.note,
        };
      } 
      // Check for a successful game start (a win)
      else if ('game_id' in gameResponse) {
        await endGame(account.token, gameResponse.game_id);
        const wallet = await getWallet(account.token);

        newState[phone] = {
          ...existingState,
          status: 'prize_claimed',
          lastChecked: now.toISOString(),
          lastPrize: gameResponse.prize.title,
          prizes: wallet.vouchers,
          cooldownUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          note: account.note,
        };
      }
    } catch (error: any) {
      console.error(`Error processing account ${phone}:`, error);
      newState[phone] = {
        ...existingState,
        status: 'error',
        lastChecked: now.toISOString(),
        error: error.message || 'An unknown error occurred',
        note: account.note,
      };
    }
    
    await writeState(newState);
    return NextResponse.json(Object.values(newState));
    
  } catch (error) {
    console.error('Failed to refresh account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
