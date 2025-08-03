// Represents a single account from config.json
export interface AccountConfig {
  phone: string;
  token: string;
  note?: string;
}

// Represents a prize/voucher from the API
export interface Voucher {
  id: string;
  title:string;
  expires: string;
  created: string;
  sprite: string;
}

// Represents the full state of an account, combining config and live data
export interface AccountState {
  phone: string;
  token: string;
  status: 'idle' | 'cooldown' | 'prize_claimed' | 'error' | 'checking';
  lastChecked: string | null;
  lastPrize?: string;
  cooldownUntil?: string;
  prizes: Voucher[];
  walletLink?: string;
  error?: string;
  note?: string;
}

// API Response Types for the external game server
export interface GameStartResponse {
  videokey: string;
  prize: {
    title: string;
    sprite: string;
  };
  game_id: string;
  time: string;
  turn: {
    current: number;
    max: number;
  };
}

export interface CooldownResponse {
    completed: boolean;
    game_id: string;
    prize: {
        title: string;
        sprite: string;
    };
    time: string;
}

export interface WalletListResponse {
    vouchers: Voucher[];
    walletLink: string;
}
