const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TokenResponse = {
  success: boolean;
  data?: { accessToken: string; expiresAt: number };
  message?: string;
};

let accessToken = "";
let expiresAt = 0;
let tokenRequest: Promise<string> | null = null;

export function clearAccessToken() {
  accessToken = "";
  expiresAt = 0;
  tokenRequest = null;
}

async function getAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && accessToken && Date.now() < expiresAt - 30_000) return accessToken;
  if (!tokenRequest) {
    const request = fetch("/api/auth/token", { method: "POST", credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as TokenResponse;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Could not obtain an access token. Please sign in again.");
        }
        accessToken = result.data.accessToken;
        expiresAt = result.data.expiresAt;
        return accessToken;
      });
    tokenRequest = request;
    try {
      return await request;
    } finally {
      if (tokenRequest === request) tokenRequest = null;
    }
  }
  return tokenRequest;
}

async function sendWithToken(input: RequestInfo | URL, init: RequestInit, token: string) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers, credentials: "include" });
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const url = /^https?:\/\//i.test(path) ? path : `${API_URL}${path}`;
  const response = await sendWithToken(url, init, token);
  if (response.status !== 401) return response;

  clearAccessToken();
  const refreshedToken = await getAccessToken(true);
  return sendWithToken(url, init, refreshedToken);
}
