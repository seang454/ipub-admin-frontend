import { RegisterRequest } from "../../../types/userAuth";


// src/lib/auth/keycloak.ts
export async function getAdminToken(): Promise<string> {
  const res = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
    }),
  });

  const data = await res.json();
  // console.log('data in real key api :>> ', data);
  return data.access_token;
}

export async function registerKeycloakUser(token: string, user: RegisterRequest) {
  return fetch(`${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: user.password,
          temporary: false,
        },
      ],
    }),
  });
}

export async function GetUser(email:string, token: string) {
  return fetch(`${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${encodeURIComponent(email)}`, {
    headers: {
      method: 'GET',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function GetAllUser(token: string) {
  return fetch(`${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`, {
    headers: {
      method: 'GET',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}
