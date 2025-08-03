import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig } from '@/lib/fileStore';

export async function POST(request: NextRequest) {
  try {
    const { phone, token, note } = await request.json();

    if (!phone || !token) {
      return NextResponse.json({ error: 'Phone and token are required' }, { status: 400 });
    }

    const config = await readConfig();
    
    if (config.some(acc => acc.phone === phone)) {
        return NextResponse.json({ error: 'An account with this phone number already exists' }, { status: 409 });
    }

    config.push({ phone, token, note });
    await writeConfig(config);

    return NextResponse.json({ success: true, message: 'Account added successfully' });
  } catch (error) {
    console.error('Failed to add account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
