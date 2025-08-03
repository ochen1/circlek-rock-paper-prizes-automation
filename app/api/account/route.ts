import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig, readState, writeState } from '@/lib/fileStore';

// POST: Add a new account
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

// PUT: Update an existing account
export async function PUT(request: NextRequest) {
  try {
    const { oldPhone, newPhone, token, note } = await request.json();

    if (!oldPhone || !newPhone || !token) {
      return NextResponse.json({ error: 'Old phone, new phone, and token are required' }, { status: 400 });
    }

    const config = await readConfig();
    const accountIndex = config.findIndex(acc => acc.phone === oldPhone);
    
    if (accountIndex === -1) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if new phone number already exists (and it's not the same account)
    if (oldPhone !== newPhone && config.some(acc => acc.phone === newPhone)) {
      return NextResponse.json({ error: 'An account with the new phone number already exists' }, { status: 409 });
    }

    // Update config
    config[accountIndex] = { phone: newPhone, token, note };
    await writeConfig(config);

    // If phone number changed, update state file
    if (oldPhone !== newPhone) {
      const state = await readState();
      if (state[oldPhone]) {
        state[newPhone] = { ...state[oldPhone], phone: newPhone, token, note };
        delete state[oldPhone];
        await writeState(state);
      }
    }

    return NextResponse.json({ success: true, message: 'Account updated successfully' });
  } catch (error) {
    console.error('Failed to update account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete an account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    // Remove from config
    const config = await readConfig();
    const filteredConfig = config.filter(acc => acc.phone !== phone);
    
    if (config.length === filteredConfig.length) {
      // To be safe, though the frontend shouldn't allow this.
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    await writeConfig(filteredConfig);

    // Remove from state
    const state = await readState();
    if (state[phone]) {
      delete state[phone];
      await writeState(state);
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
