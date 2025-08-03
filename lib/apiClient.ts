import { GameStartResponse, CooldownResponse, WalletListResponse, HubResponse } from './types';

const API_URL = 'https://api.mgame.nu/server-2025-rpp-na-circlek/server.php';

const COMMON_HEADERS = {
  'accept': '*/*',
  'accept-language': 'en-US,en;q=0.9',
  'bm-country': 'ca',
  'content-type': 'application/json',
  'origin': 'https://rockpaperprizes.com',
  'referer': 'https://rockpaperprizes.com/',
  'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Linux"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
};

async function postRequest<T>(payload: object): Promise<T> {
  console.log(`[API] Request:`, { route: (payload as any).route, data: (payload as any).data });
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: COMMON_HEADERS,
    body: JSON.stringify(payload),
    // Caching disabled to ensure we always get fresh data from the game server
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API] Error response for route ${(payload as any).route}:`, response.status, errorText);
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }
  const json = await response.json();
  console.log(`[API] Response:`, {
    route: (payload as any).route,
    status: response.status,
    response: json,
  });
  return json as T;
}

export async function startGame(session: string) {
  const payload = {
    route: 'game_start',
    data: { type: 'rpp', name: 'default', session },
  };
  return postRequest<GameStartResponse | CooldownResponse>(payload);
}

export async function endGame(session: string, game_id: string) {
  const payload = {
    route: 'game_end',
    data: { type: 'rpp', name: 'default', session, game_id, playtime: null },
  };
  return postRequest<{ success: boolean }>(payload);
}

export async function getWallet(session: string) {
  const payload = {
    route: 'wallet_list',
    data: { session, name: 'default', getLink: true },
  };
  return postRequest<WalletListResponse>(payload);
}

export async function getHub(session: string) {
  const payload = {
    route: 'hub',
    data: { session, name: 'default' },
  };
  return postRequest<HubResponse>(payload);
}
