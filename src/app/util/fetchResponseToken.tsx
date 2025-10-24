"use client";
import { useEffect, useState } from "react";

// Define the AuthResponse type according to your API response structure
type AuthResponse = {
  access_token: string;
  [key: string]: unknown;
};

export default function FetchResponseToken(): AuthResponse | null {
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
  useEffect(() => {
    const fetchProtected = async () => {
      try {
        const res = await fetch(
          "https://api.docuhub.me/api/v1/auth/protected-endpoint",
          { method: "GET", credentials: "include" }
        );
        const body: AuthResponse = await res.json();
        setAuthResponse(body);

        // Redirect after fetching
      } catch (err) {}
    };

    fetchProtected();
  }, [authResponse?.access_token]);
  return authResponse;
}
