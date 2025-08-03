import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig, readState, writeState } from '@/lib/fileStore';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    // Remove from config
    const config = await readConfig();
    const filteredConfig = config.filter(acc => acc.phone !== phone);
    await writeConfig(filteredConfig);

    // Remove from state
    const state = await readState();
    delete state[phone];
    await writeState(state);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
