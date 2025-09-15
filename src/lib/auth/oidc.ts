/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE_URL = `${process.env.KEYCLOAK_ISSUER}/clients-registrations/openid-connect`;

// Correct base URL for token/refresh/logout

const oidcFetch = async (endpoint: string, body: URLSearchParams) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OIDC ${endpoint} failed: ${response.status} - ${err}`);
  }

  return response.json();
};

// 🔄 Handle refresh token
export async function refreshTokenRequest(refresh_token: string) {
  const TOKEN_URL = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      refresh_token,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function logoutRequest(refresh_token: string) {
  const LOGOUT_URL = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`;
  await fetch(LOGOUT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      refresh_token,
    }),
  });
}




  
