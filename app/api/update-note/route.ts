import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig } from '@/lib/fileStore';

export async function POST(request: NextRequest) {
  try {
    const { phone, note } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const config = await readConfig();
    const accountIndex = config.findIndex(acc => acc.phone === phone);
    
    if (accountIndex === -1) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    config[accountIndex].note = note;
    await writeConfig(config);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
