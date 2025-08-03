import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig, readState, writeState } from '@/lib/fileStore';

export async function POST(request: NextRequest) {
  try {
    const { phone, note } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Update config
    const config = await readConfig();
    const idx = config.findIndex(acc => acc.phone === phone);
    if (idx === -1) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    config[idx].note = note;
    await writeConfig(config);

    // Update state (if present)
    const state = await readState();
    if (state[phone]) {
      state[phone].note = note;
      await writeState(state);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
