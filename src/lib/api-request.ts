import { notifyAuthRestriction } from "@/lib/notifications";

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
  let token: string;
  try {
    token = await getAccessToken();
  } catch (error) {
    notifyAuthRestriction(
      401,
      error instanceof Error
        ? error.message
        : "Your session could not be verified. Please sign in again.",
    );
    throw error;
  }

  const url = /^https?:\/\//i.test(path) ? path : `${API_URL}${path}`;
  const response = await sendWithToken(url, init, token);
  if (response.status === 403) {
    notifyAuthRestriction(403, "Your account does not have access to this resource.");
    return response;
  }
  if (response.status !== 401) return response;

  clearAccessToken();
  let refreshedToken: string;
  try {
    refreshedToken = await getAccessToken(true);
  } catch (error) {
    notifyAuthRestriction(
      401,
      error instanceof Error
        ? error.message
        : "Your session has expired. Please sign in again.",
    );
    throw error;
  }

  const refreshedResponse = await sendWithToken(url, init, refreshedToken);
  if (refreshedResponse.status === 401) {
    clearAccessToken();
    notifyAuthRestriction(401, "Your session has expired. Please sign in again.");
  } else if (refreshedResponse.status === 403) {
    notifyAuthRestriction(403, "Your account does not have access to this resource.");
  }
  return refreshedResponse;
}
