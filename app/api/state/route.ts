import { NextResponse } from 'next/server';
import { readConfig, readState, writeState } from '@/lib/fileStore';
import { AccountState, GameStartResponse } from '@/lib/types';
import { startGame, endGame, getWallet } from '@/lib/apiClient';

// The main logic for processing accounts and playing the game
export async function GET() {
  const accountsConfig = await readConfig();
  const currentState = await readState();
  const newState: Record<string, AccountState> = {};

  const now = new Date();

  for (const acc of accountsConfig) {
    // Initialize state if not present
    const existingState = currentState[acc.phone] || {
      phone: acc.phone,
      token: acc.token,
      status: 'idle',
      lastChecked: null,
      prizes: [],
      note: acc.note, // propagate note from config
    };

    // Check if we are in a cooldown period
    if (existingState.cooldownUntil && new Date(existingState.cooldownUntil) > now) {
        newState[acc.phone] = { ...existingState, status: 'cooldown', note: acc.note };
        continue;
    }

    try {
      const gameResponse = await startGame(acc.token);

      // Check for cooldown response
      if ('completed' in gameResponse && gameResponse.completed === true) {
        newState[acc.phone] = {
          ...existingState,
          status: 'cooldown',
          lastChecked: now.toISOString(),
          // Set cooldown for 24 hours from now
          cooldownUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          note: acc.note,
        };
      } 
      // Check for a successful game start (a win)
      else if ('game_id' in gameResponse) {
        const win = gameResponse as GameStartResponse;
        await endGame(acc.token, win.game_id);
        const wallet = await getWallet(acc.token);

        newState[acc.phone] = {
          ...existingState,
          status: 'prize_claimed',
          lastChecked: now.toISOString(),
          lastPrize: win.prize.title,
          prizes: wallet.vouchers,
          cooldownUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          note: acc.note,
        };
      }
    } catch (error: any) {
      console.error(`Error processing account ${acc.phone}:`, error);
      newState[acc.phone] = {
        ...existingState,
        status: 'error',
        lastChecked: now.toISOString(),
        error: error.message || 'An unknown error occurred',
        note: acc.note,
      };
    }
  }

  await writeState(newState);
  return NextResponse.json(Object.values(newState));
}
