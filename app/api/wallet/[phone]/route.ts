import { NextRequest, NextResponse } from 'next/server';
import { readConfig, readState, writeState } from '@/lib/fileStore';
import { getWallet } from '@/lib/apiClient';

export async function GET(request: NextRequest, { params }: {params: Promise<{phone: string}>}) {
  try {
    const phone = decodeURIComponent((await params).phone);
    
    // Get account from config
    const config = await readConfig();
    const account = config.find(acc => acc.phone === phone);
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Fetch wallet from API
    try {
      const walletResponse = await getWallet(account.token);
      
      // Update state with wallet
      const state = await readState();
      if (state[phone]) {
        state[phone].prizes = walletResponse.vouchers;
        state[phone].walletLink = walletResponse.walletLink;
        await writeState(state);
      }
      
      return NextResponse.json(walletResponse);
    } catch (error) {
      console.error(`Error fetching wallet for ${phone}:`, error);
      
      // Update state with error
      const state = await readState();
      if (state[phone]) {
        state[phone].error = error instanceof Error ? error.message : 'Unknown error';
        await writeState(state);
      }
      
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to get wallet:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
