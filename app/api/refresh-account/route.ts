import { NextRequest, NextResponse } from 'next/server';
import { readConfig, readState, writeState } from '@/lib/fileStore';
import { startGame, endGame, getWallet, getHub } from '@/lib/apiClient';
import { GameStartResponse, CooldownResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const config = await readConfig();
    const account = config.find(acc => acc.phone === phone);
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const currentState = await readState();
    const existing = currentState[phone] || {
      phone: account.phone,
      token: account.token,
      status: 'idle' as const,
      lastChecked: null,
      prizes: [],
      note: account.note,
    };

    try {
      existing.status = 'checking';
      
      // Get hub stats first to check for daily cooldown
      const hubResponse = await getHub(account.token);
      existing.hubStats = hubResponse;

      if (hubResponse.played_today) {
        existing.status = 'cooldown';
        existing.cooldownUntil = hubResponse.tomorrow;
      } else {
        // Not played today, so try to start a game
        const gameResponse = await startGame(account.token);
        
        // This case should be rare now, but good to keep as a fallback
        if ('completed' in gameResponse && gameResponse.completed) {
          const cooldownResp = gameResponse as CooldownResponse;
          existing.status = 'cooldown';
          existing.cooldownUntil = cooldownResp.time;
        } else {
          // It's a game start response - claim the prize
          const gameStartResp = gameResponse as GameStartResponse;
          await endGame(account.token, gameStartResp.game_id);
          existing.status = 'prize_claimed';
          existing.lastPrize = gameStartResp.prize.title;
        }
      }

      // Always check wallet for prizes
      const walletResponse = await getWallet(account.token);
      existing.prizes = walletResponse.vouchers;
      existing.walletLink = walletResponse.walletLink;
      
      existing.lastChecked = new Date().toISOString();
      existing.error = undefined;
      
    } catch (error) {
      existing.status = 'error';
      existing.error = error instanceof Error ? error.message : 'Unknown error';
      existing.lastChecked = new Date().toISOString();
    }

    currentState[phone] = existing;
    await writeState(currentState);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to refresh account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
