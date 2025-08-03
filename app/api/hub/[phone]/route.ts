import { NextRequest, NextResponse } from 'next/server';
import { readConfig, readState, writeState } from '@/lib/fileStore';
import { getHub } from '@/lib/apiClient';

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

    // Fetch hub stats from API
    try {
      const hubResponse = await getHub(account.token);
      
      // Update state with hub stats
      const state = await readState();
      if (state[phone]) {
        state[phone].hubStats = hubResponse;
        state[phone].lastChecked = new Date().toISOString();
        if (hubResponse.played_today) {
          state[phone].status = 'cooldown';
          state[phone].cooldownUntil = hubResponse.tomorrow;
        }
        await writeState(state);
      }
      
      return NextResponse.json(hubResponse);
    } catch (error) {
      console.error(`Error fetching hub for ${phone}:`, error);
      
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
    console.error('Failed to get hub stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
