import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig, readState, writeState } from '@/lib/fileStore';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Remove from config
    const config = await readConfig();
    const newConfig = config.filter(acc => acc.phone !== phone);
    
    if (newConfig.length === config.length) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    
    await writeConfig(newConfig);
    
    // Remove from state
    const state = await readState();
    const newState = { ...state };
    delete newState[phone];
    await writeState(newState);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
